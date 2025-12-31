package com.traveler.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.dto.EmailVerificationDto;
import com.traveler.app.dto.LoginRequestDto;
import com.traveler.app.dto.LoginResponseDto;
import com.traveler.app.dto.MemberResponseDto;
import com.traveler.app.dto.MemberUpdateDto;
import com.traveler.app.dto.PasswordChangeDto;
import com.traveler.app.dto.SignupRequestDto;
import com.traveler.app.service.EmailService;
import com.traveler.app.service.JwtService;
import com.traveler.app.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AuthController
 * 회원 인증 관련 REST API를 제공하는 컨트롤러
 * 
 * @author TravelerProject
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final MemberService memberService;
    private final EmailService emailService;
    private final JwtService jwtService;
    
    // ============================================
    // 회원가입 관련 API
    // ============================================
    
    /**
     * 아이디 중복 체크
     * GET /api/auth/check/username?username=xxx
     */
    @GetMapping("/check/username")
    public ResponseEntity<Map<String, Object>> checkUsername(
            @RequestParam(value = "username") String username) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean available = memberService.checkUsernameAvailable(username);
            response.put("status", "success");
            response.put("available", available);
            response.put("message", available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("아이디 중복 체크 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "중복 체크 중 오류가 발생했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 이메일 중복 체크
     * GET /api/auth/check/email?email=xxx
     */
    @GetMapping("/check/email")
    public ResponseEntity<Map<String, Object>> checkEmail(
            @RequestParam(value = "email") String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean available = memberService.checkEmailAvailable(email);
            response.put("status", "success");
            response.put("available", available);
            response.put("message", available ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("이메일 중복 체크 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "중복 체크 중 오류가 발생했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 닉네임 중복 체크
     * GET /api/auth/check/nickname?nickname=xxx
     */
    @GetMapping("/check/nickname")
    public ResponseEntity<Map<String, Object>> checkNickname(
            @RequestParam(value = "nickname") String nickname) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean available = memberService.checkNicknameAvailable(nickname);
            response.put("status", "success");
            response.put("available", available);
            response.put("message", available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("닉네임 중복 체크 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "중복 체크 중 오류가 발생했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 이메일 인증 코드 발송 (회원가입용)
     * POST /api/auth/email/send
     */
    @PostMapping("/email/send")
    public ResponseEntity<Map<String, Object>> sendVerificationCode(@RequestBody EmailVerificationDto request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 이메일 중복 체크
            if (!memberService.checkEmailAvailable(request.getEmail())) {
                response.put("status", "error");
                response.put("message", "이미 사용 중인 이메일입니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean sent = emailService.sendSignupVerificationCode(request.getEmail());
            
            if (sent) {
                response.put("status", "success");
                response.put("message", "인증 코드가 발송되었습니다. 5분 내에 입력해주세요.");
            } else {
                response.put("status", "error");
                response.put("message", "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("이메일 인증 코드 발송 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "이메일 발송 중 오류가 발생했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 이메일 인증 코드 확인
     * POST /api/auth/email/verify
     */
    @PostMapping("/email/verify")
    public ResponseEntity<Map<String, Object>> verifyEmailCode(@RequestBody EmailVerificationDto request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean verified = emailService.verifyCode(request.getEmail(), request.getCode());
            
            if (verified) {
                response.put("status", "success");
                response.put("verified", true);
                response.put("message", "이메일 인증이 완료되었습니다.");
            } else {
                response.put("status", "error");
                response.put("verified", false);
                response.put("message", "인증 코드가 일치하지 않거나 만료되었습니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("이메일 인증 코드 확인 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "인증 확인 중 오류가 발생했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 회원가입
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody SignupRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            MemberResponseDto member = memberService.signup(request);
            
            response.put("status", "success");
            response.put("message", "회원가입이 완료되었습니다.");
            response.put("data", member);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("회원가입 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // ============================================
    // 로그인/로그아웃 관련 API
    // ============================================
    
    /**
     * 로그인
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            LoginResponseDto loginResponse = memberService.login(request);
            
            response.put("status", "success");
            response.put("message", "로그인 성공");
            response.put("data", loginResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("로그인 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 로그아웃
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String refreshToken = request.get("refreshToken");
            memberService.logout(refreshToken);
            
            response.put("status", "success");
            response.put("message", "로그아웃 되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("로그아웃 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "로그아웃 중 오류가 발생했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Access Token 갱신
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String refreshToken = request.get("refreshToken");
            String newAccessToken = memberService.refreshAccessToken(refreshToken);
            
            response.put("status", "success");
            response.put("accessToken", newAccessToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", jwtService.getAccessTokenExpirationInSeconds());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("토큰 갱신 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }
    
    // ============================================
    // 아이디/비밀번호 찾기 관련 API
    // ============================================
    
    /**
     * 아이디 찾기
     * POST /api/auth/find/username
     */
    @PostMapping("/find/username")
    public ResponseEntity<Map<String, Object>> findUsername(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            boolean sent = memberService.findUsername(email);
            
            if (sent) {
                response.put("status", "success");
                response.put("message", "입력하신 이메일로 아이디를 발송했습니다.");
            } else {
                response.put("status", "error");
                response.put("message", "이메일 발송에 실패했습니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("아이디 찾기 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 비밀번호 찾기 - 인증 코드 발송
     * POST /api/auth/find/password/verify
     */
    @PostMapping("/find/password/verify")
    public ResponseEntity<Map<String, Object>> findPasswordVerify(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = request.get("username");
            String email = request.get("email");
            
            boolean sent = memberService.findPasswordVerify(username, email);
            
            if (sent) {
                response.put("status", "success");
                response.put("message", "인증 코드가 발송되었습니다. 5분 내에 입력해주세요.");
            } else {
                response.put("status", "error");
                response.put("message", "이메일 발송에 실패했습니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("비밀번호 찾기 인증 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 비밀번호 재설정
     * POST /api/auth/find/password/reset
     */
    @PostMapping("/find/password/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody PasswordChangeDto request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            memberService.resetPassword(request);
            
            response.put("status", "success");
            response.put("message", "비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("비밀번호 재설정 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // ============================================
    // 마이페이지 관련 API
    // ============================================
    
    /**
     * 내 정보 조회
     * GET /api/auth/me
     * Header: Authorization: Bearer {accessToken}
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyInfo(
            @RequestHeader(value = "Authorization") String authorization) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = extractToken(authorization);
            
            if (!jwtService.validateToken(token)) {
                response.put("status", "error");
                response.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            Long memberId = jwtService.getMemberIdFromToken(token);
            MemberResponseDto member = memberService.getMemberInfo(memberId);
            
            response.put("status", "success");
            response.put("data", member);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("내 정보 조회 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 내 정보 수정
     * PUT /api/auth/me
     * Header: Authorization: Bearer {accessToken}
     */
    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMyInfo(
            @RequestHeader(value = "Authorization") String authorization,
            @RequestBody MemberUpdateDto request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = extractToken(authorization);
            
            if (!jwtService.validateToken(token)) {
                response.put("status", "error");
                response.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            Long memberId = jwtService.getMemberIdFromToken(token);
            MemberResponseDto member = memberService.updateMember(memberId, request);
            
            response.put("status", "success");
            response.put("message", "회원정보가 수정되었습니다.");
            response.put("data", member);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("내 정보 수정 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 비밀번호 변경
     * PUT /api/auth/me/password
     * Header: Authorization: Bearer {accessToken}
     */
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestHeader(value = "Authorization") String authorization,
            @RequestBody PasswordChangeDto request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = extractToken(authorization);
            
            if (!jwtService.validateToken(token)) {
                response.put("status", "error");
                response.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            Long memberId = jwtService.getMemberIdFromToken(token);
            memberService.changePassword(memberId, request);
            
            response.put("status", "success");
            response.put("message", "비밀번호가 변경되었습니다. 다시 로그인해주세요.");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("비밀번호 변경 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 회원 탈퇴
     * DELETE /api/auth/me
     * Header: Authorization: Bearer {accessToken}
     */
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, Object>> withdraw(
            @RequestHeader(value = "Authorization") String authorization,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = extractToken(authorization);
            
            if (!jwtService.validateToken(token)) {
                response.put("status", "error");
                response.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            Long memberId = jwtService.getMemberIdFromToken(token);
            String password = request.get("password");
            
            memberService.withdraw(memberId, password);
            
            response.put("status", "success");
            response.put("message", "회원 탈퇴가 완료되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("회원 탈퇴 오류: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Authorization 헤더에서 토큰 추출
     * "Bearer xxx" 형식에서 "xxx" 부분만 추출
     */
    private String extractToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        throw new RuntimeException("Authorization 헤더가 올바르지 않습니다.");
    }
}
