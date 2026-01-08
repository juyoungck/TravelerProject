package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.dto.PlannerDetailDto;
import com.traveler.app.dto.PlannerListDto;
import com.traveler.app.entity.Planner;

/**
 * 플래너 DAO 인터페이스
 * - MyBatis Mapper와 연결
 * - 플래너 테이블 CRUD 메서드 정의
 */
@Mapper
public interface PlannerDao {
    
    /**
     * 플래너 생성
     * @param planner 플래너 엔티티
     * @return 생성된 행 수
     */
    int insertPlanner(Planner planner);
    
    /**
     * 플래너 기본 정보 수정
     * @param planner 플래너 엔티티
     * @return 수정된 행 수
     */
    int updatePlanner(Planner planner);
    
    /**
     * 플래너 삭제
     * @param plnId 플래너 ID
     * @return 삭제된 행 수
     */
    int deletePlanner(@Param("plnId") Long plnId);
    
    /**
     * 플래너 기본 정보 조회 (Entity)
     * @param plnId 플래너 ID
     * @return 플래너 엔티티
     */
    Planner selectPlannerById(@Param("plnId") Long plnId);
    
    /**
     * 플래너 상세 조회 (DTO - 작성자 닉네임, 지역명 포함)
     * @param plnId 플래너 ID
     * @return 플래너 상세 DTO
     */
    PlannerDetailDto selectPlannerDetail(@Param("plnId") Long plnId);
    
    /**
     * 내 플래너 목록 조회
     * @param mId 회원 ID
     * @param offset 시작 위치
     * @param size 조회 개수
     * @return 플래너 목록
     */
    List<PlannerListDto> selectMyPlannerList(
        @Param("mId") Long mId, 
        @Param("offset") int offset, 
        @Param("size") int size
    );
    
    /**
     * 내 플래너 총 개수
     * @param mId 회원 ID
     * @return 총 개수
     */
    int countMyPlanners(@Param("mId") Long mId);
    
    /**
     * 인기 플래너 목록 조회 (공개된 플래너만)
     * @param offset 시작 위치
     * @param size 조회 개수
     * @return 플래너 목록
     */
    List<PlannerListDto> selectPopularPlannerList(
        @Param("offset") int offset, 
        @Param("size") int size
    );
    
    /**
     * 공개 플래너 총 개수
     * @return 총 개수
     */
    int countPublicPlanners();
    
    /**
     * 공유 링크로 플래너 조회
     * @param shareLink 공유 링크
     * @return 플래너 상세 DTO
     */
    PlannerDetailDto selectPlannerByShareLink(@Param("shareLink") String shareLink);
    
    /**
     * 공유 링크 업데이트
     * @param plnId 플래너 ID
     * @param shareLink 공유 링크
     * @return 수정된 행 수
     */
    int updateShareLink(@Param("plnId") Long plnId, @Param("shareLink") String shareLink);
}
