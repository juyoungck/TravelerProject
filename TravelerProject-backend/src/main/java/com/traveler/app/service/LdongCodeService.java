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
     * 법정동 코드 전체 동기화
     * 1. 시도 코드 조회 및 저장
     * 2. 각 시도별 시군구 코드 조회 및 저장
     * @return 저장된 총 건수 (시도 + 시군구)
     */
    @Transactional
    public int syncAllLdongCodes() {
        log.info("========== 법정동 코드 동기화 시작 ==========");
        
        int totalCount = 0;

        // 1. 시도 코드 조회 및 저장
        List<LdongCodeDto> regnCodes = tourApiService.fetchLdongRegnCodes();
        
        for (LdongCodeDto dto : regnCodes) {
            // DTO → Entity 변환 후 저장
            LdongRegnCode regnCode = LdongRegnCode.builder()
                    .lDongRegnCd(dto.getCode())    // code → lDongRegnCd
                    .regnName(dto.getName())        // name → regnName
                    .build();
            
            ldongCodeDao.mergeRegnCode(regnCode);
            totalCount++;
            
            log.info("시도 코드 저장: {} - {}", dto.getCode(), dto.getName());

            // 2. 각 시도별 시군구 코드 조회 및 저장
            List<LdongCodeDto> signguCodes = tourApiService.fetchLdongSignguCodes(dto.getCode());
            
            for (LdongCodeDto signguDto : signguCodes) {
                LdongSignguCode signguCode = LdongSignguCode.builder()
                        .lDongRegnCd(dto.getCode())           // 시도코드
                        .lDongSignguCd(signguDto.getCode())   // 시군구코드
                        .signguName(signguDto.getName())       // 시군구명
                        .build();
                
                ldongCodeDao.mergeSignguCode(signguCode);
                totalCount++;
            }
            
            log.info("시군구 코드 저장 완료 (시도: {}): {}건", dto.getName(), signguCodes.size());

            // API 호출 간격 조절 (과부하 방지)
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        log.info("========== 법정동 코드 동기화 완료: 총 {}건 ==========", totalCount);
        return totalCount;
    }

    /**
     * 시도 코드 전체 조회
     */
    public List<LdongRegnCode> getAllRegnCodes() {
        return ldongCodeDao.selectAllRegnCode();
    }

    /**
     * 시군구 코드 조회 (시도별)
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