package com.traveler.app.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.Member;

/**
 * MemberDao 인터페이스
 * 회원 테이블에 대한 데이터 접근을 담당
 * 
 * @author TravelerProject
 */
@Mapper
public interface MemberDao {
    
    /**
     * 회원 등록
     * 
     * @param member 등록할 회원 정보
     * @return 등록된 행 수
     */
    int insertMember(Member member);
    
    /**
     * 회원 ID로 조회
     * 
     * @param mId 회원 ID
     * @return 회원 정보
     */
    Member selectMemberById(@Param("mId") Long mId);
    
    /**
     * 아이디(username)로 조회
     * 
     * @param username 아이디
     * @return 회원 정보
     */
    Member selectMemberByUsername(@Param("username") String username);
    
    /**
     * 이메일로 조회
     * 
     * @param email 이메일
     * @return 회원 정보
     */
    Member selectMemberByEmail(@Param("email") String email);
    
    /**
     * 닉네임으로 조회
     * 
     * @param nickname 닉네임
     * @return 회원 정보
     */
    Member selectMemberByNickname(@Param("nickname") String nickname);
    
    /**
     * 아이디 중복 체크
     * 
     * @param username 아이디
     * @return 중복 개수 (0이면 사용 가능)
     */
    int countByUsername(@Param("username") String username);
    
    /**
     * 이메일 중복 체크
     * 
     * @param email 이메일
     * @return 중복 개수 (0이면 사용 가능)
     */
    int countByEmail(@Param("email") String email);
    
    /**
     * 닉네임 중복 체크
     * 
     * @param nickname 닉네임
     * @return 중복 개수 (0이면 사용 가능)
     */
    int countByNickname(@Param("nickname") String nickname);
    
    /**
     * 회원 정보 수정
     * 
     * @param member 수정할 회원 정보
     * @return 수정된 행 수
     */
    int updateMember(Member member);
    
    /**
     * 비밀번호 수정
     * 
     * @param mId 회원 ID
     * @param newPassword 새 비밀번호 (암호화된 상태)
     * @return 수정된 행 수
     */
    int updatePassword(@Param("mId") Long mId, @Param("newPassword") String newPassword);
    
    /**
     * 회원 상태 변경 (탈퇴 처리)
     * 
     * @param mId 회원 ID
     * @param status 변경할 상태
     * @return 수정된 행 수
     */
    int updateMemberStatus(@Param("mId") Long mId, @Param("status") String status);
    
    /**
     * 아이디/이메일로 회원 조회 (아이디 찾기용)
     * 
     * @param email 이메일
     * @return 회원 정보
     */
    Member selectMemberForFindId(@Param("email") String email);
    
    /**
     * 아이디/이메일로 회원 조회 (비밀번호 찾기용)
     * 
     * @param username 아이디
     * @param email 이메일
     * @return 회원 정보
     */
    Member selectMemberForFindPassword(@Param("username") String username, @Param("email") String email);
}
