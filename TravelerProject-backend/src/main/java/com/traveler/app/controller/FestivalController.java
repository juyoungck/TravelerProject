package com.traveler.app.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.service.FestivalService;

import lombok.extern.slf4j.Slf4j;

/**
 * 축제/공연/행사 컨트롤러
 * 
 * API 엔드포인트:
 * GET /api/festival?type=all&page=1&size=12
 * GET /api/festival/images/{contentId}
 * 
 * type 파라미터:
 * - all: 전체
 * - festival: 축제 (EV01)
 * - performance: 공연 (EV02)
 * - event: 행사 (EV03)
 */
@RestController
@RequestMapping("/api/festival")
@Slf4j
public class FestivalController {

    @Autowired
    private FestivalService festivalService;

    /**
     * 축제/공연/행사 목록 조회
     * 
     * @param type 타입 (all, festival, performance, event)
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 12)
     * @return 축제/공연/행사 목록
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFestivalList(
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        log.info("축제/공연/행사 목록 조회: type={}, page={}, size={}", type, page, size);
        
        Map<String, Object> result = festivalService.getFestivalList(type, page, size);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 콘텐츠 이미지 목록 조회
     * 
     * @param contentId 콘텐츠 ID
     * @return 이미지 URL 목록
     */
    @GetMapping("/images/{contentId}")
    public ResponseEntity<Map<String, Object>> getImages(@PathVariable("contentId") String contentId) {
        
        log.info("이미지 목록 조회: contentId={}", contentId);
        
        Map<String, Object> result = festivalService.getImages(contentId);
        
        return ResponseEntity.ok(result);
    }
}