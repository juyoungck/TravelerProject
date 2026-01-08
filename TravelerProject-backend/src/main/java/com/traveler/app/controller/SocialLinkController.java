package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.dto.OAuth2UserDto;
import com.traveler.app.dto.SocialLinkDto;
import com.traveler.app.service.JwtService;
import com.traveler.app.service.SocialLinkService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * SocialLinkController
 * 소셜 계정 연동 API
 * 
 * 플로우:
 * 1. 프론트에서 연동하기 클릭 → /api/auth/social/link/{provider} 호출
 * 2. 소셜 로그인 페이지로 리다이렉트
 * 3. 소셜 로그인 완료 후 콜백 → /api/auth/social/link/callback/{provider}
 * 4. 닉네임 선택 모달 표시 (프론트)
 * 5. 연동 확정 → /api/auth/social/link/confirm
 * 
 * @author TravelerProject
 */
@Slf4j
@RestController
@RequestMapping("/api/auth/social")
@RequiredArgsConstructor
public class SocialLinkController {
    
    private final SocialLinkService socialLinkService;
    private final JwtService jwtService;
    
    /**
     * 소셜 연동 상태 조회
     * GET /api/auth/social/status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getSocialLinkStatus(
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            Long mId = getMemberIdFromToken(authHeader);
            List<SocialLinkDto> status = socialLinkService.getSocialLinkStatus(mId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", status);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("소셜 연동 상태 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 소셜 계정이 이미 사용 중인지 확인
     * GET /api/auth/social/check/{provider}/{providerId}
     */
    @GetMapping("/check/{provider}/{providerId}")
    public ResponseEntity<?> checkSocialAccount(
            @PathVariable String provider,
            @PathVariable String providerId) {
        
        try {
            boolean isLinked = socialLinkService.isAlreadyLinked(provider.toUpperCase(), providerId);
            boolean isRegistered = socialLinkService.isAlreadyRegistered(provider.toUpperCase(), providerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", Map.of(
                "isLinked", isLinked,
                "isRegistered", isRegistered,
                "available", !isLinked && !isRegistered
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("소셜 계정 확인 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 소셜 계정 연동 확정
     * POST /api/auth/social/link/confirm
     * 
     * 프론트에서 닉네임 선택 후 호출
     */
    @PostMapping("/link/confirm")
    public ResponseEntity<?> confirmSocialLink(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody SocialLinkConfirmRequest request) {
        
        try {
            Long mId = getMemberIdFromToken(authHeader);
            
            // OAuth2UserDto 생성
            OAuth2UserDto userDto = OAuth2UserDto.builder()
                    .provider(request.getProvider())
                    .providerId(request.getProviderId())
                    .email(request.getEmail())
                    .nickname(request.getNickname())
                    .build();
            
            // 연동 처리
            socialLinkService.linkSocialAccount(mId, userDto, request.isUseSocialNickname());
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "소셜 계정이 연동되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("소셜 계정 연동 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Authorization 헤더에서 회원 ID 추출
     */
    private Long getMemberIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("유효하지 않은 인증 토큰입니다.");
        }
        String token = authHeader.substring(7);
        return jwtService.getMemberIdFromToken(token);
    }
    
    /**
     * 소셜 연동 확정 요청 DTO
     */
    @lombok.Getter
    @lombok.Setter
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SocialLinkConfirmRequest {
        private String provider;
        private String providerId;
        private String email;
        private String nickname;
        private boolean useSocialNickname;
    }
}
