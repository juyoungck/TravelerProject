package com.traveler.app.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.RefreshToken;

/**
 * RefreshTokenDao 인터페이스
 * 리프레시 토큰 테이블에 대한 데이터 접근을 담당
 * 
 * @author TravelerProject
 */
@Mapper
public interface RefreshTokenDao {
    
    /**
     * 리프레시 토큰 저장
     * 
     * @param refreshToken 저장할 토큰 정보
     * @return 등록된 행 수
     */
    int insertRefreshToken(RefreshToken refreshToken);
    
    /**
     * 토큰 값으로 조회
     * 
     * @param token 토큰 값
     * @return 리프레시 토큰 정보
     */
    RefreshToken selectByToken(@Param("token") String token);
    
    /**
     * 회원 ID로 조회
     * 
     * @param mId 회원 ID
     * @return 리프레시 토큰 정보
     */
    RefreshToken selectByMemberId(@Param("mId") Long mId);
    
    /**
     * 토큰 삭제 (로그아웃)
     * 
     * @param token 토큰 값
     * @return 삭제된 행 수
     */
    int deleteByToken(@Param("token") String token);
    
    /**
     * 회원의 모든 토큰 삭제
     * 
     * @param mId 회원 ID
     * @return 삭제된 행 수
     */
    int deleteByMemberId(@Param("mId") Long mId);
    
    /**
     * 만료된 토큰 삭제
     * 
     * @return 삭제된 행 수
     */
    int deleteExpiredTokens();
}
