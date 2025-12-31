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
     * 여행지 목록 조회 (페이징, 시군구 이름 포함)
     */
    public Map<String, Object> getDestinationsWithPaging(String contenttypeid, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        
        int offset = (page - 1) * size;
        List<Destination> list = destinationDao.selectDestinationsByTypeWithPaging(contenttypeid, offset, size);
        int totalCount = destinationDao.countDestinationByType(contenttypeid);
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
            
            // 시군구 이름 조회
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

    /**
     * 지역명 조회 (시도 + 시군구)
     */
    private String getRegionName(String lDongRegnCd, String lDongSignguCd) {
        if (lDongRegnCd == null) return "";
        
        // 시도 이름
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
        
        String sidoName = regionMap.getOrDefault(lDongRegnCd, "");
        
        // 시군구 이름 조회
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