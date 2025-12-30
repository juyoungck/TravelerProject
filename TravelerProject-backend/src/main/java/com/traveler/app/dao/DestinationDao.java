package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.Destination;

/**
 * 여행지 DAO (MyBatis Mapper)
 * 여행지 정보 CRUD
 */
@Mapper
public interface DestinationDao {
    
    /** 여행지 단건 조회 */
    Destination selectDestinationById(String contentid);
    
    /** 여행지 목록 조회 (관광타입별) */
    List<Destination> selectDestinationsByType(@Param("contenttypeid") String contenttypeid);
    
    /** 여행지 목록 조회 (지역별) */
    List<Destination> selectDestinationsByRegion(
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd);
    
    /** 여행지 목록 조회 (페이징) */
    List<Destination> selectDestinationsByTypeWithPaging(
            @Param("contenttypeid") String contenttypeid,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /** 여행지 목록 조회 (관광타입 + 지역 + 페이징) */
    List<Destination> selectDestinationsByTypeAndRegion(
            @Param("contenttypeid") String contenttypeid,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /** 시군구 이름 조회 */
    String selectSignguName(@Param("lDongRegnCd") String lDongRegnCd, @Param("lDongSignguCd") String lDongSignguCd);
    
    /** 여행지 전체 개수 조회 */
    int countDestination();
    
    /** 여행지 개수 조회 (관광타입별) */
    int countDestinationByType(@Param("contenttypeid") String contenttypeid);

    /** 여행지 개수 조회 (관광타입 + 지역) */
    int countDestinationByTypeAndRegion(
            @Param("contenttypeid") String contenttypeid,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd);

    /** 여행지 저장/수정 (MERGE) */
    int mergeDestination(Destination destination);

    /** 여행지 상세정보 업데이트 */
    int updateDestinationDetail(Destination destination);

    /** 키워드 검색 */
    List<Destination> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /** 키워드 검색 결과 개수 */
    int countByKeyword(@Param("keyword") String keyword);

    /** 키워드 + 지역 검색 */
    List<Destination> searchByKeywordAndRegion(
            @Param("keyword") String keyword,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /** 키워드 + 지역 검색 결과 개수 */
    int countByKeywordAndRegion(
            @Param("keyword") String keyword,
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd);
}
