package com.traveler.app.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.dto.LoginResponseDto;
import com.traveler.app.service.OAuth2Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OAuth2Controller
 * 소셜 로그인 관련 API를 처리하는 컨트롤러
 * 
 * API 엔드포인트:
 * - GET /api/auth/oauth2/kakao : 카카오 로그인 시작
 * - GET /api/auth/oauth2/naver : 네이버 로그인 시작
 * - GET /api/auth/oauth2/google : 구글 로그인 시작
 * - GET /api/auth/oauth2/callback/kakao : 카카오 콜백
 * - GET /api/auth/oauth2/callback/naver : 네이버 콜백
 * - GET /api/auth/oauth2/callback/google : 구글 콜백
 * - GET /api/auth/oauth2/urls : 로그인 URL 목록 조회
 * 
 * @author TravelerProject
 */
@Slf4j
@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {
    
    private final OAuth2Service oauth2Service;
    
    // ============================================
    // 소셜 로그인 시작 (프론트엔드에서 호출)
    // ============================================
    
    /**
     * 카카오 로그인 페이지로 리다이렉트
     * GET /api/auth/oauth2/kakao
     */
    @GetMapping("/kakao")
    public void kakaoLogin(HttpServletResponse response) throws IOException {
        String loginUrl = oauth2Service.getKakaoLoginUrl();
        log.info("카카오 로그인 시작 - 리다이렉트 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }
    
    /**
     * 네이버 로그인 페이지로 리다이렉트
     * GET /api/auth/oauth2/naver
     */
    @GetMapping("/naver")
    public void naverLogin(HttpServletResponse response) throws IOException {
        String loginUrl = oauth2Service.getNaverLoginUrl();
        log.info("네이버 로그인 시작 - 리다이렉트 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }
    
    /**
     * 구글 로그인 페이지로 리다이렉트
     * GET /api/auth/oauth2/google
     */
    @GetMapping("/google")
    public void googleLogin(HttpServletResponse response) throws IOException {
        String loginUrl = oauth2Service.getGoogleLoginUrl();
        log.info("구글 로그인 시작 - 리다이렉트 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }
    
    // ============================================
    // 소셜 로그인 콜백 (소셜 서비스에서 호출)
    // ============================================
    
    /**
     * 카카오 로그인 콜백
     * GET /api/auth/oauth2/callback/kakao
     * 
     * 카카오에서 인가 코드를 받아 로그인 처리 후 프론트엔드로 리다이렉트
     */
    @GetMapping("/callback/kakao")
    public void kakaoCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String errorDescription,
            HttpServletResponse response) throws IOException {
        
        // 에러 처리
        if (error != null) {
            log.error("카카오 로그인 에러: {} - {}", error, errorDescription);
            redirectWithError(response, "카카오 로그인이 취소되었습니다.");
            return;
        }
        
        if (code == null) {
            log.error("카카오 콜백 - 인가 코드 없음");
            redirectWithError(response, "인가 코드를 받지 못했습니다.");
            return;
        }
        
        try {
            log.info("카카오 콜백 처리 시작 - 인가코드: {}...", code.substring(0, Math.min(10, code.length())));
            LoginResponseDto loginResponse = oauth2Service.kakaoCallback(code);
            redirectWithTokens(response, loginResponse);
        } catch (Exception e) {
            log.error("카카오 로그인 처리 실패", e);
            redirectWithError(response, e.getMessage());
        }
    }
    
    /**
     * 네이버 로그인 콜백
     * GET /api/auth/oauth2/callback/naver
     * 
     * 네이버에서 인가 코드를 받아 로그인 처리 후 프론트엔드로 리다이렉트
     */
    @GetMapping("/callback/naver")
    public void naverCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String errorDescription,
            HttpServletResponse response) throws IOException {
        
        // 에러 처리
        if (error != null) {
            log.error("네이버 로그인 에러: {} - {}", error, errorDescription);
            redirectWithError(response, "네이버 로그인이 취소되었습니다.");
            return;
        }
        
        if (code == null) {
            log.error("네이버 콜백 - 인가 코드 없음");
            redirectWithError(response, "인가 코드를 받지 못했습니다.");
            return;
        }
        
        try {
            log.info("네이버 콜백 처리 시작 - 인가코드: {}...", code.substring(0, Math.min(10, code.length())));
            LoginResponseDto loginResponse = oauth2Service.naverCallback(code, state);
            redirectWithTokens(response, loginResponse);
        } catch (Exception e) {
            log.error("네이버 로그인 처리 실패", e);
            redirectWithError(response, e.getMessage());
        }
    }
    
    /**
     * 구글 로그인 콜백
     * GET /api/auth/oauth2/callback/google
     * 
     * 구글에서 인가 코드를 받아 로그인 처리 후 프론트엔드로 리다이렉트
     */
    @GetMapping("/callback/google")
    public void googleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            HttpServletResponse response) throws IOException {
        
        // 에러 처리
        if (error != null) {
            log.error("구글 로그인 에러: {}", error);
            redirectWithError(response, "구글 로그인이 취소되었습니다.");
            return;
        }
        
        if (code == null) {
            log.error("구글 콜백 - 인가 코드 없음");
            redirectWithError(response, "인가 코드를 받지 못했습니다.");
            return;
        }
        
        try {
            log.info("구글 콜백 처리 시작 - 인가코드: {}...", code.substring(0, Math.min(10, code.length())));
            LoginResponseDto loginResponse = oauth2Service.googleCallback(code);
            redirectWithTokens(response, loginResponse);
        } catch (Exception e) {
            log.error("구글 로그인 처리 실패", e);
            redirectWithError(response, e.getMessage());
        }
    }
    
    // ============================================
    // 소셜 로그인 URL 조회 API (프론트엔드용)
    // ============================================
    
    /**
     * 소셜 로그인 URL 목록 조회
     * GET /api/auth/oauth2/urls
     * 
     * 프론트엔드에서 직접 소셜 로그인 페이지로 이동할 때 사용
     */
    @GetMapping("/urls")
    public ResponseEntity<Map<String, String>> getLoginUrls() {
        Map<String, String> urls = new HashMap<>();
        urls.put("kakao", oauth2Service.getKakaoLoginUrl());
        urls.put("naver", oauth2Service.getNaverLoginUrl());
        urls.put("google", oauth2Service.getGoogleLoginUrl());
        return ResponseEntity.ok(urls);
    }
    
    // ============================================
    // 헬퍼 메서드
    // ============================================
    
    /**
     * 토큰과 함께 프론트엔드로 리다이렉트
     * 
     * 리다이렉트 URL: http://localhost:5173/oauth2/callback?accessToken=xxx&refreshToken=xxx&...
     */
    private void redirectWithTokens(HttpServletResponse response, LoginResponseDto loginResponse) throws IOException {
        String frontendUrl = oauth2Service.getFrontendUrl();
        String redirectUrl = frontendUrl + "/oauth2/callback"
                + "?accessToken=" + loginResponse.getAccessToken()
                + "&refreshToken=" + loginResponse.getRefreshToken()
                + "&tokenType=" + loginResponse.getTokenType()
                + "&expiresIn=" + loginResponse.getExpiresIn();
        
        log.info("소셜 로그인 성공 - 프론트엔드로 리다이렉트: {}/oauth2/callback", frontendUrl);
        response.sendRedirect(redirectUrl);
    }
    
    /**
     * 에러와 함께 프론트엔드로 리다이렉트
     * 
     * 리다이렉트 URL: http://localhost:5173/oauth2/callback?error=xxx
     */
    private void redirectWithError(HttpServletResponse response, String errorMessage) throws IOException {
        String frontendUrl = oauth2Service.getFrontendUrl();
        String encodedError = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8.toString());
        String redirectUrl = frontendUrl + "/oauth2/callback?error=" + encodedError;
        
        log.info("소셜 로그인 실패 - 프론트엔드로 리다이렉트: {}/oauth2/callback?error=...", frontendUrl);
        response.sendRedirect(redirectUrl);
    }
}
