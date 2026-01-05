package com.traveler.app.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * FavoritePlannerDao
 * 플래너 찜 기능 데이터 접근
 */
@Mapper
public interface FavoritePlannerDao {
    
    /**
     * 찜 추가
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 추가된 행 수
     */
    int insertFavorite(@Param("mId") Long mId, @Param("plnId") Long plnId);
    
    /**
     * 찜 삭제
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 삭제된 행 수
     */
    int deleteFavorite(@Param("mId") Long mId, @Param("plnId") Long plnId);
    
    /**
     * 찜 여부 확인
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 찜 개수 (0 또는 1)
     */
    int checkFavorite(@Param("mId") Long mId, @Param("plnId") Long plnId);
    
    /**
     * 플래너의 찜 개수 조회
     * @param plnId 플래너 ID
     * @return 찜 개수
     */
    int countFavoriteByPlanner(@Param("plnId") Long plnId);
}
