package com.traveler.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 로그인 응답 DTO
 * 로그인 성공 시 반환되는 JWT 토큰 및 회원 정보를 담는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    
    /** Access Token (API 요청 시 사용) */
    private String accessToken;
    
    /** Refresh Token (Access Token 갱신 시 사용) */
    private String refreshToken;
    
    /** 토큰 타입 (Bearer) */
    private String tokenType;
    
    /** Access Token 만료 시간 (초) */
    private Long expiresIn;
    
    /** 회원 정보 */
    private MemberResponseDto member;
}
