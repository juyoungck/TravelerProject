package com.traveler.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * SocialLinkDto
 * 소셜 계정 연동 요청/응답 DTO
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLinkDto {
    
    /** 제공자 (KAKAO, NAVER, GOOGLE) */
    private String provider;
    
    /** 연동 여부 */
    private boolean linked;
    
    /** 소셜 닉네임 (연동 시 선택용) */
    private String socialNickname;
    
    /** 소셜 이메일 */
    private String socialEmail;
    
    /** 닉네임 선택 (true: 소셜 닉네임 사용, false: 기존 닉네임 유지) */
    private boolean useSocialNickname;
}
