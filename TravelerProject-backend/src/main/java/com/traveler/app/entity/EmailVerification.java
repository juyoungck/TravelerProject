package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * EmailVerification 엔티티
 * 이메일 인증 테이블(email_verification)과 매핑되는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerification {
    
    /** 인증 ID (PK) */
    private Long evId;
    
    /** 이메일 */
    private String evEmail;
    
    /** 인증 코드 (6자리) */
    private String evCode;
    
    /** 만료 일시 */
    private Timestamp evExpiresAt;
    
    /** 인증 여부 (0: 미인증, 1: 인증완료) */
    private Integer evVerified;
    
    /** 생성일 */
    private Timestamp createdAt;
}
