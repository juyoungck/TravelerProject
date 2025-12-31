package com.traveler.app.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.EmailVerification;

/**
 * EmailVerificationDao 인터페이스
 * 이메일 인증 테이블에 대한 데이터 접근을 담당
 * 
 * @author TravelerProject
 */
@Mapper
public interface EmailVerificationDao {
    
    /**
     * 이메일 인증 코드 저장
     * 
     * @param emailVerification 인증 정보
     * @return 등록된 행 수
     */
    int insertEmailVerification(EmailVerification emailVerification);
    
    /**
     * 이메일과 코드로 인증 정보 조회
     * 
     * @param email 이메일
     * @param code 인증 코드
     * @return 인증 정보
     */
    EmailVerification selectByEmailAndCode(@Param("email") String email, @Param("code") String code);
    
    /**
     * 이메일로 가장 최근 인증 정보 조회
     * 
     * @param email 이메일
     * @return 인증 정보
     */
    EmailVerification selectLatestByEmail(@Param("email") String email);
    
    /**
     * 인증 완료 처리
     * 
     * @param evId 인증 ID
     * @return 수정된 행 수
     */
    int updateVerified(@Param("evId") Long evId);
    
    /**
     * 이메일의 모든 인증 정보 삭제
     * 
     * @param email 이메일
     * @return 삭제된 행 수
     */
    int deleteByEmail(@Param("email") String email);
    
    /**
     * 만료된 인증 정보 삭제
     * 
     * @return 삭제된 행 수
     */
    int deleteExpiredVerifications();
}
