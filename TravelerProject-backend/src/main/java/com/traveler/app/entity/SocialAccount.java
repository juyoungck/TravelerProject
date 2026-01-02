package com.traveler.app.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * SocialAccount Entity
 * 소셜 계정 연동 정보
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAccount {
    
    /** 소셜계정 ID */
    private Long saId;
    
    /** 회원 ID (FK) */
    private Long mId;
    
    /** 제공자 (GOOGLE, NAVER, KAKAO) */
    private String saProvider;
    
    /** 제공자 고유 ID */
    private String saProviderId;
    
    /** 소셜 이메일 */
    private String saEmail;
    
    /** 소셜 닉네임 */
    private String saNickname;
    
    /** 액세스 토큰 */
    private String saAccessToken;
    
    /** 리프레시 토큰 */
    private String saRefreshToken;
    
    /** 토큰 만료일시 */
    private Date saTokenExpires;
    
    /** 연동일 */
    private Date createdAt;
    
    /** 수정일 */
    private Date updatedAt;
}
