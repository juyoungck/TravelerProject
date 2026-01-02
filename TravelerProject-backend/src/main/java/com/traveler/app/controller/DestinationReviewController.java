package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.dto.DestinationReviewDto;
import com.traveler.app.entity.DestinationReview;
import com.traveler.app.service.DestinationReviewService;

/**
 * 여행지 리뷰 API 컨트롤러
 * 리뷰 CRUD 기능 제공
 */
@RestController
@RequestMapping("/api/review")
public class DestinationReviewController {

    private final DestinationReviewService reviewService;

    public DestinationReviewController(DestinationReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * 리뷰 등록
     * POST /api/review
     */
    @PostMapping
    public Map<String, Object> createReview(@RequestBody DestinationReviewDto dto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            reviewService.createReview(dto);
            response.put("status", "success");
            response.put("message", "리뷰가 등록되었습니다.");
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 여행지별 리뷰 목록 조회
     * GET /api/review/destination/{contentid}
     */
    @GetMapping("/destination/{contentid}")
    public Map<String, Object> getReviewsByDestination(@PathVariable("contentid") String contentid) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<DestinationReview> reviews = reviewService.getReviewsByContentId(contentid);
            Double averageRating = reviewService.getAverageRating(contentid);
            int totalCount = reviewService.getReviewCount(contentid);
            
            response.put("status", "success");
            response.put("data", reviews);
            response.put("averageRating", Math.round(averageRating * 10) / 10.0);  // 소수점 1자리
            response.put("totalCount", totalCount);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 회원별 리뷰 목록 조회 (마이페이지용)
     * GET /api/review/member/{memberId}
     */
    @GetMapping("/member/{memberId}")
    public Map<String, Object> getReviewsByMember(@PathVariable("memberId") Long memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<DestinationReview> reviews = reviewService.getReviewsByMemberId(memberId);
            
            response.put("status", "success");
            response.put("data", reviews);
            response.put("totalCount", reviews.size());
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 리뷰 단건 조회
     * GET /api/review/{reviewId}
     */
    @GetMapping("/{reviewId}")
    public Map<String, Object> getReview(@PathVariable("reviewId") Long reviewId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            DestinationReview review = reviewService.getReviewById(reviewId);
            
            if (review != null) {
                response.put("status", "success");
                response.put("data", review);
            } else {
                response.put("status", "fail");
                response.put("message", "리뷰를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 리뷰 수정
     * PUT /api/review/{reviewId}
     */
    @PutMapping("/{reviewId}")
    public Map<String, Object> updateReview(
            @PathVariable("reviewId") Long reviewId,
            @RequestBody DestinationReviewDto dto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            dto.setRvId(reviewId);
            reviewService.updateReview(dto);
            
            response.put("status", "success");
            response.put("message", "리뷰가 수정되었습니다.");
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 리뷰 삭제
     * DELETE /api/review/{reviewId}
     */
    @DeleteMapping("/{reviewId}")
    public Map<String, Object> deleteReview(@PathVariable("reviewId") Long reviewId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            reviewService.deleteReview(reviewId);
            
            response.put("status", "success");
            response.put("message", "리뷰가 삭제되었습니다.");
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
}