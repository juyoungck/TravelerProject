package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.dto.MyReviewDto;
import com.traveler.app.entity.Review;

/**
 * ReviewDao
 * 리뷰 테이블 데이터 접근 인터페이스
 * 
 * @author TravelerProject
 */
@Mapper
public interface ReviewDao {
    
    /**
     * 내 리뷰 목록 조회 (여행지 정보 포함)
     * 
     * @param mId 회원 ID
     * @return 내 리뷰 목록
     */
    List<MyReviewDto> selectMyReviews(@Param("mId") Long mId);
    
    /**
     * 리뷰 상세 조회
     * 
     * @param rvId 리뷰 ID
     * @return 리뷰 정보
     */
    Review selectReviewById(@Param("rvId") Long rvId);
    
    /**
     * 리뷰 등록
     * 
     * @param review 리뷰 정보
     * @return 등록된 행 수
     */
    int insertReview(Review review);
    
    /**
     * 리뷰 수정
     * 
     * @param review 리뷰 정보
     * @return 수정된 행 수
     */
    int updateReview(Review review);
    
    /**
     * 리뷰 삭제
     * 
     * @param rvId 리뷰 ID
     * @return 삭제된 행 수
     */
    int deleteReview(@Param("rvId") Long rvId);
    
    /**
     * 특정 여행지의 리뷰 목록 조회
     * 
     * @param contentid 여행지 콘텐츠 ID
     * @return 리뷰 목록
     */
    List<MyReviewDto> selectReviewsByContentid(@Param("contentid") String contentid);
    
    /**
     * 내 리뷰 개수 조회
     * 
     * @param mId 회원 ID
     * @return 리뷰 개수
     */
    int countMyReviews(@Param("mId") Long mId);
}
