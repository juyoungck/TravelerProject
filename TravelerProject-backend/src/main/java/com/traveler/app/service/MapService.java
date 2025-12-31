package com.traveler.app.service;

import com.traveler.app.dao.MapDao;
import com.traveler.app.dto.NearbyDestinationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MapService.java
 * 지도 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class MapService {

    @Autowired
    private MapDao mapDao;

    /** 기본 검색 반경 (km) */
    private static final Double DEFAULT_RADIUS = 5.0;
    
    /** 최대 검색 반경 (km) */
    private static final Double MAX_RADIUS = 50.0;
    
    /** 기본 조회 개수 */
    private static final Integer DEFAULT_LIMIT = 50;
    
    /** 최대 조회 개수 */
    private static final Integer MAX_LIMIT = 200;

    /**
     * 주변 여행지 조회
     * 사용자 위치를 기준으로 반경 내 여행지를 조회한다.
     * 
     * @param lat 중심 위도
     * @param lng 중심 경도
     * @param radius 검색 반경 (km), null이면 기본값 5km
     * @param contenttypeid 관광 타입 ID, null이면 전체
     * @param limit 최대 조회 개수, null이면 기본값 50개
     * @return 주변 여행지 목록 (거리순 정렬)
     */
    public List<NearbyDestinationDto> getNearbyDestinations(
            Double lat, 
            Double lng, 
            Double radius, 
            String contenttypeid, 
            Integer limit) {
        
        // 파라미터 유효성 검사 및 기본값 설정
        if (lat == null || lng == null) {
            throw new IllegalArgumentException("위도(lat)와 경도(lng)는 필수입니다.");
        }
        
        // 위도 범위 검사 (대한민국 기준: 약 33~43도)
        if (lat < 33.0 || lat > 43.0) {
            throw new IllegalArgumentException("유효하지 않은 위도 값입니다. (33~43)");
        }
        
        // 경도 범위 검사 (대한민국 기준: 약 124~132도)
        if (lng < 124.0 || lng > 132.0) {
            throw new IllegalArgumentException("유효하지 않은 경도 값입니다. (124~132)");
        }
        
        // 반경 기본값 및 최대값 설정
        if (radius == null || radius <= 0) {
            radius = DEFAULT_RADIUS;
        } else if (radius > MAX_RADIUS) {
            radius = MAX_RADIUS;
        }
        
        // 조회 개수 기본값 및 최대값 설정
        if (limit == null || limit <= 0) {
            limit = DEFAULT_LIMIT;
        } else if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }
        
        // contenttypeid 빈 문자열 처리
        if (contenttypeid != null && contenttypeid.trim().isEmpty()) {
            contenttypeid = null;
        }

        return mapDao.selectNearbyDestinations(lat, lng, radius, contenttypeid, limit);
    }

    /**
     * 특정 지역 내 여행지 조회
     * 플래너에서 지역 선택 시 사용한다.
     * 
     * @param lDongRegnCd 법정동 시도 코드
     * @param lDongSignguCd 법정동 시군구 코드 (선택)
     * @param contenttypeid 관광 타입 ID (선택)
     * @param limit 최대 조회 개수
     * @return 해당 지역 여행지 목록
     */
    public List<NearbyDestinationDto> getDestinationsByRegion(
            String lDongRegnCd,
            String lDongSignguCd,
            String contenttypeid,
            Integer limit) {
        
        // 시도 코드 필수 검사
        if (lDongRegnCd == null || lDongRegnCd.trim().isEmpty()) {
            throw new IllegalArgumentException("시도 코드(lDongRegnCd)는 필수입니다.");
        }
        
        // 빈 문자열 처리
        if (lDongSignguCd != null && lDongSignguCd.trim().isEmpty()) {
            lDongSignguCd = null;
        }
        if (contenttypeid != null && contenttypeid.trim().isEmpty()) {
            contenttypeid = null;
        }
        
        // 조회 개수 기본값 설정
        if (limit == null || limit <= 0) {
            limit = DEFAULT_LIMIT;
        } else if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }

        return mapDao.selectDestinationsByRegion(lDongRegnCd, lDongSignguCd, contenttypeid, limit);
    }

    /**
     * 지도용 여행지 검색
     * 키워드로 여행지를 검색한다.
     * 
     * @param keyword 검색 키워드
     * @param contenttypeid 관광 타입 ID (선택)
     * @param limit 최대 조회 개수
     * @return 검색된 여행지 목록
     */
    public List<NearbyDestinationDto> searchDestinationsForMap(
            String keyword,
            String contenttypeid,
            Integer limit) {
        
        // 키워드 필수 검사
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("검색 키워드(keyword)는 필수입니다.");
        }
        
        // 키워드 최소 길이 검사
        if (keyword.trim().length() < 2) {
            throw new IllegalArgumentException("검색 키워드는 2글자 이상이어야 합니다.");
        }
        
        // 빈 문자열 처리
        if (contenttypeid != null && contenttypeid.trim().isEmpty()) {
            contenttypeid = null;
        }
        
        // 조회 개수 기본값 설정
        if (limit == null || limit <= 0) {
            limit = DEFAULT_LIMIT;
        } else if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }

        return mapDao.searchDestinationsForMap(keyword.trim(), contenttypeid, limit);
    }
}