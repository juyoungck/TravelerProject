package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * RefreshToken 엔티티
 * JWT 리프레시 토큰 테이블(refresh_token)과 매핑되는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    
    /** 토큰 ID (PK) */
    private Long rtId;
    
    /** 회원 ID (FK) */
    private Long mId;
    
    /** 리프레시 토큰 값 */
    private String rtToken;
    
    /** 만료 일시 */
    private Timestamp rtExpiresAt;
    
    /** 생성일 */
    private Timestamp createdAt;
}
