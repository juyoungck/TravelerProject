package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.DestinationReview;

/**
 * 여행지 리뷰 DAO (MyBatis Mapper)
 * 리뷰 CRUD 처리
 */
@Mapper
public interface DestinationReviewDao {
    
    /** 리뷰 등록 */
    void insertReview(DestinationReview review);
    
    /** 리뷰 단건 조회 */
    DestinationReview selectReviewById(@Param("rvId") Long rvId);
    
    /** 여행지별 리뷰 목록 조회 */
    List<DestinationReview> selectReviewsByContentId(@Param("contentid") String contentid);
    
    /** 회원별 리뷰 목록 조회 (마이페이지용) */
    List<DestinationReview> selectReviewsByMemberId(@Param("mId") Long mId);
    
    /** 리뷰 수정 */
    void updateReview(DestinationReview review);
    
    /** 리뷰 삭제 */
    void deleteReview(@Param("rvId") Long rvId);
    
    /** 여행지별 리뷰 개수 조회 */
    int countReviewsByContentId(@Param("contentid") String contentid);
    
    /** 여행지별 평균 별점 조회 */
    Double selectAverageRatingByContentId(@Param("contentid") String contentid);
    
    /** 리뷰 이미지 등록 */
    void insertReviewImage(@Param("rvId") Long rvId, @Param("imageUrl") String imageUrl, @Param("sortOrder") int sortOrder);

    /** 리뷰 이미지 조회 */
    List<String> selectReviewImages(@Param("rvId") Long rvId);
    
    /** 리뷰 이미지 삭제 (단일) */
    void deleteReviewImage(@Param("rviId") Long rviId);

    /** 리뷰 이미지 전체 삭제 */
    void deleteReviewImagesByReviewId(@Param("rvId") Long rvId);
}