package com.traveler.app.dao;

import com.traveler.app.dto.NearbyDestinationDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MapDao.java
 * 지도 관련 데이터 액세스 인터페이스
 * MyBatis Mapper와 연결되어 DB 쿼리를 실행한다.
 */
@Mapper
public interface MapDao {

    /**
     * 특정 좌표 기준 반경 내 여행지 목록 조회
     * Haversine 공식을 사용하여 거리를 계산하고, 거리순으로 정렬한다.
     * 
     * @param lat 중심 위도 (latitude)
     * @param lng 중심 경도 (longitude)
     * @param radius 검색 반경 (km)
     * @param contenttypeid 관광 타입 ID (null이면 전체 조회)
     * @param limit 최대 조회 개수
     * @return 주변 여행지 목록
     */
    List<NearbyDestinationDto> selectNearbyDestinations(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radius") Double radius,
            @Param("contenttypeid") String contenttypeid,
            @Param("limit") Integer limit
    );

    /**
     * 특정 지역(시도, 시군구) 내 여행지 목록 조회
     * 플래너에서 지역 선택 시 해당 지역의 여행지를 조회한다.
     * 
     * @param lDongRegnCd 법정동 시도 코드
     * @param lDongSignguCd 법정동 시군구 코드 (null이면 시도 전체)
     * @param contenttypeid 관광 타입 ID (null이면 전체 조회)
     * @param limit 최대 조회 개수
     * @return 해당 지역 여행지 목록
     */
    List<NearbyDestinationDto> selectDestinationsByRegion(
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd,
            @Param("contenttypeid") String contenttypeid,
            @Param("limit") Integer limit
    );

    /**
     * 키워드로 여행지 검색 (지도용)
     * 여행지명, 주소에서 키워드를 검색한다.
     * 
     * @param keyword 검색 키워드
     * @param contenttypeid 관광 타입 ID (null이면 전체 조회)
     * @param limit 최대 조회 개수
     * @return 검색된 여행지 목록
     */
    List<NearbyDestinationDto> searchDestinationsForMap(
            @Param("keyword") String keyword,
            @Param("contenttypeid") String contenttypeid,
            @Param("limit") Integer limit
    );
}