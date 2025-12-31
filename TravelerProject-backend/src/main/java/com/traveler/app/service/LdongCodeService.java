package com.traveler.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.LdongCodeDao;
import com.traveler.app.dto.LdongCodeDto;
import com.traveler.app.entity.LdongRegnCode;
import com.traveler.app.entity.LdongSignguCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 법정동 코드 관리 서비스
 * API에서 가져온 데이터를 DB에 저장/조회하는 역할
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LdongCodeService {

    private final TourApiService tourApiService;
    private final LdongCodeDao ldongCodeDao;

    /**
     * API 응답 원본 확인 (디버그용)
     */
    public List<LdongCodeDto> fetchRegnCodesForTest() {
        return tourApiService.fetchLdongRegnCodes();
    }

    /**
     * 저장된 시도 코드 개수 조회
     */
    public int getRegnCodeCount() {
        return ldongCodeDao.countRegnCode();
    }

    /**
     * 저장된 시군구 코드 개수 조회
     */
    public int getSignguCodeCount() {
        return ldongCodeDao.countSignguCode();
    }

    /**
     * 모든 시도 코드 조회
     */
    public List<LdongRegnCode> getAllRegnCodes() {
        return ldongCodeDao.selectAllRegnCode();
    }

    /**
     * 특정 시도의 시군구 코드 조회
     */
    public List<LdongSignguCode> getSignguCodesByRegnCd(String lDongRegnCd) {
        return ldongCodeDao.selectSignguCodeByRegnCd(lDongRegnCd);
    }
    
    /**
     * 저장된 코드 개수 조회
     */
    public int getRegnCodeCount() {
        return ldongCodeDao.countRegnCode();
    }

    public int getSignguCodeCount() {
        return ldongCodeDao.countSignguCode();
    }
}
