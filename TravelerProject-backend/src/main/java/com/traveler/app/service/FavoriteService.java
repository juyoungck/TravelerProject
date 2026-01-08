package com.traveler.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.FavoriteDao;
import com.traveler.app.dto.MyFavoriteDestinationDto;
import com.traveler.app.dto.MyFavoritePlannerDto;
import com.traveler.app.entity.FavoriteDestination;
import com.traveler.app.entity.FavoritePlanner;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * FavoriteService
 * 찜(즐겨찾기) 관련 비즈니스 로직 처리
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {
    
    private final FavoriteDao favoriteDao;
    
    // ============================================
    // 여행지 찜
    // ============================================
    
    /**
     * 내 여행지 찜 목록 조회
     * 
     * @param mId 회원 ID
     * @return 내 여행지 찜 목록 (여행지 정보 포함)
     */
    public List<MyFavoriteDestinationDto> getMyFavoriteDestinations(Long mId) {
        log.info("내 여행지 찜 목록 조회 - 회원 ID: {}", mId);
        return favoriteDao.selectMyFavoriteDestinations(mId);
    }
    
    /**
     * 여행지 찜 추가
     * 
     * @param mId 회원 ID
     * @param contentid 여행지 콘텐츠 ID
     * @return 추가 성공 여부
     */
    @Transactional
    public boolean addFavoriteDestination(Long mId, String contentid) {
        // 이미 찜한 여행지인지 확인
        if (favoriteDao.checkFavoriteDestination(mId, contentid) > 0) {
            log.info("이미 찜한 여행지 - 회원 ID: {}, 여행지: {}", mId, contentid);
            return false;
        }
        
        FavoriteDestination favorite = FavoriteDestination.builder()
                .mId(mId)
                .contentid(contentid)
                .build();
        
        int result = favoriteDao.insertFavoriteDestination(favorite);
        log.info("여행지 찜 추가 - 회원 ID: {}, 여행지: {}, 결과: {}", mId, contentid, result > 0);
        return result > 0;
    }
    
    /**
     * 여행지 찜 삭제
     * 
     * @param mId 회원 ID
     * @param contentid 여행지 콘텐츠 ID
     * @return 삭제 성공 여부
     */
    @Transactional
    public boolean removeFavoriteDestination(Long mId, String contentid) {
        int result = favoriteDao.deleteFavoriteDestination(mId, contentid);
        log.info("여행지 찜 삭제 - 회원 ID: {}, 여행지: {}, 결과: {}", mId, contentid, result > 0);
        return result > 0;
    }
    
    /**
     * 여행지 찜 여부 확인
     * 
     * @param mId 회원 ID
     * @param contentid 여행지 콘텐츠 ID
     * @return 찜 여부
     */
    public boolean isFavoriteDestination(Long mId, String contentid) {
        return favoriteDao.checkFavoriteDestination(mId, contentid) > 0;
    }
    
    /**
     * 여행지 찜 토글 (찜/찜 취소)
     * 
     * @param mId 회원 ID
     * @param contentid 여행지 콘텐츠 ID
     * @return 토글 후 찜 상태 (true: 찜함, false: 찜 취소)
     */
    @Transactional
    public boolean toggleFavoriteDestination(Long mId, String contentid) {
        if (isFavoriteDestination(mId, contentid)) {
            removeFavoriteDestination(mId, contentid);
            return false;
        } else {
            addFavoriteDestination(mId, contentid);
            return true;
        }
    }
    
    /**
     * 내 여행지 찜 개수 조회
     * 
     * @param mId 회원 ID
     * @return 찜 개수
     */
    public int countMyFavoriteDestinations(Long mId) {
        return favoriteDao.countMyFavoriteDestinations(mId);
    }
    
    // ============================================
    // 플래너 찜
    // ============================================
    
    /**
     * 내 플래너 찜 목록 조회
     * 
     * @param mId 회원 ID
     * @return 내 플래너 찜 목록 (플래너 정보 포함)
     */
    public List<MyFavoritePlannerDto> getMyFavoritePlanners(Long mId) {
        log.info("내 플래너 찜 목록 조회 - 회원 ID: {}", mId);
        return favoriteDao.selectMyFavoritePlanners(mId);
    }
    
    /**
     * 플래너 찜 추가
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 추가 성공 여부
     */
    @Transactional
    public boolean addFavoritePlanner(Long mId, Long plnId) {
        // 이미 찜한 플래너인지 확인
        if (favoriteDao.checkFavoritePlanner(mId, plnId) > 0) {
            log.info("이미 찜한 플래너 - 회원 ID: {}, 플래너: {}", mId, plnId);
            return false;
        }
        
        FavoritePlanner favorite = FavoritePlanner.builder()
                .mId(mId)
                .plnId(plnId)
                .build();
        
        int result = favoriteDao.insertFavoritePlanner(favorite);
        log.info("플래너 찜 추가 - 회원 ID: {}, 플래너: {}, 결과: {}", mId, plnId, result > 0);
        return result > 0;
    }
    
    /**
     * 플래너 찜 삭제
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 삭제 성공 여부
     */
    @Transactional
    public boolean removeFavoritePlanner(Long mId, Long plnId) {
        int result = favoriteDao.deleteFavoritePlanner(mId, plnId);
        log.info("플래너 찜 삭제 - 회원 ID: {}, 플래너: {}, 결과: {}", mId, plnId, result > 0);
        return result > 0;
    }
    
    /**
     * 플래너 찜 여부 확인
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 찜 여부
     */
    public boolean isFavoritePlanner(Long mId, Long plnId) {
        return favoriteDao.checkFavoritePlanner(mId, plnId) > 0;
    }
    
    /**
     * 플래너 찜 토글 (찜/찜 취소)
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return 토글 후 찜 상태 (true: 찜함, false: 찜 취소)
     */
    @Transactional
    public boolean toggleFavoritePlanner(Long mId, Long plnId) {
        if (isFavoritePlanner(mId, plnId)) {
            removeFavoritePlanner(mId, plnId);
            return false;
        } else {
            addFavoritePlanner(mId, plnId);
            return true;
        }
    }
    
    /**
     * 내 플래너 찜 개수 조회
     * 
     * @param mId 회원 ID
     * @return 찜 개수
     */
    public int countMyFavoritePlanners(Long mId) {
        return favoriteDao.countMyFavoritePlanners(mId);
    }
}
