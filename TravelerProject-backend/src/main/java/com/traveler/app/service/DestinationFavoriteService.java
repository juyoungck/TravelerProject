package com.traveler.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.DestinationFavoriteDao;
import com.traveler.app.dto.DestinationFavoriteDto;
import com.traveler.app.entity.DestinationFavorite;

/**
 * 여행지 찜 Service
 * 찜 추가/해제/조회 비즈니스 로직 처리
 */
@Service
@Transactional
public class DestinationFavoriteService {

    private final DestinationFavoriteDao favoriteDao;

    public DestinationFavoriteService(DestinationFavoriteDao favoriteDao) {
        this.favoriteDao = favoriteDao;
    }

    /**
     * 찜 추가
     * @param dto 찜 정보
     * @return 추가 후 찜 개수
     */
    public int addFavorite(DestinationFavoriteDto dto) {
        // 이미 찜한 경우 체크
        if (isFavorite(dto.getMId(), dto.getContentid())) {
            throw new IllegalStateException("이미 찜한 여행지입니다.");
        }
        
        DestinationFavorite favorite = DestinationFavorite.builder()
                .mId(dto.getMId())
                .contentid(dto.getContentid())
                .build();
        
        favoriteDao.insertFavorite(favorite);
        
        return getFavoriteCount(dto.getContentid());
    }

    /**
     * 찜 해제
     * @param mId 회원 ID
     * @param contentid 여행지 ID
     * @return 해제 후 찜 개수
     */
    public int removeFavorite(Long mId, String contentid) {
        favoriteDao.deleteFavorite(mId, contentid);
        return getFavoriteCount(contentid);
    }

    /**
     * 찜 토글 (찜되어 있으면 해제, 없으면 추가)
     * @param mId 회원 ID
     * @param contentid 여행지 ID
     * @return 토글 후 찜 상태 (true: 찜함, false: 찜해제)
     */
    public boolean toggleFavorite(Long mId, String contentid) {
        if (isFavorite(mId, contentid)) {
            favoriteDao.deleteFavorite(mId, contentid);
            return false;
        } else {
            DestinationFavorite favorite = DestinationFavorite.builder()
                    .mId(mId)
                    .contentid(contentid)
                    .build();
            favoriteDao.insertFavorite(favorite);
            return true;
        }
    }

    /**
     * 찜 여부 확인
     * @param mId 회원 ID
     * @param contentid 여행지 ID
     * @return 찜 여부
     */
    @Transactional(readOnly = true)
    public boolean isFavorite(Long mId, String contentid) {
        return favoriteDao.checkFavorite(mId, contentid) > 0;
    }

    /**
     * 여행지별 찜 개수 조회
     * @param contentid 여행지 ID
     * @return 찜 개수
     */
    @Transactional(readOnly = true)
    public int getFavoriteCount(String contentid) {
        return favoriteDao.countFavoritesByContentId(contentid);
    }

    /**
     * 회원별 찜 목록 조회 (마이페이지용)
     * @param mId 회원 ID
     * @return 찜 목록
     */
    @Transactional(readOnly = true)
    public List<DestinationFavorite> getFavoritesByMemberId(Long mId) {
        return favoriteDao.selectFavoritesByMemberId(mId);
    }
}