package com.traveler.app.dto;

import java.sql.Timestamp;
import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MyFavoritePlannerDto
 * 마이페이지 내 플래너 찜 목록 조회용 DTO
 * 
 * 찜 정보 + 플래너 정보를 함께 담음
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyFavoritePlannerDto {
    
    /** 찜 ID */
    private Long favId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 플래너 ID */
    private Long plnId;
    
    /** 찜한 날짜 */
    private Timestamp createdAt;
    
    // ============================================
    // 플래너 정보 (JOIN)
    // ============================================
    
    /** 플래너 제목 */
    private String plnTitle;
    
    /** 플래너 작성자 ID */
    private Long plnMId;
    
    /** 플래너 작성자 닉네임 */
    private String authorNickname;
    
    /** 여행 시작일 */
    private Date startDate;
    
    /** 여행 종료일 */
    private Date endDate;
    
    /** 총 일수 */
    private Integer totalDays;
    
    /** 시도 코드 */
    private String lDongRegnCd;
    
    /** 시군구 코드 */
    private String lDongSignguCd;
    
    /** 공개 여부 */
    private Integer isPublic;
}
