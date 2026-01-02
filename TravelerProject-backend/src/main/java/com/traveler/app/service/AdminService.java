package com.traveler.app.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.AdminDao;
import com.traveler.app.entity.Board;
import com.traveler.app.entity.Member;
import com.traveler.app.entity.Review;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AdminService
 * 관리자 기능 서비스
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminDao adminDao;

    // ============================================
    // 회원 관리
    // ============================================

    /**
     * 전체 회원 목록 조회 (페이징, 검색, 필터)
     */
    public List<Member> getAllMembers(int page, int size, String search, String status) {
        int offset = (page - 1) * size;
        return adminDao.selectAllMembers(offset, size, search, status);
    }

    /**
     * 회원 수 조회
     */
    public int getMemberCount(String search, String status) {
        return adminDao.countMembers(search, status);
    }

    /**
     * 회원 상태 변경
     */
    @Transactional
    public void updateMemberStatus(Long mId, String status) {
        adminDao.updateMemberStatus(mId, status);
        log.info("회원 상태 변경 완료 - mId: {}, status: {}", mId, status);
    }

    /**
     * 회원 삭제 (완전 삭제)
     * 관련 데이터도 함께 삭제
     */
    @Transactional
    public void deleteMember(Long mId) {
        // 1. 회원의 리뷰 삭제
        adminDao.deleteReviewsByMemberId(mId);
        
        // 2. 회원의 찜 삭제
        adminDao.deleteFavoritesByMemberId(mId);
        
        // 3. 회원의 게시글 삭제
        adminDao.deleteBoardsByMemberId(mId);
        
        // 4. 회원의 댓글 삭제
        adminDao.deleteCommentsByMemberId(mId);
        
        // 5. 회원의 플래너 삭제
        adminDao.deletePlannersByMemberId(mId);
        
        // 6. 소셜 계정 연동 정보 삭제
        adminDao.deleteSocialAccountsByMemberId(mId);
        
        // 7. 회원 삭제
        adminDao.deleteMember(mId);
        
        log.info("회원 완전 삭제 완료 - mId: {}", mId);
    }

    // ============================================
    // 게시판 관리
    // ============================================

    /**
     * 전체 게시글 목록 조회 (페이징, 검색, 필터)
     */
    public List<Board> getAllBoards(int page, int size, String search, String status) {
        int offset = (page - 1) * size;
        return adminDao.selectAllBoards(offset, size, search, status);
    }

    /**
     * 게시글 수 조회
     */
    public int getBoardCount(String search, String status) {
        return adminDao.countBoards(search, status);
    }

    /**
     * 게시글 상태 변경
     */
    @Transactional
    public void updateBoardStatus(Long bdId, String status) {
        adminDao.updateBoardStatus(bdId, status);
        log.info("게시글 상태 변경 완료 - bdId: {}, status: {}", bdId, status);
    }

    /**
     * 게시글 삭제
     */
    @Transactional
    public void deleteBoard(Long bdId) {
        // 1. 게시글의 댓글 삭제
        adminDao.deleteCommentsByBoardId(bdId);
        
        // 2. 게시글 삭제
        adminDao.deleteBoard(bdId);
        
        log.info("게시글 삭제 완료 - bdId: {}", bdId);
    }

    // ============================================
    // 리뷰 관리
    // ============================================

    /**
     * 전체 리뷰 목록 조회 (페이징, 검색)
     */
    public List<Review> getAllReviews(int page, int size, String search) {
        int offset = (page - 1) * size;
        return adminDao.selectAllReviews(offset, size, search);
    }

    /**
     * 리뷰 수 조회
     */
    public int getReviewCount(String search) {
        return adminDao.countReviews(search);
    }

    /**
     * 리뷰 삭제
     */
    @Transactional
    public void deleteReview(Long rvId) {
        adminDao.deleteReview(rvId);
        log.info("리뷰 삭제 완료 - rvId: {}", rvId);
    }

    // ============================================
    // 대시보드 통계
    // ============================================

    /**
     * 대시보드 통계 조회
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 전체 회원 수
        stats.put("totalMembers", adminDao.countMembers(null, null));
        // 활성 회원 수
        stats.put("activeMembers", adminDao.countMembers(null, "ACTIVE"));
        // 비활성 회원 수
        stats.put("inactiveMembers", adminDao.countMembers(null, "DELETED"));
        // 전체 게시글 수
        stats.put("totalBoards", adminDao.countBoards(null, null));
        // 공개 게시글 수
        stats.put("publicBoards", adminDao.countBoards(null, "PUBLIC"));
        // 숨김 게시글 수
        stats.put("hiddenBoards", adminDao.countBoards(null, "HIDDEN"));
        
        // 전체 리뷰 수
        stats.put("totalReviews", adminDao.countReviews(null));
        
        // 전체 플래너 수
        stats.put("totalPlanners", adminDao.countPlanners());
        
        // 오늘 가입한 회원 수
        stats.put("todayNewMembers", adminDao.countTodayNewMembers());
        
        // 오늘 작성된 게시글 수
        stats.put("todayNewBoards", adminDao.countTodayNewBoards());
        
        return stats;
    }
}
