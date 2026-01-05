package com.traveler.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.traveler.app.dao.DestinationReviewDao;
import com.traveler.app.dto.DestinationReviewDto;
import com.traveler.app.entity.DestinationReview;

/**
 * 여행지 리뷰 Service
 * 리뷰 CRUD 비즈니스 로직 처리
 */
@Service
@Transactional
public class DestinationReviewService {
    
    private final DestinationReviewDao reviewDao;
    private final BoardFileUploadService fileUploadService;

    // 생성자 1개만!
    public DestinationReviewService(DestinationReviewDao reviewDao, BoardFileUploadService fileUploadService) {
        this.reviewDao = reviewDao;
        this.fileUploadService = fileUploadService;
    }

    /**
     * 리뷰 등록 (기본)
     */
    public void createReview(DestinationReviewDto dto) {
        DestinationReview review = DestinationReview.builder()
                .mId(dto.getMId())
                .contentid(dto.getContentid())
                .rvContent(dto.getRvContent())
                .rvRating(dto.getRvRating())
                .build();
        
        reviewDao.insertReview(review);
    }

    /**
     * 리뷰 등록 (이미지 포함)
     */
    public Long createReviewWithImages(DestinationReviewDto dto, List<MultipartFile> images) throws Exception {
        DestinationReview review = DestinationReview.builder()
                .mId(dto.getMId())
                .contentid(dto.getContentid())
                .rvContent(dto.getRvContent())
                .rvRating(dto.getRvRating())
                .build();
        
        reviewDao.insertReview(review);
        Long rvId = review.getRvId();
        
        // 이미지 저장 (최대 3장)
        if (images != null && !images.isEmpty()) {
            int count = Math.min(images.size(), 3);
            for (int i = 0; i < count; i++) {
                MultipartFile file = images.get(i);
                if (!file.isEmpty()) {
                    String imageUrl = fileUploadService.uploadImage(file, "review");
                    reviewDao.insertReviewImage(rvId, imageUrl, i);
                }
            }
        }
        
        return rvId;
    }

    /**
     * 리뷰 단건 조회
     */
    @Transactional(readOnly = true)
    public DestinationReview getReviewById(Long rvId) {
        return reviewDao.selectReviewById(rvId);
    }

    /**
     * 여행지별 리뷰 목록 조회
     */
    @Transactional(readOnly = true)
    public List<DestinationReview> getReviewsByContentId(String contentid) {
        return reviewDao.selectReviewsByContentId(contentid);
    }

    /**
     * 회원별 리뷰 목록 조회 (마이페이지용)
     */
    @Transactional(readOnly = true)
    public List<DestinationReview> getReviewsByMemberId(Long mId) {
        return reviewDao.selectReviewsByMemberId(mId);
    }

    /**
     * 리뷰 수정
     */
    public void updateReview(DestinationReviewDto dto) {
        DestinationReview review = DestinationReview.builder()
                .rvId(dto.getRvId())
                .rvContent(dto.getRvContent())
                .rvRating(dto.getRvRating())
                .build();
        
        reviewDao.updateReview(review);
    }

    /**
     * 리뷰 삭제
     */
    public void deleteReview(Long rvId) {
        reviewDao.deleteReview(rvId);
    }
    
    /** 리뷰 수정 (이미지 포함) */
    public void updateReviewWithImages(Long rvId, DestinationReviewDto dto, 
            List<String> keepImageUrls, List<MultipartFile> newImages) throws Exception {
        
        // 1. 리뷰 텍스트/별점 수정
        reviewDao.updateReview(DestinationReview.builder()
                .rvId(rvId)
                .rvContent(dto.getRvContent())
                .rvRating(dto.getRvRating())
                .build());
        
        // 2. 기존 이미지 전체 삭제
        reviewDao.deleteReviewImagesByReviewId(rvId);
        
        // 3. 유지할 이미지 다시 저장
        int sortOrder = 0;
        if (keepImageUrls != null) {
            for (String url : keepImageUrls) {
                reviewDao.insertReviewImage(rvId, url, sortOrder++);
            }
        }
        
        // 4. 새 이미지 저장 (총 3장 제한)
        if (newImages != null && !newImages.isEmpty()) {
            int remaining = 3 - sortOrder;
            for (int i = 0; i < Math.min(newImages.size(), remaining); i++) {
                MultipartFile file = newImages.get(i);
                if (!file.isEmpty()) {
                    String imageUrl = fileUploadService.uploadImage(file, "review");
                    reviewDao.insertReviewImage(rvId, imageUrl, sortOrder++);
                }
            }
        }
    }

    /**
     * 여행지별 리뷰 개수 조회
     */
    @Transactional(readOnly = true)
    public int getReviewCount(String contentid) {
        return reviewDao.countReviewsByContentId(contentid);
    }

    /**
     * 여행지별 평균 별점 조회
     */
    @Transactional(readOnly = true)
    public Double getAverageRating(String contentid) {
        Double avg = reviewDao.selectAverageRatingByContentId(contentid);
        return avg != null ? avg : 0.0;
    }

    /**
     * 리뷰 이미지 조회
     */
    @Transactional(readOnly = true)
    public List<String> getReviewImages(Long rvId) {
        return reviewDao.selectReviewImages(rvId);
    }
}