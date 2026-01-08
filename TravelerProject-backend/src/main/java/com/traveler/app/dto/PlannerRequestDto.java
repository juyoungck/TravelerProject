package com.traveler.app.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 플래너 생성/수정 요청 DTO
 * - 프론트엔드에서 저장 버튼 클릭 시 전송하는 데이터 구조
 * - 플래너 기본 정보 + 일차별 장소 정보를 한 번에 전송
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerRequestDto {
    
    /** 회원 ID (JWT 구현 전까지 임시로 사용) */
    private Long mId;
    
    /** 여행 제목 */
    private String plnTitle;
    
    /** 시작일 (yyyy-MM-dd) */
    private LocalDate startDate;
    
    /** 종료일 (yyyy-MM-dd) */
    private LocalDate endDate;
    
    /** 법정동 시도코드 */
    private String lDongRegnCd;
    
    /** 법정동 시군구코드 */
    private String lDongSignguCd;
    
    /** 공개 여부 (0: 비공개, 1: 공개) */
    private Integer isPublic;
    
    /** 일차별 계획 목록 */
    private List<DayPlanDto> dayPlans;
    
    /**
     * 일차별 계획 DTO (내부 클래스)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayPlanDto {
        
        /** N일차 */
        private Integer dayNumber;
        
        /** 여행 일자 */
        private LocalDate tripDate;
        
        /** 메모 */
        private String memo;
        
        /** 해당 일차의 장소 목록 */
        private List<PlaceDto> places;
    }
    
    /**
     * 장소 DTO (내부 클래스)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceDto {
        
        /** 콘텐츠 ID (destination 테이블의 PK) */
        private String contentid;
        
        /** 방문 순서 */
        private Integer sortOrder;
    }
}
