package com.traveler.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;

/**
 * OAuth2Config
 * 소셜 로그인 설정 정보를 관리하는 설정 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Configuration
public class OAuth2Config {
    
    // ============================================
    // 카카오 설정
    // ============================================
    @Value("${oauth2.kakao.client-id}")
    private String kakaoClientId;
    
    @Value("${oauth2.kakao.client-secret}")
    private String kakaoClientSecret;
    
    @Value("${oauth2.kakao.redirect-uri}")
    private String kakaoRedirectUri;
    
    // 카카오 OAuth URL (고정값)
    private final String kakaoAuthUrl = "https://kauth.kakao.com/oauth/authorize";
    private final String kakaoTokenUrl = "https://kauth.kakao.com/oauth/token";
    private final String kakaoUserInfoUrl = "https://kapi.kakao.com/v2/user/me";
    
    // ============================================
    // 네이버 설정
    // ============================================
    @Value("${oauth2.naver.client-id}")
    private String naverClientId;
    
    @Value("${oauth2.naver.client-secret}")
    private String naverClientSecret;
    
    @Value("${oauth2.naver.redirect-uri}")
    private String naverRedirectUri;
    
    // 네이버 OAuth URL (고정값)
    private final String naverAuthUrl = "https://nid.naver.com/oauth2.0/authorize";
    private final String naverTokenUrl = "https://nid.naver.com/oauth2.0/token";
    private final String naverUserInfoUrl = "https://openapi.naver.com/v1/nid/me";
    
    // ============================================
    // 구글 설정
    // ============================================
    @Value("${oauth2.google.client-id}")
    private String googleClientId;
    
    @Value("${oauth2.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${oauth2.google.redirect-uri}")
    private String googleRedirectUri;
    
    // 구글 OAuth URL (고정값)
    private final String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    private final String googleTokenUrl = "https://oauth2.googleapis.com/token";
    private final String googleUserInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
    
    // ============================================
    // 프론트엔드 URL
    // ============================================
    @Value("${app.base-url}:5173")
    private String frontendUrl;
}
