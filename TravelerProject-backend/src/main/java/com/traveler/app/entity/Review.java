package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Review Entity
 * 여행지 리뷰 엔티티
 * 
 * 테이블: review
 * - rv_id: 리뷰 ID (PK)
 * - m_id: 회원 ID (FK)
 * - contentid: 여행지 콘텐츠 ID (FK)
 * - rv_content: 리뷰 내용
 * - rv_rating: 별점 (1~5)
 * - created_at: 작성일
 * - updated_at: 수정일
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    /** 리뷰 ID */
    private Long rvId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 닉네임 */
    private String authorNickname; 
    
    /** 여행지 콘텐츠 ID */
    private String contentid;
    
    /** 여행지 이름 */
    private String destinationTitle;
    
    /** 리뷰 내용 */
    private String rvContent;
    
    /** 별점 (1~5) */
    private Integer rvRating;
    
    /** 작성일 */
    private Timestamp createdAt;
    
    /** 수정일 */
    private Timestamp updatedAt;
}
