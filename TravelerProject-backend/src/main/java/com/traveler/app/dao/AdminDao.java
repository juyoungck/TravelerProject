package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.Board;
import com.traveler.app.entity.Member;
import com.traveler.app.entity.Review;

/**
 * AdminDao
 * 관리자 기능 DAO
 * 
 * @author TravelerProject
 */
@Mapper
public interface AdminDao {

    // ============================================
    // 회원 관리
    // ============================================

    /**
     * 전체 회원 목록 조회 (페이징, 검색, 필터)
     */
    List<Member> selectAllMembers(
            @Param("offset") int offset,
            @Param("size") int size,
            @Param("search") String search,
            @Param("status") String status);

    /**
     * 회원 수 조회
     */
    int countMembers(
            @Param("search") String search,
            @Param("status") String status);

    /**
     * 회원 상태 변경
     */
    void updateMemberStatus(
            @Param("mId") Long mId,
            @Param("status") String status);

    /**
     * 회원 삭제
     */
    void deleteMember(@Param("mId") Long mId);

    /**
     * 회원의 리뷰 삭제
     */
    void deleteReviewsByMemberId(@Param("mId") Long mId);

    /**
     * 회원의 찜 삭제 (여행지 + 플래너)
     */
    void deleteFavoritesByMemberId(@Param("mId") Long mId);

    /**
     * 회원의 게시글 삭제
     */
    void deleteBoardsByMemberId(@Param("mId") Long mId);

    /**
     * 회원의 댓글 삭제
     */
    void deleteCommentsByMemberId(@Param("mId") Long mId);

    /**
     * 회원의 플래너 삭제
     */
    void deletePlannersByMemberId(@Param("mId") Long mId);

    /**
     * 회원의 소셜 계정 삭제
     */
    void deleteSocialAccountsByMemberId(@Param("mId") Long mId);

    // ============================================
    // 게시판 관리
    // ============================================

    /**
     * 전체 게시글 목록 조회 (페이징, 검색, 필터)
     */
    List<Board> selectAllBoards(
            @Param("offset") int offset,
            @Param("size") int size,
            @Param("search") String search,
            @Param("status") String status);

    /**
     * 게시글 수 조회
     */
    int countBoards(
            @Param("search") String search,
            @Param("status") String status);

    /**
     * 게시글 상태 변경
     */
    void updateBoardStatus(
            @Param("bdId") Long bdId,
            @Param("status") String status);

    /**
     * 게시글 삭제
     */
    void deleteBoard(@Param("bdId") Long bdId);

    /**
     * 게시글의 댓글 삭제
     */
    void deleteCommentsByBoardId(@Param("bdId") Long bdId);

    // ============================================
    // 리뷰 관리
    // ============================================

    /**
     * 전체 리뷰 목록 조회 (페이징, 검색)
     */
    List<Review> selectAllReviews(
            @Param("offset") int offset,
            @Param("size") int size,
            @Param("search") String search);

    /**
     * 리뷰 수 조회
     */
    int countReviews(@Param("search") String search);

    /**
     * 리뷰 삭제
     */
    void deleteReview(@Param("rvId") Long rvId);

    // ============================================
    // 통계
    // ============================================

    /**
     * 전체 플래너 수
     */
    int countPlanners();

    /**
     * 오늘 가입한 회원 수
     */
    int countTodayNewMembers();

    /**
     * 오늘 작성된 게시글 수
     */
    int countTodayNewBoards();
}
