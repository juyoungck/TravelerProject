package com.traveler.app.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MyFavoriteDestinationDto
 * 마이페이지 내 여행지 찜 목록 조회용 DTO
 * 
 * 찜 정보 + 여행지 정보를 함께 담음
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyFavoriteDestinationDto {
    
    /** 찜 ID */
    private Long favId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 여행지 콘텐츠 ID */
    private String contentid;
    
    /** 찜한 날짜 */
    private Timestamp createdAt;
    
    // ============================================
    // 여행지 정보 (JOIN)
    // ============================================
    
    /** 여행지 이름 */
    private String title;
    
    /** 여행지 대표 이미지 */
    private String firstimage;
    
    /** 여행지 주소 */
    private String addr1;
    
    /** 관광타입 ID */
    private String contenttypeid;
    
    /** 시도 코드 */
    private String lDongRegnCd;
    
    /** 시군구 코드 */
    private String lDongSignguCd;
}
