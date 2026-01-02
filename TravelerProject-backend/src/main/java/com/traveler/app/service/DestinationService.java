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
 * 
 * 수정: 지역 필터 기능 추가
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

        result.put("총합계", totalCount);
        log.info("========== 전체 여행지 동기화 완료: 총 {}건 ==========", totalCount);
        return result;
    }
    
    @Transactional
    public int syncModifiedDestinations() {
        String yesterday = java.time.LocalDate.now().minusDays(1)
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        log.info("========== 변경 데이터 동기화 시작 (기준일: {}) ==========", yesterday);

        int savedCount = 0;
        int pageNo = 1;
        int numOfRows = 100;

        int totalCount = tourApiService.fetchModifiedTotalCount(yesterday);
        log.info("변경된 데이터 총 개수: {}건", totalCount);

        if (totalCount == 0) { log.info("변경된 데이터가 없습니다."); return 0; }

        while (true) {
            List<DestinationDto> destinations = tourApiService.fetchModifiedDestinations(yesterday, pageNo, numOfRows);
            if (destinations.isEmpty()) break;

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
            try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
        }

        log.info("========== 변경 데이터 동기화 완료: {}건 ==========", savedCount);
        return savedCount;
    }
    
    @Transactional
    public int syncModifiedDestinationsByDate(String date) {
        log.info("========== 변경 데이터 동기화 시작 (기준일: {}) ==========", date);

        int savedCount = 0;
        int pageNo = 1;
        int numOfRows = 100;

        int totalCount = tourApiService.fetchModifiedTotalCount(date);
        log.info("변경된 데이터 총 개수: {}건", totalCount);

        if (totalCount == 0) { log.info("변경된 데이터가 없습니다."); return 0; }

        while (true) {
            List<DestinationDto> destinations = tourApiService.fetchModifiedDestinations(date, pageNo, numOfRows);
            if (destinations.isEmpty()) break;

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
            try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
        }

        log.info("========== 변경 데이터 동기화 완료: {}건 ==========", savedCount);
        return savedCount;
    }
    
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
    
    /** String → Double 변환 (null 안전) */
    private Double parseDouble(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /** String → Integer 변환 (null 안전) */
    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
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
    
    /**
     * 여행지 목록 조회 (페이징)
     */
    public Map<String, Object> getDestinationsWithPaging(String contenttypeid, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        
        int offset = (page - 1) * size;
        List<Destination> list = destinationDao.selectDestinationsByTypeWithPaging(contenttypeid, offset, size);
        int totalCount = destinationDao.countDestinationByType(contenttypeid);
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        List<Map<String, Object>> dataWithRegion = new java.util.ArrayList<>();
        for (Destination dest : list) {
            dataWithRegion.add(convertDestinationToMap(dest));
        }
        
        result.put("data", dataWithRegion);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
    
    /**
     * 여행지 목록 조회 (페이징 + 지역 필터)
     */
    public Map<String, Object> getDestinationsWithPagingAndRegion(
            String contenttypeid, int page, int size, 
            String lDongRegnCd, String lDongSignguCd) {
        
        Map<String, Object> result = new HashMap<>();
        int offset = (page - 1) * size;
        
        List<Destination> list = destinationDao.selectDestinationsByTypeAndRegion(
            contenttypeid, lDongRegnCd, lDongSignguCd, offset, size);
        int totalCount = destinationDao.countDestinationByTypeAndRegion(
            contenttypeid, lDongRegnCd, lDongSignguCd);
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        List<Map<String, Object>> dataWithRegion = new java.util.ArrayList<>();
        for (Destination dest : list) {
            dataWithRegion.add(convertDestinationToMap(dest));
        }
        
        result.put("data", dataWithRegion);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
    
    /**
     * 여행지 검색 (키워드)
     */
    public Map<String, Object> searchDestinations(String keyword, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        
        int offset = (page - 1) * size;
        List<Destination> list = destinationDao.searchByKeyword(keyword, offset, size);
        int totalCount = destinationDao.countByKeyword(keyword);
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        List<Map<String, Object>> dataWithRegion = new java.util.ArrayList<>();
        for (Destination dest : list) {
            dataWithRegion.add(convertDestinationToMap(dest));
        }
        
        result.put("data", dataWithRegion);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
    
    /**
     * 여행지 검색 (키워드 + 지역 필터)
     */
    public Map<String, Object> searchDestinationsWithRegion(
            String keyword, int page, int size,
            String lDongRegnCd, String lDongSignguCd) {
        
        Map<String, Object> result = new HashMap<>();
        int offset = (page - 1) * size;
        
        List<Destination> list = destinationDao.searchByKeywordAndRegion(
            keyword, lDongRegnCd, lDongSignguCd, offset, size);
        int totalCount = destinationDao.countByKeywordAndRegion(
            keyword, lDongRegnCd, lDongSignguCd);
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        List<Map<String, Object>> dataWithRegion = new java.util.ArrayList<>();
        for (Destination dest : list) {
            dataWithRegion.add(convertDestinationToMap(dest));
        }
        
        result.put("data", dataWithRegion);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
    
    /**
     * Destination 엔티티를 Map으로 변환
     */
    private Map<String, Object> convertDestinationToMap(Destination dest) {
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
        item.put("regionName", getRegionName(dest.getLDongRegnCd(), dest.getLDongSignguCd()));
        return item;
    }

    private String getRegionName(String lDongRegnCd, String lDongSignguCd) {
        if (lDongRegnCd == null) return "";
        
        Map<String, String> regionMap = new HashMap<>();
        regionMap.put("11", "서울"); regionMap.put("26", "부산"); regionMap.put("27", "대구");
        regionMap.put("28", "인천"); regionMap.put("29", "광주"); regionMap.put("30", "대전");
        regionMap.put("31", "울산"); regionMap.put("36", "세종"); regionMap.put("41", "경기");
        regionMap.put("42", "강원"); regionMap.put("43", "충북"); regionMap.put("44", "충남");
        regionMap.put("45", "전북"); regionMap.put("46", "전남"); regionMap.put("47", "경북");
        regionMap.put("48", "경남"); regionMap.put("50", "제주");
        
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
                            .contentid(imgDto.getContentid()).originimgurl(imgDto.getOriginimgurl()).build();
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

    public int countDestinationsWithoutDetail() { return destinationDao.countDestinationsWithoutDetail(); }
    public int getImageCount() { return destinationImageDao.countImages(); }
    
    public int downloadThumbnails(int startIndex, int endIndex) {
        log.info("========== 썸네일 다운로드 시작 ({}~{}번째) ==========", startIndex, endIndex);
        int downloadCount = 0;
        String uploadDir = "src/main/resources/static/thumbnails/";
        java.io.File dir = new java.io.File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        List<Destination> destinations = destinationDao.selectDestinationsByRange(startIndex, endIndex);
        log.info("조회된 여행지: {}건", destinations.size());

        for (Destination dest : destinations) {
            try {
                String thumbnailUrl = dest.getFirstimage2();
                if (thumbnailUrl == null || thumbnailUrl.isEmpty()) continue;
                String fileName = dest.getContentid() + ".jpg";
                String filePath = uploadDir + fileName;
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
        String uploadDir = "src/main/resources/static/thumbnails/";
        java.io.File dir = new java.io.File(uploadDir);
        int downloadedCount = 0;
        if (dir.exists()) downloadedCount = dir.listFiles() != null ? dir.listFiles().length : 0;
        int totalWithThumbnail = destinationDao.countDestinationsWithThumbnail();
        status.put("downloadedCount", downloadedCount);
        status.put("totalWithThumbnail", totalWithThumbnail);
        status.put("remainingCount", totalWithThumbnail - downloadedCount);
        return status;
    }
}
