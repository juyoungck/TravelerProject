package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.traveler.app.entity.Board;
import com.traveler.app.entity.Member;
import com.traveler.app.entity.Review;
import com.traveler.app.service.AdminService;
import com.traveler.app.service.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AdminController
 * 관리자 전용 API
 * 
 * 기능:
 * - 회원 관리 (목록 조회, 비활성화/복원, 삭제)
 * - 게시판 관리 (목록 조회, 숨김/복원, 삭제)
 * - 리뷰 관리 (목록 조회, 삭제)
 * 
 * @author TravelerProject
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final JwtService jwtService;

    // ============================================
    // 관리자 권한 체크
    // ============================================
    
    /**
     * 관리자 권한 확인
     */
    private boolean isAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        String role = jwtService.getRoleFromToken(token);
        return "ADMIN".equals(role);
    }

    /**
     * 토큰에서 회원 ID 추출
     */
    private Long getMemberIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.getMemberIdFromToken(token);
    }

    // ============================================
    // 회원 관리 API
    // ============================================

    /**
     * 전체 회원 목록 조회
     * GET /api/admin/members
     */
    @GetMapping("/members")
    public ResponseEntity<Map<String, Object>> getAllMembers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status) {
        
        Map<String, Object> response = new HashMap<>();
        
        // 관리자 권한 체크
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("회원 목록 조회 - page: {}, size: {}, search: {}, status: {}", 
                    page, size, search, status);
            
            List<Member> members = adminService.getAllMembers(page, size, search, status);
            int totalCount = adminService.getMemberCount(search, status);
            
            response.put("status", "success");
            response.put("data", members);
            response.put("totalCount", totalCount);
            response.put("currentPage", page);
            response.put("totalPages", (int) Math.ceil((double) totalCount / size));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("회원 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "회원 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 회원 상태 변경 (활성화/비활성화)
     * PUT /api/admin/members/{mId}/status
     */
    @PutMapping("/members/{mId}/status")
    public ResponseEntity<Map<String, Object>> updateMemberStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("mId") Long mId,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            String newStatus = request.get("status");
            if (newStatus == null || (!newStatus.equals("ACTIVE") && !newStatus.equals("DELETED"))) {
                response.put("status", "error");
                response.put("message", "유효하지 않은 상태값입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            log.info("회원 상태 변경 - mId: {}, newStatus: {}", mId, newStatus);
            
            adminService.updateMemberStatus(mId, newStatus);
            
            response.put("status", "success");
            response.put("message", newStatus.equals("ACTIVE") ? "회원이 차단 해제되었습니다." : "회원이 차단되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("회원 상태 변경 오류", e);
            response.put("status", "error");
            response.put("message", "회원 상태 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 회원 탈퇴 (완전 삭제)
     * DELETE /api/admin/members/{mId}
     */
    @DeleteMapping("/members/{mId}")
    public ResponseEntity<Map<String, Object>> deleteMember(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("mId") Long mId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("회원 탈퇴 - mId: {}", mId);
            
            adminService.deleteMember(mId);
            
            response.put("status", "success");
            response.put("message", "회원이 탈퇴처리 되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("회원 탈퇴 오류", e);
            response.put("status", "error");
            response.put("message", "회원 탈퇴 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // 게시판 관리 API
    // ============================================

    /**
     * 전체 게시글 목록 조회
     * GET /api/admin/boards
     */
    @GetMapping("/boards")
    public ResponseEntity<Map<String, Object>> getAllBoards(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("게시글 목록 조회 - page: {}, size: {}, search: {}, status: {}", 
                    page, size, search, status);
            
            List<Board> boards = adminService.getAllBoards(page, size, search, status);
            int totalCount = adminService.getBoardCount(search, status);
            
            response.put("status", "success");
            response.put("data", boards);
            response.put("totalCount", totalCount);
            response.put("currentPage", page);
            response.put("totalPages", (int) Math.ceil((double) totalCount / size));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("게시글 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "게시글 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 게시글 상태 변경 (공개/숨김)
     * PUT /api/admin/boards/{bdId}/status
     */
    @PutMapping("/boards/{bdId}/status")
    public ResponseEntity<Map<String, Object>> updateBoardStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("bdId") Long bdId,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            String newStatus = request.get("status");
            if (newStatus == null || (!newStatus.equals("PUBLIC") && !newStatus.equals("HIDDEN"))) {
                response.put("status", "error");
                response.put("message", "유효하지 않은 상태값입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            log.info("게시글 상태 변경 - bdId: {}, newStatus: {}", bdId, newStatus);
            
            adminService.updateBoardStatus(bdId, newStatus);
            
            response.put("status", "success");
            response.put("message", newStatus.equals("PUBLIC") ? "게시글이 공개 처리되었습니다." : "게시글이 숨김 처리되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("게시글 상태 변경 오류", e);
            response.put("status", "error");
            response.put("message", "게시글 상태 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 게시글 삭제
     * DELETE /api/admin/boards/{bdId}
     */
    @DeleteMapping("/boards/{bdId}")
    public ResponseEntity<Map<String, Object>> deleteBoard(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("bdId") Long bdId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("게시글 삭제 - bdId: {}", bdId);
            
            adminService.deleteBoard(bdId);
            
            response.put("status", "success");
            response.put("message", "게시글이 삭제되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("게시글 삭제 오류", e);
            response.put("status", "error");
            response.put("message", "게시글 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // 리뷰 관리 API
    // ============================================

    /**
     * 전체 리뷰 목록 조회
     * GET /api/admin/reviews
     */
    @GetMapping("/reviews")
    public ResponseEntity<Map<String, Object>> getAllReviews(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "search", required = false) String search) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("리뷰 목록 조회 - page: {}, size: {}, search: {}", page, size, search);
            
            List<Review> reviews = adminService.getAllReviews(page, size, search);
            int totalCount = adminService.getReviewCount(search);
            
            response.put("status", "success");
            response.put("data", reviews);
            response.put("totalCount", totalCount);
            response.put("currentPage", page);
            response.put("totalPages", (int) Math.ceil((double) totalCount / size));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("리뷰 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "리뷰 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 리뷰 삭제
     * DELETE /api/admin/reviews/{rvId}
     */
    @DeleteMapping("/reviews/{rvId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("rvId") Long rvId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("리뷰 삭제 - rvId: {}", rvId);
            
            adminService.deleteReview(rvId);
            
            response.put("status", "success");
            response.put("message", "리뷰가 삭제되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("리뷰 삭제 오류", e);
            response.put("status", "error");
            response.put("message", "리뷰 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // 대시보드 통계 API
    // ============================================

    /**
     * 관리자 대시보드 통계
     * GET /api/admin/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("대시보드 통계 조회");
            
            Map<String, Object> stats = adminService.getDashboardStats();
            
            response.put("status", "success");
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("대시보드 통계 조회 오류", e);
            response.put("status", "error");
            response.put("message", "통계 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // 플래너 관리
    // ============================================

    /**
     * 플래너 목록 조회
     * GET /api/admin/planners
     */
    @GetMapping("/planners")
    public ResponseEntity<Map<String, Object>> getPlanners(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("플래너 목록 조회 - page: {}, size: {}, search: {}, status: {}", 
                    page, size, search, status);
            
            Map<String, Object> result = adminService.getPlanners(page, size, search, status);
            
            response.put("status", "success");
            response.putAll(result);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("플래너 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "플래너 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 플래너 상태 변경 (공개/비공개)
     * PUT /api/admin/planners/{plnId}/status
     */
    @PutMapping("/planners/{plnId}/status")
    public ResponseEntity<Map<String, Object>> updatePlannerStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("plnId") Long plnId,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            String status = request.get("status");
            log.info("플래너 상태 변경 - ID: {}, status: {}", plnId, status);
            
            adminService.updatePlannerStatus(plnId, status);
            
            response.put("status", "success");
            response.put("message", "플래너 상태가 변경되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("플래너 상태 변경 오류", e);
            response.put("status", "error");
            response.put("message", "플래너 상태 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 플래너 삭제
     * DELETE /api/admin/planners/{plnId}
     */
    @DeleteMapping("/planners/{plnId}")
    public ResponseEntity<Map<String, Object>> deletePlanner(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("plnId") Long plnId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!isAdmin(authHeader)) {
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            log.info("플래너 삭제 - ID: {}", plnId);
            
            adminService.deletePlanner(plnId);
            
            response.put("status", "success");
            response.put("message", "플래너가 삭제되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("플래너 삭제 오류", e);
            response.put("status", "error");
            response.put("message", "플래너 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}
