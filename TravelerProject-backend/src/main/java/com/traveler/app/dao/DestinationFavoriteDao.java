package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.DestinationFavorite;

/**
 * 여행지 찜 DAO (MyBatis Mapper)
 * 찜 추가/해제/조회 처리
 */
@Mapper
public interface DestinationFavoriteDao {
    
    /** 찜 추가 */
    void insertFavorite(DestinationFavorite favorite);
    
    /** 찜 해제 (삭제) */
    void deleteFavorite(@Param("mId") Long mId, @Param("contentid") String contentid);
    
    /** 찜 여부 확인 */
    int checkFavorite(@Param("mId") Long mId, @Param("contentid") String contentid);
    
    /** 여행지별 찜 개수 조회 */
    int countFavoritesByContentId(@Param("contentid") String contentid);
    
    /** 회원별 찜 목록 조회 (마이페이지용) */
    List<DestinationFavorite> selectFavoritesByMemberId(@Param("mId") Long mId);
    
    /** 찜 단건 조회 */
    DestinationFavorite selectFavoriteById(@Param("favId") Long favId);
}