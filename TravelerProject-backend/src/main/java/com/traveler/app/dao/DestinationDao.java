package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.Destination;

/**
 * 여행지 DAO 인터페이스
 * 
 * 수정: 지역 필터 메서드 추가
 */
@Mapper
public interface DestinationDao {

    /** 여행지 저장/수정 (MERGE) */
    void mergeDestination(Destination destination);

    /** 여행지 상세 조회 */
    Destination selectDestinationById(@Param("contentid") String contentid);

    /** 관광타입별 여행지 목록 조회 */
    List<Destination> selectDestinationsByType(@Param("contenttypeid") String contenttypeid);

    /** 지역별 여행지 목록 조회 */
    List<Destination> selectDestinationsByRegion(
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd
    );

    /** 관광타입별 여행지 목록 조회 (페이징) */
    List<Destination> selectDestinationsByTypeWithPaging(
        @Param("contenttypeid") String contenttypeid,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    /** 관광타입 + 지역별 여행지 목록 조회 (페이징) */
    List<Destination> selectDestinationsByTypeAndRegion(
        @Param("contenttypeid") String contenttypeid,
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    /** 여행지 목록 조회 (관광타입 + 지역 + 페이징) */
    List<Destination> selectDestinationsByTypeAndRegion(
            @Param("contenttypeid") String contenttypeid,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /** 시군구 이름 조회 */
    String selectSignguName(
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd
    );

    /** 전체 여행지 개수 */
    int countDestination();

    /** 관광타입별 여행지 개수 */
    int countDestinationByType(@Param("contenttypeid") String contenttypeid);

    /** 여행지 개수 조회 (관광타입 + 지역) */
    int countDestinationByTypeAndRegion(
            @Param("contenttypeid") String contenttypeid,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd);

    /** 상세정보 업데이트 */
    void updateDestinationDetail(
        @Param("contentid") String contentid,
        @Param("overview") String overview,
        @Param("homepage") String homepage
    );

    /** 범위로 여행지 조회 (페이징) */
    List<Destination> selectDestinationsByRange(
        @Param("startIndex") int startIndex,
        @Param("endIndex") int endIndex
    );

    /** 상세정보 없는 여행지 개수 */
    int countDestinationsWithoutDetail();

    /** 썸네일 있는 여행지 개수 */
    int countDestinationsWithThumbnail();

    /** 키워드 검색 */
    List<Destination> searchByKeyword(
        @Param("keyword") String keyword,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    /** 키워드 검색 결과 개수 */
    int countByKeyword(@Param("keyword") String keyword);

    /** 키워드 + 지역 검색 */
    List<Destination> searchByKeywordAndRegion(
            @Param("keyword") String keyword,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    /** 키워드 + 지역 검색 결과 개수 */
    int countByKeywordAndRegion(
            @Param("keyword") String keyword,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd
    );
    
    void increaseViewCount(@Param("contentid") String contentid);
}
