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
    public int syncDestinations(String contenttypeid, int maxPages) {
        int totalSaved = 0;
        int numOfRows = 100;

        log.info("=== 여행지 동기화 시작: 타입={}, 최대페이지={} ===", contenttypeid, maxPages);

        for (int page = 1; page <= maxPages; page++) {
            log.info("페이지 {} 처리 중...", page);

            List<DestinationDto> destinations = tourApiService.fetchDestinations(contenttypeid, page, numOfRows);

            if (destinations == null || destinations.isEmpty()) {
                log.info("더 이상 데이터 없음. 동기화 종료.");
                break;
            }

            for (DestinationDto dto : destinations) {
                try {
                    Destination entity = convertToEntity(dto);
                    destinationDao.mergeDestination(entity);
                    totalSaved++;
                } catch (Exception e) {
                    log.warn("저장 실패 (contentid={}): {}", dto.getContentid(), e.getMessage());
                }
            }

            log.info("페이지 {} 완료: {}건 처리", page, destinations.size());

            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        log.info("=== 여행지 동기화 완료: 총 {}건 저장 ===", totalSaved);
        return totalSaved;
    }

    @Transactional
    public int syncAllDestinations(int pagesPerType) {
        int total = 0;

        log.info("=== 전체 여행지 동기화 시작 ===");

        for (String contenttypeid : CONTENT_TYPES.keySet()) {
            try {
                log.info("관광타입 {} ({}) 동기화 시작", contenttypeid, CONTENT_TYPES.get(contenttypeid));
                int saved = syncDestinations(contenttypeid, pagesPerType);
                total += saved;
                log.info("관광타입 {} 동기화 완료: {}건", contenttypeid, saved);
            } catch (Exception e) {
                log.error("관광타입 {} 동기화 실패: {}", contenttypeid, e.getMessage());
            }
        }

        log.info("=== 전체 여행지 동기화 완료: 총 {}건 저장 ===", total);
        return total;
    }

    @Transactional
    public boolean updateDestinationDetail(String contentid) {
        try {
            DestinationDetailDto detail = tourApiService.fetchDestinationDetail(contentid);
            
            if (detail != null) {
                Destination dest = destinationDao.selectDestinationById(contentid);
                if (dest != null) {
                    dest.setOverview(detail.getOverview());
                    dest.setHomepage(detail.getHomepage());
                    destinationDao.updateDestinationDetail(dest);
                    log.info("상세정보 업데이트 완료: contentid={}", contentid);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("상세정보 업데이트 실패 (contentid={}): {}", contentid, e.getMessage());
            return false;
        }
    }

    @Transactional
    public int syncDestinationImages(String contentid) {
        try {
            List<DestinationImageDto> images = tourApiService.fetchDestinationImages(contentid);
            int saved = 0;
            
            destinationImageDao.deleteImagesByContentId(contentid);
            
            for (DestinationImageDto dto : images) {
                try {
                    DestinationImage img = DestinationImage.builder()
                            .contentid(contentid)
                            .originimgurl(dto.getOriginimgurl())
                            .build();
                    
                    destinationImageDao.insertImage(img);
                    saved++;
                } catch (Exception e) {
                    log.warn("이미지 저장 실패: {}", e.getMessage());
                }
            }
            
            log.info("이미지 동기화 완료 (contentid={}): {}건", contentid, saved);
            return saved;
        } catch (Exception e) {
            log.error("이미지 동기화 실패 (contentid={}): {}", contentid, e.getMessage());
            return 0;
        }
    }

    // ============================================
    // 조회 메서드 (기존)
    // ============================================

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

    public Map<String, Object> getDestinationStatus() {
        Map<String, Object> status = new HashMap<>();
        
        status.put("total", destinationDao.countDestination());
        
        for (Map.Entry<String, String> entry : CONTENT_TYPES.entrySet()) {
            int count = destinationDao.countDestinationByType(entry.getKey());
            status.put(entry.getValue(), count);
        }
        
        return status;
    }

    public List<Destination> getDestinationsByType(String contenttypeid) {
        return destinationDao.selectDestinationsByType(contenttypeid);
    }
    
    /**
     * 여행지 목록 조회 (페이징, 시군구 이름 포함) - 기존 메서드
     */
    public Map<String, Object> getDestinationsWithPaging(String contenttypeid, int page, int size) {
        return getDestinationsWithPagingAndRegion(contenttypeid, page, size, null, null);
    }

    /**
     * 여행지 목록 조회 (페이징 + 지역 필터)
     */
    public Map<String, Object> getDestinationsWithPagingAndRegion(
            String contenttypeid, int page, int size, 
            String lDongRegnCd, String lDongSignguCd) {
        
        Map<String, Object> result = new HashMap<>();
        
        int offset = (page - 1) * size;
        List<Destination> list;
        int totalCount;

        // 지역 필터 적용
        if (lDongRegnCd != null && !lDongRegnCd.isEmpty()) {
            list = destinationDao.selectDestinationsByTypeAndRegion(
                    contenttypeid, lDongRegnCd, lDongSignguCd, offset, size);
            totalCount = destinationDao.countDestinationByTypeAndRegion(
                    contenttypeid, lDongRegnCd, lDongSignguCd);
        } else {
            list = destinationDao.selectDestinationsByTypeWithPaging(contenttypeid, offset, size);
            totalCount = destinationDao.countDestinationByType(contenttypeid);
        }

        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // 시군구 이름 추가
        List<Map<String, Object>> dataWithRegion = new java.util.ArrayList<>();
        for (Destination dest : list) {
            Map<String, Object> item = new HashMap<>();
            item.put("contentid", dest.getContentid());
            item.put("contenttypeid", dest.getContenttypeid());
            item.put("title", dest.getTitle());
            item.put("addr1", dest.getAddr1());
            item.put("addr2", dest.getAddr2());
            item.put("tel", dest.getTel());
            item.put("firstimage", dest.getFirstimage());
            item.put("firstimage2", dest.getFirstimage2());
            item.put("mapx", dest.getMapx());
            item.put("mapy", dest.getMapy());
            item.put("overview", dest.getOverview());
            item.put("homepage", dest.getHomepage());
            item.put("viewCount", dest.getViewCount());
            item.put("lDongRegnCd", dest.getLDongRegnCd());
            item.put("lDongSignguCd", dest.getLDongSignguCd());
            
            String regionName = getRegionName(dest.getLDongRegnCd(), dest.getLDongSignguCd());
            item.put("regionName", regionName);
            
            dataWithRegion.add(item);
        }
        
        result.put("data", dataWithRegion);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }

    private String getRegionName(String lDongRegnCd, String lDongSignguCd) {
        if (lDongRegnCd == null) return "";
        
        Map<String, String> regionMap = new HashMap<>();
        regionMap.put("11", "서울");
        regionMap.put("26", "부산");
        regionMap.put("27", "대구");
        regionMap.put("28", "인천");
        regionMap.put("29", "광주");
        regionMap.put("30", "대전");
        regionMap.put("31", "울산");
        regionMap.put("36", "세종");
        regionMap.put("41", "경기");
        regionMap.put("42", "강원");
        regionMap.put("43", "충북");
        regionMap.put("44", "충남");
        regionMap.put("45", "전북");
        regionMap.put("46", "전남");
        regionMap.put("47", "경북");
        regionMap.put("48", "경남");
        regionMap.put("50", "제주");
        regionMap.put("51", "강원");
        regionMap.put("52", "전북");
        
        String sidoName = regionMap.getOrDefault(lDongRegnCd, "");
        
        String signguName = "";
        if (lDongSignguCd != null && !lDongSignguCd.isEmpty()) {
            try {
                signguName = destinationDao.selectSignguName(lDongRegnCd, lDongSignguCd);
                if (signguName == null) signguName = "";
            } catch (Exception e) {
                log.error("시군구 이름 조회 실패: {}", e.getMessage());
            }
        }
        
        return sidoName + " " + signguName;
    }

    public Destination getDestinationById(String contentid) {
        return destinationDao.selectDestinationById(contentid);
    }

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
     * 키워드 검색 (기존)
     */
    public Map<String, Object> searchDestinations(String keyword, int page, int size) {
        return searchDestinationsWithRegion(keyword, page, size, null, null);
    }

    /**
     * 키워드 검색 + 지역 필터
     */
    public Map<String, Object> searchDestinationsWithRegion(
            String keyword, int page, int size,
            String lDongRegnCd, String lDongSignguCd) {
        
        Map<String, Object> result = new HashMap<>();
        
        int offset = (page - 1) * size;
        List<Destination> list;
        int totalCount;

        if (lDongRegnCd != null && !lDongRegnCd.isEmpty()) {
            list = destinationDao.searchByKeywordAndRegion(keyword, lDongRegnCd, lDongSignguCd, offset, size);
            totalCount = destinationDao.countByKeywordAndRegion(keyword, lDongRegnCd, lDongSignguCd);
        } else {
            list = destinationDao.searchByKeyword(keyword, offset, size);
            totalCount = destinationDao.countByKeyword(keyword);
        }

        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // 데이터 변환
        List<Map<String, Object>> dataWithRegion = new java.util.ArrayList<>();
        for (Destination dest : list) {
            Map<String, Object> item = new HashMap<>();
            item.put("contentid", dest.getContentid());
            item.put("contenttypeid", dest.getContenttypeid());
            item.put("title", dest.getTitle());
            item.put("addr1", dest.getAddr1());
            item.put("addr2", dest.getAddr2());
            item.put("tel", dest.getTel());
            item.put("firstimage", dest.getFirstimage());
            item.put("firstimage2", dest.getFirstimage2());
            item.put("mapx", dest.getMapx());
            item.put("mapy", dest.getMapy());
            item.put("lDongRegnCd", dest.getLDongRegnCd());
            item.put("lDongSignguCd", dest.getLDongSignguCd());
            
            String regionName = getRegionName(dest.getLDongRegnCd(), dest.getLDongSignguCd());
            item.put("regionName", regionName);
            
            dataWithRegion.add(item);
        }
        
        result.put("data", dataWithRegion);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
}
