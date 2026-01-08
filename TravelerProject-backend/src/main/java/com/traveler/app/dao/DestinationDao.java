package com.traveler.app.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.Destination;

/**
 * 여행지 DAO 인터페이스
 * 
 * ★ 수정: 목록 조회 메서드 반환 타입을 Map으로 변경 (리뷰 통계 포함)
 */
@Mapper
public interface DestinationDao {

    // ============================================
    // 지역 코드 조회
    // ============================================

    /** 시도 목록 조회 */
    List<Map<String, Object>> selectRegions();

    /** 시군구 목록 조회 (시도 코드로) */
    List<Map<String, Object>> selectSignguList(@Param("lDongRegnCd") String lDongRegnCd);

    /** 시군구 이름 조회 */
    String selectSignguName(
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd
    );

    // ============================================
    // 여행지 CRUD
    // ============================================

    /** 여행지 저장/수정 (MERGE) */
    void mergeDestination(Destination destination);

    /** 여행지 상세 조회 */
    Destination selectDestinationById(@Param("contentid") String contentid);

    /** 상세정보 업데이트 */
    void updateDestinationDetail(
        @Param("contentid") String contentid,
        @Param("overview") String overview,
        @Param("homepage") String homepage
    );

    /** 조회수 증가 */
    void increaseViewCount(@Param("contentid") String contentid);

    // ============================================
    // 여행지 목록 조회 (리뷰 통계 포함) - ★ 수정됨
    // ============================================

    /** 
     * 여행지 목록 조회 (페이징 + 리뷰 통계)
     * ★ 반환 타입: List<Map<String, Object>>
     */
    List<Map<String, Object>> selectDestinationsWithReview(
        @Param("contenttypeid") String contenttypeid,
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd,
        @Param("offset") int offset,
        @Param("limit") int limit,
        @Param("sort") String sort
    );

    /** 
     * 여행지 개수 조회 (필터 조건 통합)
     */
    int countDestinations(
        @Param("contenttypeid") String contenttypeid,
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd
    );

    /** 
     * 여행지 검색 (키워드 + 지역 + 리뷰 통계)
     * ★ 반환 타입: List<Map<String, Object>>
     */
    List<Map<String, Object>> searchDestinationsWithReview(
        @Param("keyword") String keyword,
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    /** 
     * 여행지 검색 개수 
     */
    int countSearchDestinations(
        @Param("keyword") String keyword,
        @Param("lDongRegnCd") String lDongRegnCd,
        @Param("lDongSignguCd") String lDongSignguCd
    );
    
    /** 
     * 플래너용 여행지 목록 
     */
    List<Map<String, Object>> selectDestinationsForPlanner(Map<String, Object> params);

    /** 
     * 플래너용 여행지 검색
     */
    List<Map<String, Object>> searchDestinationsForPlanner(Map<String, Object> params);

    /** 
     * 플래너용 여행지 검색 개수
     */
    int countDestinationsForPlanner(Map<String, Object> params);

    // ============================================
    // 기타 조회 (기존 유지)
    // ============================================

    /** 관광타입별 여행지 목록 조회 (동기화용) */
    List<Destination> selectDestinationsByType(@Param("contenttypeid") String contenttypeid);

    /** 범위로 여행지 조회 (동기화용) */
    List<Destination> selectDestinationsByRange(
        @Param("startIndex") int startIndex,
        @Param("endIndex") int endIndex
    );

    /** 전체 여행지 개수 */
    int countDestination();

    /** 관광타입별 여행지 개수 */
    int countDestinationByType(@Param("contenttypeid") String contenttypeid);

    /** 상세정보 없는 여행지 개수 */
    int countDestinationsWithoutDetail();

    /** 썸네일 있는 여행지 개수 */
    int countDestinationsWithThumbnail();

    /** 이미지가 있는 여행지 중 랜덤 N개 조회 */
    List<Destination> selectRandomDestinationsWithImage(@Param("size") int size);
}