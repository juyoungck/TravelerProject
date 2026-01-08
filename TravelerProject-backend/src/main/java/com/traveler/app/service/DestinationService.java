package com.traveler.app.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
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
 * ★ 수정: 목록 조회 메서드 간소화 (Map 직접 사용)
 */
@Service
@Slf4j
public class DestinationService {
    
    private final TourApiService tourApiService;
    private final DestinationDao destinationDao;
    private final DestinationImageDao destinationImageDao;
    private final RestTemplate restTemplate;

    /** 관광타입 목록 */
    private static final Map<String, String> CONTENT_TYPES = new HashMap<>();
    
    @Value("${file.upload.path:./uploads/}")
    private String uploadPath;
    
    @Value("${file.upload.url:http://localhost:8080}")
    private String serverUrl;
    
    static {
        CONTENT_TYPES.put("12", "관광지");
        CONTENT_TYPES.put("14", "문화시설");
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

    // ============================================
    // 지역 코드 조회
    // ============================================

    public List<Map<String, Object>> getRegions() {
        return destinationDao.selectRegions();
    }

    public List<Map<String, Object>> getSignguList(String lDongRegnCd) {
        return destinationDao.selectSignguList(lDongRegnCd);
    }

    // ============================================
    // 여행지 목록 조회 (★ 간소화됨)
    // ============================================

    /**
     * 여행지 목록 조회 (통합)
     * - 리뷰 통계 포함
     * - 지역명 포함
     * - 필터: 콘텐츠타입, 시도, 시군구
     * - 정렬: latest, popular
     */
    public Map<String, Object> getDestinations(
            String contenttypeid, 
            int page, 
            int size, 
            String sort,
            String lDongRegnCd, 
            String lDongSignguCd) {
        
        Map<String, Object> result = new HashMap<>();
        
        int offset = (page - 1) * size;
        
        // ★ SQL에서 JOIN으로 모든 데이터를 한 번에 가져옴
        List<Map<String, Object>> list = destinationDao.selectDestinationsWithReview(
                contenttypeid, lDongRegnCd, lDongSignguCd, offset, size, sort);
        
        int totalCount = destinationDao.countDestinations(
                contenttypeid, lDongRegnCd, lDongSignguCd);
        
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        result.put("data", list);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }

    /**
     * 여행지 검색 (통합)
     */
    public Map<String, Object> searchDestinations(
            String keyword, 
            int page, 
            int size,
            String lDongRegnCd, 
            String lDongSignguCd) {
        
        Map<String, Object> result = new HashMap<>();
        
        int offset = (page - 1) * size;
        
        List<Map<String, Object>> list = destinationDao.searchDestinationsWithReview(
                keyword, lDongRegnCd, lDongSignguCd, offset, size);
        
        int totalCount = destinationDao.countSearchDestinations(
                keyword, lDongRegnCd, lDongSignguCd);
        
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        result.put("data", list);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }

    // ============================================
    // 여행지 상세/수정
    // ============================================

    public Destination getDestinationById(String contentid) {
        return destinationDao.selectDestinationById(contentid);
    }

    public void increaseViewCount(String contentid) {
        destinationDao.increaseViewCount(contentid);
    }

    public List<DestinationImage> getImagesByContentId(String contentid) {
        return destinationImageDao.selectImagesByContentId(contentid);
    }

    public Map<String, String> getContentTypes() {
        return CONTENT_TYPES;
    }
    
    /**
     * 플래너용 여행지 목록 조회
     */
    public List<Map<String, Object>> getDestinationsForPlanner(
            String contenttypeid, String lDongRegnCd, String lDongSignguCd, int page, int size) {
        Map<String, Object> params = new HashMap<>();
        params.put("contenttypeid", contenttypeid);
        params.put("lDongRegnCd", lDongRegnCd);
        params.put("lDongSignguCd", lDongSignguCd);
        params.put("offset", (page - 1) * size);
        params.put("limit", size);
        return destinationDao.selectDestinationsForPlanner(params);
    }

    /**
     * 플래너용 여행지 목록 개수
     */
    public int countDestinationsForPlanner(String contenttypeid, String lDongRegnCd, String lDongSignguCd) {
        Map<String, Object> params = new HashMap<>();
        params.put("contenttypeid", contenttypeid);
        params.put("lDongRegnCd", lDongRegnCd);
        params.put("lDongSignguCd", lDongSignguCd);
        return destinationDao.countDestinationsForPlanner(params);
    }

    /**
     * 플래너용 여행지 검색
     */
    public List<Map<String, Object>> searchDestinationsForPlanner(
            String keyword, String lDongRegnCd, String lDongSignguCd, int page, int size) {
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("lDongRegnCd", lDongRegnCd);
        params.put("lDongSignguCd", lDongSignguCd);
        params.put("offset", (page - 1) * size);
        params.put("limit", size);
        return destinationDao.searchDestinationsForPlanner(params);
    }

    /**
     * 플래너용 여행지 검색 개수
     */
    public int countSearchDestinationsForPlanner(String keyword, String lDongRegnCd, String lDongSignguCd) {
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("lDongRegnCd", lDongRegnCd);
        params.put("lDongSignguCd", lDongSignguCd);
        return destinationDao.countDestinationsForPlanner(params);
    }

    // ============================================
    // 동기화 관련 메서드 (기존 유지)
    // ============================================

    public int getApiTotalCount(String contenttypeid) {
        return tourApiService.fetchDestinationTotalCount(contenttypeid);
    }

    @Transactional
    public int syncDestinationsByType(String contenttypeid, int startPage, int endPage) {
        String typeName = CONTENT_TYPES.getOrDefault(contenttypeid, "알수없음");
        log.info("========== [{}] 여행지 동기화 시작 (페이지 {}-{}) ==========", typeName, startPage, endPage);

        int savedCount = 0;
        int numOfRows = 100;

        for (int pageNo = startPage; pageNo <= endPage; pageNo++) {
            List<DestinationDto> destinations = tourApiService.fetchDestinations(contenttypeid, pageNo, numOfRows);

            if (destinations.isEmpty()) {
                log.info("더 이상 데이터가 없습니다. (페이지: {})", pageNo);
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

            log.info("[{}] 페이지 {} 완료 - 총 {}건 저장됨", typeName, pageNo, savedCount);

            try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
        }

        log.info("========== [{}] 여행지 동기화 완료: {}건 ==========", typeName, savedCount);
        return savedCount;
    }


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
	
	        try { Thread.sleep(500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
	    }
	    
	    log.info("=== 전체 여행지 동기화 완료: 총 {}건 ===", totalCount);
	    return result;
	}

	/**
	 * ★ 스케줄러용: 변경된 여행지 동기화 (기본정보 + 상세정보 + 이미지)
	 * 매일 새벽 4시에 실행되어 전날 수정된 여행지를 업데이트
	 */
	@Transactional
	public int syncModifiedDestinations() {
	    String yesterday = java.time.LocalDate.now().minusDays(1)
	            .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
	    
	    log.info("========== 변경 데이터 동기화 시작 (기준일: {}) ==========", yesterday);

	    int savedCount = 0;
	    int detailCount = 0;
	    int imageCount = 0;
	    int pageNo = 1;
	    int numOfRows = 100;

	    int totalCount = tourApiService.fetchModifiedTotalCount(yesterday);
	    log.info("변경된 데이터 총 개수: {}건", totalCount);

	    if (totalCount == 0) { 
	        log.info("변경된 데이터가 없습니다."); 
	        return 0; 
	    }

	    while (true) {
	        List<DestinationDto> destinations = tourApiService.fetchModifiedDestinations(yesterday, pageNo, numOfRows);
	        if (destinations.isEmpty()) break;

	        for (DestinationDto dto : destinations) {
	            try {
	                // 1. 기본 정보 저장
	                Destination entity = convertToEntity(dto);
	                destinationDao.mergeDestination(entity);
	                savedCount++;
	                
	                String contentid = dto.getContentid();
	                
	                // 2. 상세정보 업데이트 (overview, homepage)
	                try {
	                    DestinationDetailDto detail = tourApiService.fetchDestinationDetail(contentid);
	                    if (detail != null && detail.getOverview() != null) {
	                        destinationDao.updateDestinationDetail(contentid, detail.getOverview(), detail.getHomepage());
	                        detailCount++;
	                    }
	                    Thread.sleep(50);
	                } catch (Exception e) {
	                    log.warn("상세정보 업데이트 실패 (contentid={}): {}", contentid, e.getMessage());
	                }
	                
	                // 3. 이미지 업데이트
	                try {
	                    List<DestinationImageDto> images = tourApiService.fetchDestinationImages(contentid);
	                    if (!images.isEmpty()) {
	                        destinationImageDao.deleteImagesByContentId(contentid);
	                        
	                        for (DestinationImageDto imgDto : images) {
	                            DestinationImage img = DestinationImage.builder()
	                                    .contentid(contentid)
	                                    .originimgurl(imgDto.getOriginimgurl())
	                                    .build();
	                            destinationImageDao.insertImage(img);
	                        }
	                        imageCount++;
	                    }
	                    Thread.sleep(50);
	                } catch (Exception e) {
	                    log.warn("이미지 업데이트 실패 (contentid={}): {}", contentid, e.getMessage());
	                }
	                
	            } catch (Exception e) {
	                log.warn("여행지 저장 실패 (contentid={}): {}", dto.getContentid(), e.getMessage());
	            }
	        }

	        log.info("페이지 {} 완료 - 기본정보: {}건, 상세정보: {}건, 이미지: {}건", 
	                pageNo, savedCount, detailCount, imageCount);
	        pageNo++;
	        
	        try { 
	            Thread.sleep(100); 
	        } catch (InterruptedException e) { 
	            Thread.currentThread().interrupt(); 
	            break; 
	        }
	    }

	    log.info("========== 변경 데이터 동기화 완료 ==========");
	    log.info("기본정보: {}건, 상세정보: {}건, 이미지: {}건 업데이트", savedCount, detailCount, imageCount);
	    
	    return savedCount;
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
                    destinationDao.updateDestinationDetail(dest.getContentid(), detail.getOverview(), detail.getHomepage());
                    savedCount++;
                    if (savedCount % 100 == 0) log.info("상세정보 진행 중... {}건 완료", savedCount);
                }
                Thread.sleep(50);
            } catch (Exception e) {
                log.error("상세정보 저장 실패 (contentid: {}): {}", dest.getContentid(), e.getMessage());
            }
        }
        log.info("========== 상세정보 수집 완료: {}건 ==========", savedCount);
        return savedCount;
    }

    @Transactional
    public int syncDestinationImages(int startIndex, int endIndex) {
        log.info("========== 이미지 수집 시작 ({}~{}번째) ==========", startIndex, endIndex);
        int processedCount = 0, imageCount = 0;
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
                if (processedCount % 100 == 0) log.info("이미지 진행 중... {}건 처리, 이미지 {}장 저장", processedCount, imageCount);
                Thread.sleep(50);
            } catch (Exception e) {
                log.error("이미지 저장 실패 (contentid: {}): {}", dest.getContentid(), e.getMessage());
            }
        }
        log.info("========== 이미지 수집 완료: {}건 처리, 이미지 {}장 ==========", processedCount, imageCount);
        return processedCount;
    }

    // ============================================
    // 통계/상태 조회
    // ============================================

    public Map<String, Object> getDestinationStatus() {
        Map<String, Object> status = new HashMap<>();
        int totalCount = destinationDao.countDestination();
        status.put("totalCount", totalCount);
        
        Map<String, Integer> byType = new HashMap<>();
        for (Map.Entry<String, String> entry : CONTENT_TYPES.entrySet()) {
            int count = destinationDao.countDestinationByType(entry.getKey());
            byType.put(entry.getValue(), count);
        }
        status.put("byType", byType);
        return status;
    }

    public int countDestinationsWithoutDetail() { 
        return destinationDao.countDestinationsWithoutDetail(); 
    }
    
    public int getImageCount() { 
        return destinationImageDao.countImages(); 
    }
    
    public int downloadThumbnails(int startIndex, int endIndex) {
        log.info("========== 썸네일 다운로드 시작 ({}~{}번째) ==========", startIndex, endIndex);
        int downloadCount = 0;
        String thumbnailDir = uploadPath + "thumbnails/";
        java.io.File dir = new java.io.File(thumbnailDir);
        if (!dir.exists()) dir.mkdirs();

        List<Destination> destinations = destinationDao.selectDestinationsByRange(startIndex, endIndex);
        log.info("조회된 여행지: {}건", destinations.size());

        for (Destination dest : destinations) {
            try {
                String thumbnailUrl = dest.getFirstimage2();
                if (thumbnailUrl == null || thumbnailUrl.isEmpty()) continue;
                String fileName = dest.getContentid() + ".jpg";
                String filePath = thumbnailDir + fileName;
                java.io.File file = new java.io.File(filePath);
                if (file.exists()) continue;
                byte[] imageBytes = restTemplate.getForObject(thumbnailUrl, byte[].class);
                if (imageBytes != null && imageBytes.length > 0) {
                    java.nio.file.Files.write(file.toPath(), imageBytes);
                    downloadCount++;
                    if (downloadCount % 100 == 0) log.info("썸네일 다운로드 진행 중... {}건 완료", downloadCount);
                }
                Thread.sleep(30);
            } catch (Exception e) {
                log.error("썸네일 다운로드 실패 (contentid: {}): {}", dest.getContentid(), e.getMessage());
            }
        }
        log.info("========== 썸네일 다운로드 완료: {}건 ==========", downloadCount);
        return downloadCount;
    }

    public Map<String, Object> getThumbnailStatus() {
        Map<String, Object> status = new HashMap<>();
        String thumbnailDir = uploadPath + "thumbnails/";
        java.io.File dir = new java.io.File(thumbnailDir);
        int downloadedCount = 0;
        if (dir.exists()) downloadedCount = dir.listFiles() != null ? dir.listFiles().length : 0;
        int totalWithThumbnail = destinationDao.countDestinationsWithThumbnail();
        status.put("downloadedCount", downloadedCount);
        status.put("totalWithThumbnail", totalWithThumbnail);
        status.put("remainingCount", totalWithThumbnail - downloadedCount);
        return status;
    }

    public List<Destination> getRandomDestinationsWithImage(int size) {
        return destinationDao.selectRandomDestinationsWithImage(size);
    }

    // ============================================
    // 유틸리티 메서드
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
        if (value == null || value.isEmpty()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}