package com.traveler.app.service;

import java.sql.Timestamp;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.traveler.app.dao.RefreshTokenDao;
import com.traveler.app.entity.Member;
import com.traveler.app.entity.RefreshToken;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JwtService
 * JWT 토큰 생성, 검증, 파싱을 담당하는 서비스
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {
    
    private final RefreshTokenDao refreshTokenDao;
    
    /** JWT 시크릿 키 */
    @Value("${jwt.secret}")
    private String secretKey;
    
    /** Access Token 만료 시간 (밀리초) */
    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;
    
    /** Refresh Token 만료 시간 (밀리초) */
    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;
    
    /**
     * 시크릿 키 생성
     * 
     * @return SecretKey 객체
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
    
    /**
     * Access Token 생성
     * 
     * @param member 회원 정보
     * @return Access Token 문자열
     */
    public String generateAccessToken(Member member) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiration);
        
        return Jwts.builder()
                .subject(String.valueOf(member.getMId()))
                .claim("username", member.getMUsername())
                .claim("nickname", member.getMNickname())
                .claim("role", member.getMRole())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Refresh Token 생성 및 DB 저장
     * 
     * @param member 회원 정보
     * @return Refresh Token 문자열
     */
    public String generateRefreshToken(Member member) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpiration);
        
        String token = Jwts.builder()
                .subject(String.valueOf(member.getMId()))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
        
        // 기존 리프레시 토큰 삭제
        refreshTokenDao.deleteByMemberId(member.getMId());
        
        // 새 리프레시 토큰 저장
        RefreshToken refreshToken = RefreshToken.builder()
                .mId(member.getMId())
                .rtToken(token)
                .rtExpiresAt(new Timestamp(expiry.getTime()))
                .build();
        refreshTokenDao.insertRefreshToken(refreshToken);
        
        return token;
    }
    
    /**
     * 토큰에서 회원 ID 추출
     * 
     * @param token JWT 토큰
     * @return 회원 ID
     */
    public Long getMemberIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.valueOf(claims.getSubject());
    }
    
    /**
     * 토큰에서 사용자명 추출
     * 
     * @param token JWT 토큰
     * @return 사용자명
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("username", String.class);
    }
    
    /**
     * 토큰에서 역할 추출
     * 
     * @param token JWT 토큰
     * @return 역할
     */
    public String getRoleFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("role", String.class);
    }
    
    /**
     * 토큰 유효성 검증
     * 
     * @param token JWT 토큰
     * @return 유효 여부
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (SignatureException e) {
            log.error("잘못된 JWT 서명입니다: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("잘못된 JWT 토큰입니다: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("만료된 JWT 토큰입니다: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 JWT 토큰입니다: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT 토큰이 비어있습니다: {}", e.getMessage());
        }
        return false;
    }
    
    /**
     * Refresh Token 유효성 검증 (DB 확인 포함)
     * 
     * @param token Refresh Token
     * @return 유효 여부
     */
    public boolean validateRefreshToken(String token) {
        if (!validateToken(token)) {
            return false;
        }
        
        // DB에 저장된 토큰인지 확인
        RefreshToken savedToken = refreshTokenDao.selectByToken(token);
        return savedToken != null;
    }
    
    /**
     * Refresh Token으로 새 Access Token 발급
     * 
     * @param refreshToken Refresh Token
     * @param member 회원 정보
     * @return 새 Access Token
     */
    public String refreshAccessToken(String refreshToken, Member member) {
        if (!validateRefreshToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 Refresh Token입니다.");
        }
        return generateAccessToken(member);
    }
    
    /**
     * 로그아웃 (Refresh Token 삭제)
     * 
     * @param refreshToken Refresh Token
     */
    public void logout(String refreshToken) {
        refreshTokenDao.deleteByToken(refreshToken);
    }
    
    /**
     * 회원의 모든 토큰 삭제 (강제 로그아웃)
     * 
     * @param mId 회원 ID
     */
    public void logoutAll(Long mId) {
        refreshTokenDao.deleteByMemberId(mId);
    }
    
    /**
     * Access Token 만료 시간 (초) 반환
     * 
     * @return 만료 시간 (초)
     */
    public Long getAccessTokenExpirationInSeconds() {
        return accessTokenExpiration / 1000;
    }
    
    /**
     * JWT Claims 파싱
     * 
     * @param token JWT 토큰
     * @return Claims 객체
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
