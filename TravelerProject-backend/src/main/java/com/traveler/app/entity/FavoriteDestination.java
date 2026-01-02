package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * FavoriteDestination Entity
 * 여행지 찜 엔티티
 * 
 * 테이블: favorite_destination
 * - fav_id: 찜 ID (PK)
 * - m_id: 회원 ID (FK)
 * - contentid: 여행지 콘텐츠 ID (FK)
 * - created_at: 생성일
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDestination {
    
    /** 찜 ID */
    private Long favId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 여행지 콘텐츠 ID */
    private String contentid;
    
    /** 생성일 */
    private Timestamp createdAt;
}
