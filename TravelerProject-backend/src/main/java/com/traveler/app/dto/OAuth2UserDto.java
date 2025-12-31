package com.traveler.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * OAuth2UserDto
 * 소셜 로그인에서 받아온 사용자 정보를 담는 DTO
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2UserDto {
    
    /**
     * 소셜 서비스 제공자 (KAKAO, NAVER, GOOGLE)
     */
    private String provider;
    
    /**
     * 소셜 서비스에서의 고유 ID
     */
    private String providerId;
    
    /**
     * 이메일 (없을 수도 있음)
     */
    private String email;
    
    /**
     * 닉네임
     */
    private String nickname;
    
    /**
     * 프로필 이미지 URL (없을 수도 있음)
     */
    private String profileImage;
}
