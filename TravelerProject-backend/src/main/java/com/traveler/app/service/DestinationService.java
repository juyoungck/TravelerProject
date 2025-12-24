package com.traveler.app.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.DestinationDao;
import com.traveler.app.dto.DestinationDto;
import com.traveler.app.entity.Destination;

import lombok.extern.slf4j.Slf4j;

/**
 * 여행지 관리 서비스
 * API에서 가져온 여행지 데이터를 DB에 저장/조회
 */
@Service
@Slf4j
public class DestinationService {

    private final TourApiService tourApiService;
    private final DestinationDao destinationDao;

    /** 관광타입 목록 (반려동물 제외) */
    private static final Map<String, String> CONTENT_TYPES = new HashMap<>();
    
    static {
        CONTENT_TYPES.put("12", "관광지");
        CONTENT_TYPES.put("14", "문화시설");
        CONTENT_TYPES.put("15", "축제공연행사");
        CONTENT_TYPES.put("25", "여행코스");
        CONTENT_TYPES.put("28", "레포츠");
        CONTENT_TYPES.put("32", "숙박");
        CONTENT_TYPES.put("38", "쇼핑");
        CONTENT_TYPES.put("39", "음식점");
    }

    public DestinationService(TourApiService tourApiService, DestinationDao destinationDao) {
        this.tourApiService = tourApiService;
        this.destinationDao = destinationDao;
    }
    
    /**
     * API에서 해당 관광타입의 총 데이터 개수 조회
     */
    public int getApiTotalCount(String contenttypeid) {
        return tourApiService.fetchDestinationTotalCount(contenttypeid);
    }

