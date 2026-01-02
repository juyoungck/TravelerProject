package com.traveler.app.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 리뷰 DTO
 * 요청/응답 데이터 전송용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationReviewDto {
    
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
    
    /** 작성자 닉네임 (응답용) */
    private String memberNickname;
    
    /** 여행지 제목 (마이페이지 내 리뷰 목록용) */
    private String destinationTitle;
    
    /** 여행지 이미지 (마이페이지 내 리뷰 목록용) */
    private String destinationImage;
}