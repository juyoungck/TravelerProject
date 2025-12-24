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
    
    /** 여행지 저장 (없으면 INSERT, 있으면 UPDATE) */
    void mergeDestination(Destination destination);
    
    /** 여행지 단건 조회 */
    Destination selectDestinationById(String contentid);
    
    /** 여행지 목록 조회 (관광타입별) */
    List<Destination> selectDestinationsByType(@Param("contenttypeid") String contenttypeid);
    
    /** 여행지 목록 조회 (지역별) */
    List<Destination> selectDestinationsByRegion(
            @Param("lDongRegnCd") String lDongRegnCd,
            @Param("lDongSignguCd") String lDongSignguCd);
    
    /** 여행지 전체 개수 조회 */
    int countDestination();
    
    /** 여행지 개수 조회 (관광타입별) */
    int countDestinationByType(@Param("contenttypeid") String contenttypeid);
    
    /** 여행지 개요 업데이트 (상세정보) */
    void updateDestinationDetail(
            @Param("contentid") String contentid,
            @Param("overview") String overview,
            @Param("homepage") String homepage);
}