    /**
     * 특정 관광타입 여행지 동기화
     * @param contenttypeid 관광타입ID
     * @param startPage 시작 페이지 (1부터 시작)
     * @param endPage 끝 페이지
     * @return 저장된 건수
     */
    @Transactional
    public int syncDestinationsByType(String contenttypeid, int startPage, int endPage) {
        String typeName = CONTENT_TYPES.getOrDefault(contenttypeid, "알수없음");
        log.info("========== [{}] 여행지 동기화 시작 (페이지 {}-{}) ==========", typeName, startPage, endPage);

        int savedCount = 0;
        int numOfRows = 100;  // 한 페이지당 100건

        for (int pageNo = startPage; pageNo <= endPage; pageNo++) {
            // API 호출
            List<DestinationDto> destinations = tourApiService.fetchDestinations(contenttypeid, pageNo, numOfRows);

            // 더 이상 데이터가 없으면 종료
            if (destinations.isEmpty()) {
                log.info("더 이상 데이터가 없습니다. (페이지: {})", pageNo);
                break;
            }

            // DB 저장
            for (DestinationDto dto : destinations) {
                try {
                    Destination destination = convertToEntity(dto);
                    destinationDao.mergeDestination(destination);
                    savedCount++;
                } catch (Exception e) {
                    log.error("여행지 저장 실패 (contentid: {}): {}", dto.getContentid(), e.getMessage());
                }
            }

            log.info("[{}] 페이지 {} 완료 - 총 {}건 저장됨", typeName, pageNo, savedCount);

            // API 호출 간격 조절 (과부하 방지)
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        log.info("========== [{}] 여행지 동기화 완료: {}건 ==========", typeName, savedCount);
        return savedCount;
    }

    /**
     * 전체 관광타입 여행지 동기화 (페이지 기반)
     * @param maxPagesPerType 타입당 최대 페이지 수
     * @return 타입별 저장 건수
     */
    @Transactional
    public Map<String, Integer> syncAllDestinations(int maxPagesPerType) {
        log.info("========== 전체 여행지 동기화 시작 (타입당 최대 {}페이지) ==========", maxPagesPerType);

        Map<String, Integer> result = new HashMap<>();
        int totalCount = 0;

        for (Map.Entry<String, String> entry : CONTENT_TYPES.entrySet()) {
            String typeId = entry.getKey();
            String typeName = entry.getValue();

            int count = syncDestinationsByType(typeId, 1, maxPagesPerType);
            result.put(typeName, count);
            totalCount += count;

            // 타입 간 API 호출 간격
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        result.put("총합계", totalCount);
        log.info("========== 전체 여행지 동기화 완료: 총 {}건 ==========", totalCount);
        return result;
    }
    
    /**
     * 변경된 여행지만 동기화 (어제 이후 수정된 데이터)
     * @return 업데이트된 건수
     */
    @Transactional
    public int syncModifiedDestinations() {
        // 어제 날짜 계산 (yyyyMMdd 형식)
        String yesterday = java.time.LocalDate.now()
                .minusDays(1)
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        log.info("========== 변경 데이터 동기화 시작 (기준일: {}) ==========", yesterday);

        int savedCount = 0;
        int pageNo = 1;
        int numOfRows = 100;

        // 먼저 총 개수 확인
        int totalCount = tourApiService.fetchModifiedTotalCount(yesterday);
        log.info("변경된 데이터 총 개수: {}건", totalCount);

        if (totalCount == 0) {
            log.info("변경된 데이터가 없습니다.");
            return 0;
        }

        // 모든 페이지 조회
        while (true) {
            List<DestinationDto> destinations = tourApiService.fetchModifiedDestinations(yesterday, pageNo, numOfRows);

            if (destinations.isEmpty()) {
                break;
            }

            for (DestinationDto dto : destinations) {
                try {
                    Destination destination = convertToEntity(dto);
                    destinationDao.mergeDestination(destination);
                    savedCount++;
                } catch (Exception e) {
                    log.error("여행지 저장 실패 (contentid: {}): {}", dto.getContentid(), e.getMessage());
                }
            }

            log.info("페이지 {} 완료 - 총 {}건 저장됨", pageNo, savedCount);
            pageNo++;

            // API 호출 간격
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        log.info("========== 변경 데이터 동기화 완료: {}건 ==========", savedCount);
        return savedCount;
    }

    /**
     * DTO → Entity 변환
     */
    private Destination convertToEntity(DestinationDto dto) {
        return Destination.builder()
                .contentid(dto.getContentid())
                .contenttypeid(dto.getContenttypeid())
                .title(dto.getTitle())
                .tel(dto.getTel())
                .addr1(dto.getAddr1())
                .addr2(dto.getAddr2())
                .zipcode(dto.getZipcode())
                .lDongRegnCd(dto.getLDongRegnCd())
                .lDongSignguCd(dto.getLDongSignguCd())
                .mapx(parseDouble(dto.getMapx()))
                .mapy(parseDouble(dto.getMapy()))
                .mlevel(parseInteger(dto.getMlevel()))
                .firstimage(dto.getFirstimage())
                .firstimage2(dto.getFirstimage2())
                .modifiedtime(dto.getModifiedtime())
                .build();
    }

    /**
     * 문자열 → Double 변환 (null 처리)
     */
    private Double parseDouble(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 문자열 → Integer 변환 (null 처리)
     */
    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 여행지 현황 조회
     */
    public Map<String, Object> getDestinationStatus() {
        Map<String, Object> status = new HashMap<>();
        
        status.put("total", destinationDao.countDestination());
        
        for (Map.Entry<String, String> entry : CONTENT_TYPES.entrySet()) {
            int count = destinationDao.countDestinationByType(entry.getKey());
            status.put(entry.getValue(), count);
        }
        
        return status;
    }

    /**
     * 여행지 목록 조회 (관광타입별)
     */
    public List<Destination> getDestinationsByType(String contenttypeid) {
        return destinationDao.selectDestinationsByType(contenttypeid);
    }

    /**
     * 여행지 상세 조회
     */
    public Destination getDestinationById(String contentid) {
        return destinationDao.selectDestinationById(contentid);
    }

    /**
     * 관광타입 목록 반환
     */
    public Map<String, String> getContentTypes() {
        return CONTENT_TYPES;
    }
}