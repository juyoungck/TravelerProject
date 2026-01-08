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
 * GET /api/festival?type=all&page=1&size=12 - 축제/공연/행사 목록 (OpenAPI)
 * GET /api/festival/images/{contentId} - 이미지 목록 (OpenAPI)
 * GET /api/festival/course/{contentId} - 코스 경유지 (OpenAPI)
 * 
 * 여행코스 목록은 /api/destination/search?contenttypeid=25 사용 (DB)
 */
@RestController
@RequestMapping("/api/festival")
@Slf4j
public class FestivalController {

    @Autowired
    private FestivalService festivalService;

    /**
     * 축제/공연/행사 목록 조회
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFestivalList(
            @RequestParam(name = "type", defaultValue = "all") String type,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "12") int size) {
        
        log.info("축제/공연/행사 목록 조회: type={}, page={}, size={}", type, page, size);
        
        Map<String, Object> result = festivalService.getFestivalList(type, page, size);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 콘텐츠 이미지 목록 조회
     */
    @GetMapping("/images/{contentId}")
    public ResponseEntity<Map<String, Object>> getImages(@PathVariable("contentId") String contentId) {
        
        log.info("이미지 목록 조회: contentId={}", contentId);
        
        Map<String, Object> result = festivalService.getImages(contentId);
        
        return ResponseEntity.ok(result);
    }

    /**
     * 코스 경유지(상세정보) 조회
     */
    @GetMapping("/course/{contentId}")
    public ResponseEntity<Map<String, Object>> getCourseDetail(@PathVariable("contentId") String contentId) {
        
        log.info("코스 경유지 조회: contentId={}", contentId);
        
        Map<String, Object> result = festivalService.getCourseDetail(contentId);
        
        return ResponseEntity.ok(result);
    }
}