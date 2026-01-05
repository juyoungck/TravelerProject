package com.traveler.app.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * FavoritePlanner Entity
 * 플래너 찜(즐겨찾기) 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoritePlanner {
    
    /** 찜 ID (PK) */
    private Long favId;
    
    /** 회원 ID (FK) */
    private Long mId;
    
    /** 플래너 ID (FK) */
    private Long plnId;
    
    /** 생성일 */
    private LocalDateTime createdAt;
}
