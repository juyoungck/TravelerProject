package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.entity.Destination;
import com.traveler.app.service.DestinationService;

import lombok.extern.slf4j.Slf4j;

/**
 * 여행지 API 컨트롤러
 * 여행지 조회 및 동기화 기능 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/destination")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    /**
     * 여행지 목록 조회 (관광타입별, 페이징, 지역 필터)
     * URL: GET /api/destination/list/{contenttypeid}?page=1&size=10&lDongRegnCd=11&lDongSignguCd=680
     */
    @GetMapping("/list/{contenttypeid}")
    public Map<String, Object> getDestinationsByType(
            @PathVariable("contenttypeid") String contenttypeid,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "lDongRegnCd", required = false) String lDongRegnCd,
            @RequestParam(value = "lDongSignguCd", required = false) String lDongSignguCd) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> result = destinationService.getDestinationsWithPagingAndRegion(
                    contenttypeid, page, size, lDongRegnCd, lDongSignguCd);
            
            response.put("status", "success");
            response.put("contenttypeid", contenttypeid);
            response.putAll(result);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 여행지 상세 조회
     * URL: GET /api/destination/detail/{contentid}
     */
    @GetMapping("/detail/{contentid}")
    public Map<String, Object> getDestinationDetail(
            @PathVariable("contentid") String contentid) {
        
        Map<String, Object> response = new HashMap<>();
        
        Destination destination = destinationService.getDestinationById(contentid);
        
        if (destination != null) {
            response.put("status", "success");
            response.put("data", destination);
        } else {
            response.put("status", "fail");
            response.put("message", "여행지를 찾을 수 없습니다.");
        }
        
        return response;
    }

    /**
     * 여행지 검색 (키워드 + 지역 필터)
     * URL: GET /api/destination/search?keyword=경복궁&page=1&size=10&lDongRegnCd=11
     */
    @GetMapping("/search")
    public Map<String, Object> searchDestinations(
            @RequestParam(value = "keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "lDongRegnCd", required = false) String lDongRegnCd,
            @RequestParam(value = "lDongSignguCd", required = false) String lDongSignguCd) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> result = destinationService.searchDestinationsWithRegion(
                    keyword, page, size, lDongRegnCd, lDongSignguCd);
            response.put("status", "success");
            response.put("keyword", keyword);
            response.putAll(result);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 여행지 현황 조회
     * URL: GET /api/destination/status
     */
    @GetMapping("/status")
    public Map<String, Object> getDestinationStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> status = destinationService.getDestinationStatus();
            response.put("status", "success");
            response.putAll(status);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    // ============================================
    // 동기화 API (관리자용)
    // ============================================

    /**
     * 특정 관광타입 여행지 동기화
     * URL: POST /api/destination/sync?contenttypeid=12&pages=3
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncDestinations(
            @RequestParam(value = "contenttypeid") String contenttypeid,
            @RequestParam(value = "pages", defaultValue = "3") int pages) {
        
        Map<String, Object> response = new HashMap<>();
        
        log.info("=== 여행지 동기화 API 호출: 타입={}, 페이지={} ===", contenttypeid, pages);
        
        try {
            int savedCount = destinationService.syncDestinations(contenttypeid, pages);
            
            response.put("status", "success");
            response.put("message", "동기화 완료");
            response.put("contenttypeid", contenttypeid);
            response.put("savedCount", savedCount);
            
            log.info("=== 동기화 완료: {}건 저장 ===", savedCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("동기화 실패: {}", e.getMessage(), e);
            response.put("status", "fail");
            response.put("message", "동기화 실패: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 전체 관광타입 여행지 동기화
     * URL: POST /api/destination/sync/all?pagesPerType=2
     */
    @PostMapping("/sync/all")
    public ResponseEntity<Map<String, Object>> syncAllDestinations(
            @RequestParam(value = "pagesPerType", defaultValue = "2") int pagesPerType) {
        
        Map<String, Object> response = new HashMap<>();
        
        log.info("=== 전체 여행지 동기화 API 호출: 타입당 {}페이지 ===", pagesPerType);
        
        try {
            int savedCount = destinationService.syncAllDestinations(pagesPerType);
            
            response.put("status", "success");
            response.put("message", "전체 동기화 완료");
            response.put("savedCount", savedCount);
            
            log.info("=== 전체 동기화 완료: {}건 저장 ===", savedCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("전체 동기화 실패: {}", e.getMessage(), e);
            response.put("status", "fail");
            response.put("message", "동기화 실패: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 여행지 상세정보 업데이트 (overview, homepage)
     * URL: POST /api/destination/detail/{contentid}/update
     */
    @PostMapping("/detail/{contentid}/update")
    public ResponseEntity<Map<String, Object>> updateDestinationDetail(
            @PathVariable("contentid") String contentid) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean success = destinationService.updateDestinationDetail(contentid);
            
            if (success) {
                response.put("status", "success");
                response.put("message", "상세정보 업데이트 완료");
            } else {
                response.put("status", "fail");
                response.put("message", "상세정보 업데이트 실패");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
