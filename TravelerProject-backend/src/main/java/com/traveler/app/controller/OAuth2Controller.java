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
import com.traveler.app.dto.OAuth2UserDto;
import com.traveler.app.service.OAuth2Service;
import com.traveler.app.service.SocialLinkService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OAuth2Controller
 * 소셜 로그인 + 소셜 연동 API를 처리하는 컨트롤러
 * 
 * API 엔드포인트:
 * [로그인]
 * - GET /api/auth/oauth2/kakao : 카카오 로그인 시작
 * - GET /api/auth/oauth2/naver : 네이버 로그인 시작
 * - GET /api/auth/oauth2/google : 구글 로그인 시작
 * - GET /api/auth/oauth2/callback/kakao : 카카오 콜백
 * - GET /api/auth/oauth2/callback/naver : 네이버 콜백
 * - GET /api/auth/oauth2/callback/google : 구글 콜백
 * - GET /api/auth/oauth2/urls : 로그인 URL 목록 조회
 * 
 * [연동] - 추가!
 * - GET /api/auth/oauth2/link/kakao : 카카오 연동 시작
 * - GET /api/auth/oauth2/link/naver : 네이버 연동 시작
 * - GET /api/auth/oauth2/link/google : 구글 연동 시작
 * 
 * @author TravelerProject
 */
