package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * FavoritePlanner Entity
 * 플래너 찜 엔티티
 * 
 * 테이블: favorite_planner
 * - fav_id: 찜 ID (PK)
 * - m_id: 회원 ID (FK)
 * - pln_id: 플래너 ID (FK)
 * - created_at: 생성일
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoritePlanner {
    
    /** 찜 ID */
    private Long favId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 플래너 ID */
    private Long plnId;
    
    /** 생성일 */
    private Timestamp createdAt;
}
