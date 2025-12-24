package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.DestinationImage;

/**
 * 여행지 이미지 DAO (MyBatis Mapper)
 */
@Mapper
public interface DestinationImageDao {
    
    /** 이미지 저장 */
    void insertImage(DestinationImage image);
    
    /** 여행지별 이미지 목록 조회 */
    List<DestinationImage> selectImagesByContentId(String contentid);
    
    /** 여행지 이미지 삭제 (재수집 시 사용) */
    void deleteImagesByContentId(String contentid);
    
    /** 이미지 총 개수 */
    int countImages();
    
    /** 여행지별 이미지 개수 */
    int countImagesByContentId(String contentid);
}