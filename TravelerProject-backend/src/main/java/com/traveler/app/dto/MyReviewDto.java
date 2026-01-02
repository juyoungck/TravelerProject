package com.traveler.app.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MyReviewDto
 * 마이페이지 내 리뷰 목록 조회용 DTO
 * 
 * 리뷰 정보 + 여행지 정보를 함께 담음
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyReviewDto {
    
    /** 리뷰 ID */
    private Long rvId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 여행지 콘텐츠 ID */
    private String contentid;
    
    /** 리뷰 내용 */
    private String rvContent;
    
    /** 별점 (1~5) */
    private Integer rvRating;
    
    /** 작성일 */
    private Timestamp createdAt;
    
    /** 수정일 */
    private Timestamp updatedAt;
    
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
}
