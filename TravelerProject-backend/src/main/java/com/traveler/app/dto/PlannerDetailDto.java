package com.traveler.app.dto;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 플래너 상세 응답 DTO
 * - 플래너 조회 시 반환하는 데이터 구조
 * - 플래너 기본 정보 + 일차별 장소 정보 + 지역명 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerDetailDto {
    
    /** 플래너 ID */
    private Long plnId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 작성자 닉네임 */
    private String authorNickname;
    
    /** 여행 제목 */
    private String plnTitle;
    
    /** 시작일 */
    private LocalDate startDate;
    
    /** 종료일 */
    private LocalDate endDate;
    
    /** 총 일수 */
    private Integer totalDays;
    
    /** 법정동 시도코드 */
    private String lDongRegnCd;
    
    /** 법정동 시군구코드 */
    private String lDongSignguCd;
    
    /** 지역명 (예: "서울 종로구") */
    private String regionName;
    
    /** 공유 링크 */
    private String shareLink;
    
    /** 공개 여부 */
    private Integer isPublic;
    
    /** 생성일 */
    private Timestamp createdAt;
    
    /** 수정일 */
    private Timestamp updatedAt;
    
    /** 찜 개수 */
    private Integer favoriteCount;
    
    /** 일차별 계획 목록 */
    private List<DayPlanDetailDto> dayPlans;
    
    /**
     * 일차별 계획 상세 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayPlanDetailDto {
        
        /** 일차 ID */
        private Long dayId;
        
        /** N일차 */
        private Integer dayNumber;
        
        /** 여행 일자 */
        private LocalDate tripDate;
        
        /** 메모 */
        private String memo;
        
        /** 해당 일차의 장소 목록 */
        private List<PlaceDetailDto> places;
    }
    
    /**
     * 장소 상세 DTO (destination 정보 포함)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceDetailDto {
        
        /** 장소 ID */
        private Long placeId;
        
        /** 콘텐츠 ID */
        private String contentid;
        
        /** 방문 순서 */
        private Integer sortOrder;
        
        /** 여행지 이름 */
        private String title;
        
        /** 여행지 주소 */
        private String addr1;
        
        /** 대표 이미지 */
        private String firstimage;
        
        /** 관광 타입 ID */
        private String contenttypeid;
        
        /** GPS X좌표 (경도) */
        private String mapx;
        
        /** GPS Y좌표 (위도) */
        private String mapy;
    }
}
