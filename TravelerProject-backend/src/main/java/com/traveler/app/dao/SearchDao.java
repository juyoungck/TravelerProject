package com.traveler.app.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 통합 검색 DAO (MyBatis Mapper)
 * 여행지, 플래너 검색
 */
@Mapper
public interface SearchDao {

    /**
     * 여행지 검색 (이름, 주소)
     * @param keyword 검색어
     * @param offset 시작 위치
     * @param limit 개수
     * @return 여행지 목록 (contentid, title, addr1, regionName)
     */
    List<Map<String, Object>> searchDestinations(
            @Param("keyword") String keyword,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /**
     * 여행지 검색 개수
     * @param keyword 검색어
     * @return 검색 결과 개수
     */
    int countSearchDestinations(@Param("keyword") String keyword);

    /**
     * 플래너 검색 (이름)
     * @param keyword 검색어
     * @param offset 시작 위치
     * @param limit 개수
     * @return 플래너 목록 (pln_id, pln_title, regionName)
     */
    List<Map<String, Object>> searchPlanners(
            @Param("keyword") String keyword,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /**
     * 플래너 검색 개수
     * @param keyword 검색어
     * @return 검색 결과 개수
     */
    int countSearchPlanners(@Param("keyword") String keyword);
}