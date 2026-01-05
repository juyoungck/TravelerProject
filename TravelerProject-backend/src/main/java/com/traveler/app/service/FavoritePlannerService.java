package com.traveler.app.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.FavoritePlannerDao;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * FavoritePlannerService
 * 플래너 찜 기능 비즈니스 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoritePlannerService {
    
    private final FavoritePlannerDao favoritePlannerDao;
    
    /**
     * 찜 토글 (추가/삭제)
     * - 이미 찜했으면 삭제
     * - 찜 안했으면 추가
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return true=찜 추가됨, false=찜 삭제됨
     */
    @Transactional
    public boolean toggleFavorite(Long mId, Long plnId) {
        // 이미 찜했는지 확인
        int exists = favoritePlannerDao.checkFavorite(mId, plnId);
        
        if (exists > 0) {
            // 이미 찜함 → 삭제
            favoritePlannerDao.deleteFavorite(mId, plnId);
            log.info("찜 삭제: mId={}, plnId={}", mId, plnId);
            return false;
        } else {
            // 찜 안함 → 추가
            favoritePlannerDao.insertFavorite(mId, plnId);
            log.info("찜 추가: mId={}, plnId={}", mId, plnId);
            return true;
        }
    }
    
    /**
     * 찜 여부 확인
     * 
     * @param mId 회원 ID
     * @param plnId 플래너 ID
     * @return true=찜함, false=찜 안함
     */
    public boolean isFavorite(Long mId, Long plnId) {
        return favoritePlannerDao.checkFavorite(mId, plnId) > 0;
    }
    
    /**
     * 플래너의 찜 개수 조회
     * 
     * @param plnId 플래너 ID
     * @return 찜 개수
     */
    public int getFavoriteCount(Long plnId) {
        return favoritePlannerDao.countFavoriteByPlanner(plnId);
    }
}
