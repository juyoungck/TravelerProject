package com.traveler.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public DestinationReviewService(DestinationReviewDao reviewDao) {
        this.reviewDao = reviewDao;
    }

    /**
     * 리뷰 등록
     * @param dto 리뷰 정보
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
     * 리뷰 단건 조회
     * @param rvId 리뷰 ID
     * @return 리뷰 정보
     */
    @Transactional(readOnly = true)
    public DestinationReview getReviewById(Long rvId) {
        return reviewDao.selectReviewById(rvId);
    }

    /**
     * 여행지별 리뷰 목록 조회
     * @param contentid 여행지 ID
     * @return 리뷰 목록
     */
    @Transactional(readOnly = true)
    public List<DestinationReview> getReviewsByContentId(String contentid) {
        return reviewDao.selectReviewsByContentId(contentid);
    }

    /**
     * 회원별 리뷰 목록 조회 (마이페이지용)
     * @param mId 회원 ID
     * @return 리뷰 목록
     */
    @Transactional(readOnly = true)
    public List<DestinationReview> getReviewsByMemberId(Long mId) {
        return reviewDao.selectReviewsByMemberId(mId);
    }

    /**
     * 리뷰 수정
     * @param dto 수정할 리뷰 정보
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
     * @param rvId 리뷰 ID
     */
    public void deleteReview(Long rvId) {
        reviewDao.deleteReview(rvId);
    }

    /**
     * 여행지별 리뷰 개수 조회
     * @param contentid 여행지 ID
     * @return 리뷰 개수
     */
    @Transactional(readOnly = true)
    public int getReviewCount(String contentid) {
        return reviewDao.countReviewsByContentId(contentid);
    }

    /**
     * 여행지별 평균 별점 조회
     * @param contentid 여행지 ID
     * @return 평균 별점 (없으면 0.0)
     */
    @Transactional(readOnly = true)
    public Double getAverageRating(String contentid) {
        Double avg = reviewDao.selectAverageRatingByContentId(contentid);
        return avg != null ? avg : 0.0;
    }
}