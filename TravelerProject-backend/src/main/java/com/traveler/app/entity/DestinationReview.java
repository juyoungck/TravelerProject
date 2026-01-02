package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 리뷰 Entity
 * 테이블: review
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationReview {
    
    /** 리뷰 ID (PK) */
    private Long rvId;
    
    /** 회원 ID (FK) */
    private Long mId;
    
    /** 여행지 콘텐츠 ID (FK) */
    private String contentid;
    
    /** 리뷰 내용 */
    private String rvContent;
    
    /** 별점 (1~5) */
    private Integer rvRating;
    
    /** 작성일 */
    private Timestamp createdAt;
    
    /** 수정일 */
    private Timestamp updatedAt;
    
    /** 작성자 닉네임 (조인용, DB 컬럼 아님) */
    private String memberNickname;
}