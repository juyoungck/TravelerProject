package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.traveler.app.dto.MyReviewDto;
import com.traveler.app.entity.Review;
import com.traveler.app.service.JwtService;
import com.traveler.app.service.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ReviewController
 * 리뷰 관련 API 컨트롤러
 * 
 * API 엔드포인트:
 * - GET /api/reviews/my : 내 리뷰 목록 조회
 * - GET /api/reviews/destination/{contentid} : 여행지별 리뷰 목록
 * - POST /api/reviews : 리뷰 작성
 * - PUT /api/reviews/{rvId} : 리뷰 수정
 * - DELETE /api/reviews/{rvId} : 리뷰 삭제
 * 
 * @author TravelerProject
 */
@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    private final JwtService jwtService;
    
    /**
     * 내 리뷰 목록 조회
     * GET /api/reviews/my
     * 
     * @param authHeader Authorization 헤더 (Bearer 토큰)
     * @return 내 리뷰 목록
     */
    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyReviews(
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // JWT에서 회원 ID 추출
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            // 내 리뷰 목록 조회
            List<MyReviewDto> reviews = reviewService.getMyReviews(mId);
            int totalCount = reviewService.countMyReviews(mId);
            
            response.put("status", "success");
            response.put("data", reviews);
            response.put("totalCount", totalCount);
            
            log.info("내 리뷰 목록 조회 성공 - 회원 ID: {}, 리뷰 수: {}", mId, totalCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("내 리뷰 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "리뷰 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 특정 여행지의 리뷰 목록 조회
     * GET /api/reviews/destination/{contentid}
     * 
     * @param contentid 여행지 콘텐츠 ID
     * @return 리뷰 목록
     */
    @GetMapping("/destination/{contentid}")
    public ResponseEntity<Map<String, Object>> getReviewsByDestination(
    		@PathVariable("contentid") String contentid) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<MyReviewDto> reviews = reviewService.getReviewsByContentid(contentid);
            
            response.put("status", "success");
            response.put("data", reviews);
            response.put("totalCount", reviews.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("여행지 리뷰 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "리뷰 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 리뷰 작성
     * POST /api/reviews
     * 
     * @param authHeader Authorization 헤더
     * @param review 리뷰 정보
     * @return 작성 결과
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Review review) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // JWT에서 회원 ID 추출
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            // 회원 ID 설정
            review.setMId(mId);
            
            // 리뷰 등록
            boolean result = reviewService.createReview(review);
            
            if (result) {
                response.put("status", "success");
                response.put("message", "리뷰가 등록되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "리뷰 등록에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("리뷰 작성 오류", e);
            response.put("status", "error");
            response.put("message", "리뷰 작성 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 리뷰 수정
     * PUT /api/reviews/{rvId}
     * 
     * @param authHeader Authorization 헤더
     * @param rvId 리뷰 ID
     * @param review 수정할 리뷰 정보
     * @return 수정 결과
     */
    @PutMapping("/{rvId}")
    public ResponseEntity<Map<String, Object>> updateReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("rvId") Long rvId,
            @RequestBody Review review) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // JWT에서 회원 ID 추출
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            // 본인 리뷰인지 확인
            Review existingReview = reviewService.getReviewById(rvId);
            if (existingReview == null || !existingReview.getMId().equals(mId)) {
                response.put("status", "error");
                response.put("message", "수정 권한이 없습니다.");
                return ResponseEntity.status(403).body(response);
            }
            
            // 리뷰 ID 설정 및 수정
            review.setRvId(rvId);
            boolean result = reviewService.updateReview(review);
            
            if (result) {
                response.put("status", "success");
                response.put("message", "리뷰가 수정되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "리뷰 수정에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("리뷰 수정 오류", e);
            response.put("status", "error");
            response.put("message", "리뷰 수정 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 리뷰 삭제
     * DELETE /api/reviews/{rvId}
     * 
     * @param authHeader Authorization 헤더
     * @param rvId 리뷰 ID
     * @return 삭제 결과
     */
    @DeleteMapping("/{rvId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("rvId") Long rvId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // JWT에서 회원 ID 추출
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            // 리뷰 삭제 (본인 확인 포함)
            boolean result = reviewService.deleteReview(rvId, mId);
            
            if (result) {
                response.put("status", "success");
                response.put("message", "리뷰가 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "리뷰 삭제에 실패했습니다. 본인의 리뷰만 삭제할 수 있습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("리뷰 삭제 오류", e);
            response.put("status", "error");
            response.put("message", "리뷰 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}
