package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.traveler.app.dto.DestinationReviewDto;
import com.traveler.app.entity.DestinationReview;
import com.traveler.app.service.DestinationReviewService;

/**
 * 여행지 리뷰 API 컨트롤러
 * 리뷰 CRUD + 이미지 업로드 기능 제공
 */
@RestController
@RequestMapping("/api/review")
public class DestinationReviewController {

    private final DestinationReviewService reviewService;

    public DestinationReviewController(DestinationReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**s
     * 리뷰 등록 (이미지 포함)
     * POST /api/review
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> createReview(
            @RequestPart("review") DestinationReviewDto dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 이미지 3장 제한
            if (images != null && images.size() > 3) {
                response.put("status", "fail");
                response.put("message", "이미지는 최대 3장까지 등록 가능합니다.");
                return response;
            }
            
            Long rvId = reviewService.createReviewWithImages(dto, images);
            
            response.put("status", "success");
            response.put("message", "리뷰가 등록되었습니다.");
            response.put("rvId", rvId);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 리뷰 등록 (텍스트만 - 기존 호환용)
     * POST /api/review/text
     */
    @PostMapping("/text")
    public Map<String, Object> createReviewText(@RequestBody DestinationReviewDto dto) {
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
            response.put("averageRating", Math.round(averageRating * 10) / 10.0);
            response.put("totalCount", totalCount);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 리뷰 이미지 조회
     * GET /api/review/{reviewId}/images
     */
    @GetMapping("/{reviewId}/images")
    public Map<String, Object> getReviewImages(@PathVariable("reviewId") Long reviewId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<String> images = reviewService.getReviewImages(reviewId);
            response.put("status", "success");
            response.put("data", images);
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
    @PutMapping(
    	    value = "/{reviewId}",
    	    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    		)
    public Map<String, Object> updateReview(
            @PathVariable("reviewId") Long reviewId,
            @RequestPart("review") DestinationReviewDto dto,
            @RequestParam(value = "keepImages", required = false) List<String> keepImages,
            @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            reviewService.updateReviewWithImages(
                reviewId,
                dto,
                keepImages,
                newImages
            );

            response.put("status", "success");
        } catch (Exception e) {
            e.printStackTrace();
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