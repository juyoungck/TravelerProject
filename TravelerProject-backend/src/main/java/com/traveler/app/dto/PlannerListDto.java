package com.traveler.app.dto;

import java.sql.Timestamp;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 플래너 목록 응답 DTO
 * - 플래너 목록 조회 시 반환하는 데이터 구조
 * - 목록에서 필요한 정보만 포함 (간략한 정보)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerListDto {
    
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
    
    /** 지역명 (예: "서울", "제주") */
    private String regionName;
    
    /** 공개 여부 */
    private Integer isPublic;
    
    /** 생성일 */
    private Timestamp createdAt;
    
    /** 대표 이미지 (첫 번째 장소의 이미지) */
    private String thumbnailImage;
    
    /** 찜 개수 */
    private Integer favoriteCount;
}
