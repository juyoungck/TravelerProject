package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.dto.MyFavoriteDestinationDto;
import com.traveler.app.dto.MyFavoritePlannerDto;
import com.traveler.app.entity.FavoriteDestination;
import com.traveler.app.entity.FavoritePlanner;

/**
 * FavoriteDao
 * 찜(즐겨찾기) 테이블 데이터 접근 인터페이스
 * 
 * @author TravelerProject
 */
@Mapper
public interface FavoriteDao {
    
    // ============================================
    // 여행지 찜
    // ============================================
    
    /**
     * 내 여행지 찜 목록 조회 (여행지 정보 포함)
     * 
     * @param mId 회원 ID
     * @return 내 여행지 찜 목록
     */
    List<MyFavoriteDestinationDto> selectMyFavoriteDestinations(@Param("mId") Long mId);
    
    /**
     * 여행지 찜 추가
     * 
     * @param favorite 찜 정보
     * @return 등록된 행 수
     */
    int insertFavoriteDestination(FavoriteDestination favorite);
    
    /**
     * 여행지 찜 삭제
     * 
     * @param mId 회원 ID
     * @param contentid 여행지 콘텐츠 ID
     * @return 삭제된 행 수
     */
    int deleteFavoriteDestination(@Param("mId") Long mId, @Param("contentid") String contentid);
    
    /**
     * 여행지 찜 여부 확인
     * 
     * @param mId 회원 ID
     * @param contentid 여행지 콘텐츠 ID
     * @return 찜 여부 (1: 찜함, 0: 찜 안함)
     */
    int checkFavoriteDestination(@Param("mId") Long mId, @Param("contentid") String contentid);
    
    /**
     * 내 여행지 찜 개수 조회
     * 
     * @param mId 회원 ID
     * @return 찜 개수
     */
    int countMyFavoriteDestinations(@Param("mId") Long mId);
    
    // ============================================
    // 플래너 찜
    // ============================================
    
    /**
     * 내 플래너 찜 목록 조회 (플래너 정보 포함)
     * 
     * @param mId 회원 ID
     * @return 내 플래너 찜 목록
     */
    List<MyFavoritePlannerDto> selectMyFavoritePlanners(@Param("mId") Long mId);
    
    /**
     * 플래너 찜 추가
     * 
     * @param favorite 찜 정보
     * @return 등록된 행 수
     */
    int insertFavoritePlanner(FavoritePlanner favorite);
    
    /**
     * 플래너 찜 삭제
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 삭제된 행 수
     */
    int deleteFavoritePlanner(@Param("mId") Long mId, @Param("plnId") Long plnId);
    
    /**
     * 플래너 찜 여부 확인
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 찜 여부 (1: 찜함, 0: 찜 안함)
     */
    int checkFavoritePlanner(@Param("mId") Long mId, @Param("plnId") Long plnId);
    
    /**
     * 내 플래너 찜 개수 조회
     * 
     * @param mId 회원 ID
     * @return 찜 개수
     */
    int countMyFavoritePlanners(@Param("mId") Long mId);
}
