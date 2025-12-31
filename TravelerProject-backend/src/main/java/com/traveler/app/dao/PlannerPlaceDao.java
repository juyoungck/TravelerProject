package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.dto.PlannerDetailDto.PlaceDetailDto;
import com.traveler.app.entity.PlannerPlace;

/**
 * 플래너 장소 DAO 인터페이스
 * - MyBatis Mapper와 연결
 * - planner_place 테이블 CRUD 메서드 정의
 */
@Mapper
public interface PlannerPlaceDao {
    
    /**
     * 플래너 장소 생성
     * @param plannerPlace 플래너 장소 엔티티
     * @return 생성된 행 수
     */
    int insertPlannerPlace(PlannerPlace plannerPlace);
    
    /**
     * 플래너 장소 일괄 생성
     * @param places 플래너 장소 엔티티 목록
     * @return 생성된 행 수
     */
    int insertPlannerPlaces(@Param("places") List<PlannerPlace> places);
    
    /**
     * 플래너 장소 삭제
     * @param placeId 장소 ID
     * @return 삭제된 행 수
     */
    int deletePlannerPlace(@Param("placeId") Long placeId);
    
    /**
     * 일차의 모든 장소 삭제
     * @param dayId 일차 ID
     * @return 삭제된 행 수
     */
    int deletePlannerPlacesByDayId(@Param("dayId") Long dayId);
    
    /**
     * 일차의 모든 장소 조회 (상세 정보 포함)
     * @param dayId 일차 ID
     * @return 장소 상세 DTO 목록
     */
    List<PlaceDetailDto> selectPlacesByDayId(@Param("dayId") Long dayId);
    
    /**
     * 일차의 모든 장소 조회 (Entity만)
     * @param dayId 일차 ID
     * @return 플래너 장소 엔티티 목록
     */
    List<PlannerPlace> selectPlannerPlacesByDayId(@Param("dayId") Long dayId);
    
    /**
     * 플래너의 첫 번째 장소 이미지 조회 (목록용 썸네일)
     * @param plnId 플래너 ID
     * @return 첫 번째 장소의 대표 이미지 URL
     */
    String selectFirstPlaceImage(@Param("plnId") Long plnId);
}
