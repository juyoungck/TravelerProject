package com.traveler.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.ReviewDao;
import com.traveler.app.dto.MyReviewDto;
import com.traveler.app.entity.Review;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ReviewService
 * 리뷰 관련 비즈니스 로직 처리
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewDao reviewDao;
    
    /**
     * 내 리뷰 목록 조회
     * 
     * @param mId 회원 ID
     * @return 내 리뷰 목록 (여행지 정보 포함)
     */
    public List<MyReviewDto> getMyReviews(Long mId) {
        log.info("내 리뷰 목록 조회 - 회원 ID: {}", mId);
        return reviewDao.selectMyReviews(mId);
    }
    
    /**
     * 리뷰 상세 조회
     * 
     * @param rvId 리뷰 ID
     * @return 리뷰 정보
     */
    public Review getReviewById(Long rvId) {
        return reviewDao.selectReviewById(rvId);
    }
    
    /**
     * 리뷰 등록
     * 
     * @param review 리뷰 정보
     * @return 등록 성공 여부
     */
    @Transactional
    public boolean createReview(Review review) {
        int result = reviewDao.insertReview(review);
        log.info("리뷰 등록 - 회원 ID: {}, 여행지: {}, 결과: {}", 
                review.getMId(), review.getContentid(), result > 0);
        return result > 0;
    }
    
    /**
     * 리뷰 수정
     * 
     * @param review 리뷰 정보
     * @return 수정 성공 여부
     */
    @Transactional
    public boolean updateReview(Review review) {
        int result = reviewDao.updateReview(review);
        log.info("리뷰 수정 - 리뷰 ID: {}, 결과: {}", review.getRvId(), result > 0);
        return result > 0;
    }
    
    /**
     * 리뷰 삭제
     * 
     * @param rvId 리뷰 ID
     * @param mId 회원 ID (본인 확인용)
     * @return 삭제 성공 여부
     */
    @Transactional
    public boolean deleteReview(Long rvId, Long mId) {
        // 본인 리뷰인지 확인
        Review review = reviewDao.selectReviewById(rvId);
        if (review == null) {
            log.warn("리뷰 삭제 실패 - 존재하지 않는 리뷰: {}", rvId);
            return false;
        }
        if (!review.getMId().equals(mId)) {
            log.warn("리뷰 삭제 실패 - 권한 없음: 리뷰 ID {}, 요청자 {}", rvId, mId);
            return false;
        }
        
        int result = reviewDao.deleteReview(rvId);
        log.info("리뷰 삭제 - 리뷰 ID: {}, 결과: {}", rvId, result > 0);
        return result > 0;
    }
    
    /**
     * 특정 여행지의 리뷰 목록 조회
     * 
     * @param contentid 여행지 콘텐츠 ID
     * @return 리뷰 목록
     */
    public List<MyReviewDto> getReviewsByContentid(String contentid) {
        return reviewDao.selectReviewsByContentid(contentid);
    }
    
    /**
     * 내 리뷰 개수 조회
     * 
     * @param mId 회원 ID
     * @return 리뷰 개수
     */
    public int countMyReviews(Long mId) {
        return reviewDao.countMyReviews(mId);
    }
}
