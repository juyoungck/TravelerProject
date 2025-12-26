package com.traveler.app.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.traveler.app.dao.DestinationDao;
import com.traveler.app.dao.DestinationImageDao;
import com.traveler.app.dto.DestinationDetailDto;
import com.traveler.app.dto.DestinationDto;
import com.traveler.app.dto.DestinationImageDto;
import com.traveler.app.entity.Destination;
import com.traveler.app.entity.DestinationImage;

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
    private final DestinationImageDao destinationImageDao;
    private final RestTemplate restTemplate;

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

    public DestinationService(TourApiService tourApiService, DestinationDao destinationDao, 
            DestinationImageDao destinationImageDao, RestTemplate restTemplate) {
        this.tourApiService = tourApiService;
        this.destinationDao = destinationDao;
        this.destinationImageDao = destinationImageDao;
        this.restTemplate = restTemplate;
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
     * 특정 날짜 기준 변경된 여행지 동기화 (테스트용)
     * @param date 날짜 (yyyyMMdd 형식)
     * @return 업데이트된 건수
     */
    @Transactional
    public int syncModifiedDestinationsByDate(String date) {
        log.info("========== 변경 데이터 동기화 시작 (기준일: {}) ==========", date);

        int savedCount = 0;
        int pageNo = 1;
        int numOfRows = 100;

        // 먼저 총 개수 확인
        int totalCount = tourApiService.fetchModifiedTotalCount(date);
        log.info("변경된 데이터 총 개수: {}건", totalCount);

        if (totalCount == 0) {
            log.info("변경된 데이터가 없습니다.");
            return 0;
        }

        // 모든 페이지 조회
        while (true) {
            List<DestinationDto> destinations = tourApiService.fetchModifiedDestinations(date, pageNo, numOfRows);

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
    
    /**
     * 상세정보 수집 (overview, homepage)
     * @param startIndex 시작 인덱스 (1부터)
     * @param endIndex 끝 인덱스
     * @return 저장된 건수
     */
    @Transactional
    public int syncDestinationDetails(int startIndex, int endIndex) {
        log.info("========== 상세정보 수집 시작 ({}~{}번째) ==========", startIndex, endIndex);

        int savedCount = 0;

        List<Destination> destinations = destinationDao.selectDestinationsByRange(startIndex, endIndex);
        log.info("조회된 여행지: {}건", destinations.size());

        for (Destination dest : destinations) {
            try {
                DestinationDetailDto detail = tourApiService.fetchDestinationDetail(dest.getContentid());
                
                if (detail != null) {
                    destinationDao.updateDestinationDetail(
                            dest.getContentid(),
                            detail.getOverview(),
                            detail.getHomepage()
                    );
                    savedCount++;
                    
                    if (savedCount % 100 == 0) {
                        log.info("상세정보 진행 중... {}건 완료", savedCount);
                    }
                }

                // API 호출 간격
                Thread.sleep(50);

            } catch (Exception e) {
                log.error("상세정보 저장 실패 (contentid: {}): {}", dest.getContentid(), e.getMessage());
            }
        }

        log.info("========== 상세정보 수집 완료: {}건 ==========", savedCount);
        return savedCount;
    }

    /**
     * 이미지 목록 수집
     * @param startIndex 시작 인덱스 (1부터)
     * @param endIndex 끝 인덱스
     * @return 처리된 여행지 수
     */
    @Transactional
    public int syncDestinationImages(int startIndex, int endIndex) {
        log.info("========== 이미지 수집 시작 ({}~{}번째) ==========", startIndex, endIndex);

        int processedCount = 0;
        int imageCount = 0;

        List<Destination> destinations = destinationDao.selectDestinationsByRange(startIndex, endIndex);
        log.info("조회된 여행지: {}건", destinations.size());

        for (Destination dest : destinations) {
            try {
                List<DestinationImageDto> images = tourApiService.fetchDestinationImages(dest.getContentid());
                
                for (DestinationImageDto imgDto : images) {
                    DestinationImage image = DestinationImage.builder()
                            .contentid(imgDto.getContentid())
                            .originimgurl(imgDto.getOriginimgurl())
                            .build();
                    
                    destinationImageDao.insertImage(image);
                    imageCount++;
                }
                
                processedCount++;
                
                if (processedCount % 100 == 0) {
                    log.info("이미지 진행 중... {}건 처리, 이미지 {}장 저장", processedCount, imageCount);
                }

                // API 호출 간격
                Thread.sleep(50);

            } catch (Exception e) {
                log.error("이미지 저장 실패 (contentid: {}): {}", dest.getContentid(), e.getMessage());
            }
        }

        log.info("========== 이미지 수집 완료: {}건 처리, 이미지 {}장 ==========", processedCount, imageCount);
        return processedCount;
    }

    /**
     * 상세정보 없는 여행지 개수
     */
    public int countDestinationsWithoutDetail() {
        return destinationDao.countDestinationsWithoutDetail();
    }

    /**
     * 이미지 총 개수
     */
    public int getImageCount() {
        return destinationImageDao.countImages();
    }
    
    /**
     * 썸네일 이미지 다운로드
     * @param startIndex 시작 인덱스
     * @param endIndex 끝 인덱스
     * @return 다운로드 건수
     */
    public int downloadThumbnails(int startIndex, int endIndex) {
        log.info("========== 썸네일 다운로드 시작 ({}~{}번째) ==========", startIndex, endIndex);

        int downloadCount = 0;
        String uploadDir = "src/main/resources/static/thumbnails/";
        
        // 폴더 생성
        java.io.File dir = new java.io.File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        List<Destination> destinations = destinationDao.selectDestinationsByRange(startIndex, endIndex);
        log.info("조회된 여행지: {}건", destinations.size());

        for (Destination dest : destinations) {
            try {
                String thumbnailUrl = dest.getFirstimage2();
                
                // 썸네일 URL이 없으면 스킵
                if (thumbnailUrl == null || thumbnailUrl.isEmpty()) {
                    continue;
                }

                // 파일 저장 경로
                String fileName = dest.getContentid() + ".jpg";
                String filePath = uploadDir + fileName;
                
                // 이미 다운로드된 파일이면 스킵
                java.io.File file = new java.io.File(filePath);
                if (file.exists()) {
                    continue;
                }

                // 이미지 다운로드
                byte[] imageBytes = restTemplate.getForObject(thumbnailUrl, byte[].class);
                
                if (imageBytes != null && imageBytes.length > 0) {
                    java.nio.file.Files.write(file.toPath(), imageBytes);
                    downloadCount++;
                    
                    if (downloadCount % 100 == 0) {
                        log.info("썸네일 다운로드 진행 중... {}건 완료", downloadCount);
                    }
                }

                // 다운로드 간격 (서버 부하 방지)
                Thread.sleep(30);

            } catch (Exception e) {
                log.error("썸네일 다운로드 실패 (contentid: {}): {}", dest.getContentid(), e.getMessage());
            }
        }

        log.info("========== 썸네일 다운로드 완료: {}건 ==========", downloadCount);
        return downloadCount;
    }

    /**
     * 썸네일 다운로드 현황
     */
    public Map<String, Object> getThumbnailStatus() {
        Map<String, Object> status = new HashMap<>();
        
        String uploadDir = "src/main/resources/static/thumbnails/";
        java.io.File dir = new java.io.File(uploadDir);
        
        int downloadedCount = 0;
        if (dir.exists()) {
            downloadedCount = dir.listFiles() != null ? dir.listFiles().length : 0;
        }
        
        // firstimage2가 있는 여행지 수
        int totalWithThumbnail = destinationDao.countDestinationsWithThumbnail();
        
        status.put("downloadedCount", downloadedCount);
        status.put("totalWithThumbnail", totalWithThumbnail);
        status.put("remainingCount", totalWithThumbnail - downloadedCount);
        
        return status;
    }
}