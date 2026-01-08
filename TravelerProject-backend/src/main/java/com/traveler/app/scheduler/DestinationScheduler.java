package com.traveler.app.scheduler;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.traveler.app.service.DestinationService;
import com.traveler.app.service.LdongCodeService;

import lombok.extern.slf4j.Slf4j;

/**
 * 여행지 데이터 자동 업데이트 스케줄러
 * 매일 새벽 3시에 실행
 */
@Component
@Slf4j
public class DestinationScheduler {

    private final DestinationService destinationService;
    private final LdongCodeService ldongCodeService;

    public DestinationScheduler(DestinationService destinationService, LdongCodeService ldongCodeService) {
        this.destinationService = destinationService;
        this.ldongCodeService = ldongCodeService;
    }

    /**
     * 매일 새벽 4시에 여행지 데이터 업데이트
     * 크론 표현식: 초 분 시 일 월 요일
     * "0 0 3 * * *" = 매일 04:00:00
     * 
     * ★ 업데이트 내용:
     * 1. 기본 정보 (title, addr, mapx, mapy, firstimage 등)
     * 2. 상세 정보 (overview, homepage)
     * 3. 이미지 정보 (destination_image 테이블)
     */
    @Scheduled(cron = "0 0 4 * * *")
    public void updateDestinationData() {
        String startTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        log.info("========== [스케줄러] 여행지 데이터 업데이트 시작: {} ==========", startTime);

        try {
            // ★ 변경된 여행지 기본정보 + 상세정보 + 이미지 모두 업데이트
            log.info("[스케줄러] 변경된 여행지 동기화 시작 (기본정보 + 상세정보 + 이미지)");
            int destCount = destinationService.syncModifiedDestinations();
            log.info("[스케줄러] 변경된 여행지 동기화 완료: {}건", destCount);

        } catch (Exception e) {
            log.error("[스케줄러] 데이터 업데이트 실패: {}", e.getMessage(), e);
        }

        String endTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        log.info("========== [스케줄러] 여행지 데이터 업데이트 종료: {} ==========", endTime);
    }

    /**
     * 수동 실행용 메서드 (테스트용)
     */
    public void manualUpdate() {
        updateDestinationData();
    }
}