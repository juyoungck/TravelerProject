package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.dto.PlannerDetailDto.DayPlanDetailDto;
import com.traveler.app.entity.PlannerDay;

/**
 * 플래너 일차 DAO 인터페이스
 * - MyBatis Mapper와 연결
 * - planner_day 테이블 CRUD 메서드 정의
 */
@Mapper
public interface PlannerDayDao {
    
    /**
     * 플래너 일차 생성
     * @param plannerDay 플래너 일차 엔티티
     * @return 생성된 행 수
     */
    int insertPlannerDay(PlannerDay plannerDay);
    
    /**
     * 플래너 일차 수정 (메모 등)
     * @param plannerDay 플래너 일차 엔티티
     * @return 수정된 행 수
     */
    int updatePlannerDay(PlannerDay plannerDay);
    
    /**
     * 플래너 일차 삭제
     * @param dayId 일차 ID
     * @return 삭제된 행 수
     */
    int deletePlannerDay(@Param("dayId") Long dayId);
    
    /**
     * 플래너의 모든 일차 삭제
     * @param plnId 플래너 ID
     * @return 삭제된 행 수
     */
    int deletePlannerDaysByPlnId(@Param("plnId") Long plnId);
    
    /**
     * 일차 ID로 조회
     * @param dayId 일차 ID
     * @return 플래너 일차 엔티티
     */
    PlannerDay selectPlannerDayById(@Param("dayId") Long dayId);
    
    /**
     * 플래너의 모든 일차 조회 (장소 정보 포함)
     * @param plnId 플래너 ID
     * @return 일차별 상세 DTO 목록
     */
    List<DayPlanDetailDto> selectDayPlansByPlnId(@Param("plnId") Long plnId);
    
    /**
     * 플래너의 모든 일차 조회 (Entity만)
     * @param plnId 플래너 ID
     * @return 플래너 일차 엔티티 목록
     */
    List<PlannerDay> selectPlannerDaysByPlnId(@Param("plnId") Long plnId);
}
