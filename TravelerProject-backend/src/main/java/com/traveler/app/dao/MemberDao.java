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
     */
    int insertMember(Member member);
    
    /**
     * 회원 ID로 조회
     */
    Member selectMemberById(@Param("mId") Long mId);
    
    /**
     * 아이디(username)로 조회
     */
    Member selectMemberByUsername(@Param("username") String username);
    
    /**
     * 이메일로 조회
     */
    Member selectMemberByEmail(@Param("email") String email);
    
    /**
     * 닉네임으로 조회
     */
    Member selectMemberByNickname(@Param("nickname") String nickname);
    
    /**
     * 아이디 중복 체크
     */
    int countByUsername(@Param("username") String username);
    
    /**
     * 이메일 중복 체크
     */
    int countByEmail(@Param("email") String email);
    
    /**
     * 닉네임 중복 체크
     */
    int countByNickname(@Param("nickname") String nickname);
    
    /**
     * 회원 정보 수정
     */
    int updateMember(Member member);
    
    /**
     * 비밀번호 수정
     */
    int updatePassword(@Param("mId") Long mId, @Param("newPassword") String newPassword);
    
    /**
     * 회원 상태 변경 (탈퇴 처리)
     */
    int updateMemberStatus(@Param("mId") Long mId, @Param("status") String status);
    
    /**
     * 아이디/이메일로 회원 조회 (아이디 찾기용)
     */
    Member selectMemberForFindId(@Param("email") String email);
    
    /**
     * 아이디/이메일로 회원 조회 (비밀번호 찾기용)
     */
    Member selectMemberForFindPassword(@Param("username") String username, @Param("email") String email);
    
    /**
     * 회원 로그인 타입 변경 (소셜 연동 시 LOCAL → BOTH)
     */
    int updateMemberLoginType(@Param("mId") Long mId, @Param("loginType") String loginType);
    
    // ============================================
    // 회원 탈퇴 (Hard Delete) 관련 메서드
    // ============================================
    
    /**
     * 회원 삭제
     */
    int deleteMember(@Param("mId") Long mId);
    
    /**
     * 회원의 리뷰 삭제
     */
    int deleteReviewsByMemberId(@Param("mId") Long mId);
    
    /**
     * 회원의 여행지 찜 삭제
     */
    int deleteFavoriteDestinationsByMemberId(@Param("mId") Long mId);
    
    /**
     * 회원의 플래너 찜 삭제
     */
    int deleteFavoritePlannersByMemberId(@Param("mId") Long mId);
    
    /**
     * 회원의 댓글 삭제
     */
    int deleteCommentsByMemberId(@Param("mId") Long mId);
    
    /**
     * 회원의 게시글 삭제
     */
    int deleteBoardsByMemberId(@Param("mId") Long mId);
    
    /**
     * 회원의 플래너 삭제
     */
    int deletePlannersByMemberId(@Param("mId") Long mId);
    
    /**
     * 회원의 소셜 계정 삭제
     */
    int deleteSocialAccountsByMemberId(@Param("mId") Long mId);
    
    /**
     * 회원의 리프레시 토큰 삭제
     */
    int deleteRefreshTokensByMemberId(@Param("mId") Long mId);
}