@Slf4j
@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {
    
    private final OAuth2Service oauth2Service;
    private final SocialLinkService socialLinkService;
    
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
    // 소셜 연동 시작 (마이페이지에서 호출) - 추가!
    // ============================================
    
    /**
     * 카카오 연동 시작
     * GET /api/auth/oauth2/link/kakao
     * 
     * state=link 파라미터로 연동 모드 구분
     */
    @GetMapping("/link/kakao")
    public void kakaoLink(HttpServletResponse response) throws IOException {
        String loginUrl = oauth2Service.getKakaoLoginUrl() + "&state=link";
        log.info("카카오 연동 시작 - 리다이렉트 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }
    
    /**
     * 네이버 연동 시작
     * GET /api/auth/oauth2/link/naver
     * 
     * state 파라미터 앞에 "link_" 추가하여 연동 모드 구분
     */
    @GetMapping("/link/naver")
    public void naverLink(HttpServletResponse response) throws IOException {
        // 네이버는 이미 state 파라미터가 있으므로 앞에 "link_" 추가
        String loginUrl = oauth2Service.getNaverLoginUrl();
        loginUrl = loginUrl.replace("&state=", "&state=link_");
        log.info("네이버 연동 시작 - 리다이렉트 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }
    
    /**
     * 구글 연동 시작
     * GET /api/auth/oauth2/link/google
     * 
     * state=link 파라미터로 연동 모드 구분
     */
    @GetMapping("/link/google")
    public void googleLink(HttpServletResponse response) throws IOException {
        String loginUrl = oauth2Service.getGoogleLoginUrl() + "&state=link";
        log.info("구글 연동 시작 - 리다이렉트 URL: {}", loginUrl);
        response.sendRedirect(loginUrl);
    }
    
    // ============================================
    // 소셜 로그인/연동 콜백 (소셜 서비스에서 호출)
    // ============================================
    
    /**
     * 카카오 로그인/연동 콜백
     * GET /api/auth/oauth2/callback/kakao
     * 
     * state=link 이면 연동 모드, 아니면 로그인 모드
     */
    @GetMapping("/callback/kakao")
    public void kakaoCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String errorDescription,
            HttpServletResponse response) throws IOException {
        
        // 에러 처리
        if (error != null) {
            log.error("카카오 로그인 에러: {} - {}", error, errorDescription);
            redirectWithError(response, "카카오 로그인이 취소되었습니다.", "link".equals(state));
            return;
        }
        
        if (code == null) {
            log.error("카카오 콜백 - 인가 코드 없음");
            redirectWithError(response, "인가 코드를 받지 못했습니다.", "link".equals(state));
            return;
        }
        
        try {
            log.info("카카오 콜백 처리 시작 - 인가코드: {}..., state: {}", 
                    code.substring(0, Math.min(10, code.length())), state);
            
            // 연동 모드인지 확인
            if ("link".equals(state)) {
                // 연동 모드: 소셜 정보만 가져와서 프론트로 전달
                OAuth2UserDto userDto = oauth2Service.getKakaoUserInfoByCode(code);
                redirectWithLinkInfo(response, userDto);
            } else {
                // 로그인 모드: 기존 로직
                LoginResponseDto loginResponse = oauth2Service.kakaoCallback(code);
                redirectWithTokens(response, loginResponse);
            }
        } catch (Exception e) {
            log.error("카카오 콜백 처리 실패", e);
            redirectWithError(response, e.getMessage(), "link".equals(state));
        }
    }
    
    /**
     * 네이버 로그인/연동 콜백
     * GET /api/auth/oauth2/callback/naver
     * 
     * state가 "link_"로 시작하면 연동 모드
     */
    @GetMapping("/callback/naver")
    public void naverCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String errorDescription,
            HttpServletResponse response) throws IOException {
        
        // 연동 모드인지 확인
        boolean isLinkMode = state != null && state.startsWith("link_");
        String actualState = isLinkMode ? state.substring(5) : state;
        
        // 에러 처리
        if (error != null) {
            log.error("네이버 로그인 에러: {} - {}", error, errorDescription);
            redirectWithError(response, "네이버 로그인이 취소되었습니다.", isLinkMode);
            return;
        }
        
        if (code == null) {
            log.error("네이버 콜백 - 인가 코드 없음");
            redirectWithError(response, "인가 코드를 받지 못했습니다.", isLinkMode);
            return;
        }
        
        try {
            log.info("네이버 콜백 처리 시작 - 인가코드: {}..., state: {}, isLinkMode: {}", 
                    code.substring(0, Math.min(10, code.length())), state, isLinkMode);
            
            if (isLinkMode) {
                // 연동 모드
                OAuth2UserDto userDto = oauth2Service.getNaverUserInfoByCode(code, actualState);
                redirectWithLinkInfo(response, userDto);
            } else {
                // 로그인 모드
                LoginResponseDto loginResponse = oauth2Service.naverCallback(code, state);
                redirectWithTokens(response, loginResponse);
            }
        } catch (Exception e) {
            log.error("네이버 콜백 처리 실패", e);
            redirectWithError(response, e.getMessage(), isLinkMode);
        }
    }
    
    /**
     * 구글 로그인/연동 콜백
     * GET /api/auth/oauth2/callback/google
     * 
     * state=link 이면 연동 모드
     */
    @GetMapping("/callback/google")
    public void googleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            HttpServletResponse response) throws IOException {
        
        // 연동 모드인지 확인
        boolean isLinkMode = "link".equals(state);
        
        // 에러 처리
        if (error != null) {
            log.error("구글 로그인 에러: {}", error);
            redirectWithError(response, "구글 로그인이 취소되었습니다.", isLinkMode);
            return;
        }
        
        if (code == null) {
            log.error("구글 콜백 - 인가 코드 없음");
            redirectWithError(response, "인가 코드를 받지 못했습니다.", isLinkMode);
            return;
        }
        
        try {
            log.info("구글 콜백 처리 시작 - 인가코드: {}..., state: {}", 
                    code.substring(0, Math.min(10, code.length())), state);
            
            if (isLinkMode) {
                // 연동 모드
                OAuth2UserDto userDto = oauth2Service.getGoogleUserInfoByCode(code);
                redirectWithLinkInfo(response, userDto);
            } else {
                // 로그인 모드
                LoginResponseDto loginResponse = oauth2Service.googleCallback(code);
                redirectWithTokens(response, loginResponse);
            }
        } catch (Exception e) {
            log.error("구글 콜백 처리 실패", e);
            redirectWithError(response, e.getMessage(), isLinkMode);
        }
    }
    
    // ============================================
    // 소셜 로그인 URL 조회 API (프론트엔드용)
    // ============================================
    
    /**
     * 소셜 로그인 URL 목록 조회
     * GET /api/auth/oauth2/urls
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
     * 로그인 성공 - 토큰과 함께 프론트엔드로 리다이렉트
     */
    private void redirectWithTokens(HttpServletResponse response, LoginResponseDto loginResponse) throws IOException {
        String frontendUrl = oauth2Service.getFrontendUrl();
        String redirectUrl = frontendUrl + "/oauth2/callback"
                + "?accessToken=" + loginResponse.getAccessToken()
                + "&refreshToken=" + loginResponse.getRefreshToken()
                + "&tokenType=" + loginResponse.getTokenType()
                + "&expiresIn=" + loginResponse.getExpiresIn()
                + "&isNewUser=" + loginResponse.isNewUser();
        
        log.info("소셜 로그인 성공 - 프론트엔드로 리다이렉트: {}/oauth2/callback", frontendUrl);
        response.sendRedirect(redirectUrl);
    }
    
    /**
     * 연동 모드 - 소셜 정보와 함께 프론트엔드로 리다이렉트
     */
    private void redirectWithLinkInfo(HttpServletResponse response, OAuth2UserDto userDto) throws IOException {
        String frontendUrl = oauth2Service.getFrontendUrl();
        
        // 이미 가입된 소셜 계정인지 확인
        boolean isAlreadyRegistered = socialLinkService.isAlreadyRegistered(
                userDto.getProvider(), userDto.getProviderId());
        
        // 이미 다른 계정에 연동된 소셜 계정인지 확인
        boolean isAlreadyLinked = socialLinkService.isAlreadyLinked(
                userDto.getProvider(), userDto.getProviderId());
        
        String redirectUrl = frontendUrl + "/oauth2/link/callback"
                + "?provider=" + userDto.getProvider()
                + "&providerId=" + userDto.getProviderId()
                + "&email=" + URLEncoder.encode(userDto.getEmail() != null ? userDto.getEmail() : "", StandardCharsets.UTF_8)
                + "&nickname=" + URLEncoder.encode(userDto.getNickname() != null ? userDto.getNickname() : "", StandardCharsets.UTF_8)
                + "&isAlreadyRegistered=" + isAlreadyRegistered
                + "&isAlreadyLinked=" + isAlreadyLinked;
        
        log.info("소셜 연동 정보 전달 - provider: {}, isAlreadyRegistered: {}, isAlreadyLinked: {}", 
                userDto.getProvider(), isAlreadyRegistered, isAlreadyLinked);
        response.sendRedirect(redirectUrl);
    }
    
    /**
     * 에러와 함께 프론트엔드로 리다이렉트
     * 
     * @param isLinkMode 연동 모드 여부
     */
    private void redirectWithError(HttpServletResponse response, String errorMessage, boolean isLinkMode) throws IOException {
        String frontendUrl = oauth2Service.getFrontendUrl();
        String encodedError = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        
        // 연동 모드면 /oauth2/link/callback, 로그인 모드면 /oauth2/callback
        String callbackPath = isLinkMode ? "/oauth2/link/callback" : "/oauth2/callback";
        String redirectUrl = frontendUrl + callbackPath + "?error=" + encodedError;
        
        log.info("소셜 {} 실패 - 프론트엔드로 리다이렉트: {}{}?error=...", 
                isLinkMode ? "연동" : "로그인", frontendUrl, callbackPath);
        response.sendRedirect(redirectUrl);
    }
}