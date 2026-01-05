package com.traveler.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.service.FavoritePlannerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * FavoritePlannerController
 * 플래너 찜 기능 API
 */
@Slf4j
@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class FavoritePlannerController {
    
    private final FavoritePlannerService favoritePlannerService;
    
    /**
     * 찜 토글 (추가/삭제)
     * POST /api/planner/{plnId}/favorite?mId=1
     * 
     * @param plnId 플래너 ID
     * @param mId 회원 ID
     * @return 찜 상태 (isFavorite: true/false)
     */
    @PostMapping("/{plnId}/favorite")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @PathVariable("plnId") Long plnId,
            @RequestParam("mId") Long mId) {
        
        log.info("찜 토글 요청: plnId={}, mId={}", plnId, mId);
        
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isFavorite = favoritePlannerService.toggleFavorite(mId, plnId);
            int favoriteCount = favoritePlannerService.getFavoriteCount(plnId);
            
            response.put("status", "success");
            response.put("isFavorite", isFavorite);
            response.put("favoriteCount", favoriteCount);
            response.put("message", isFavorite ? "찜 목록에 추가되었습니다." : "찜 목록에서 삭제되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("찜 토글 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 찜 여부 확인
     * GET /api/planner/{plnId}/favorite?mId=1
     * 
     * @param plnId 플래너 ID
     * @param mId 회원 ID
     * @return 찜 여부 (isFavorite: true/false)
     */
    @GetMapping("/{plnId}/favorite")
    public ResponseEntity<Map<String, Object>> checkFavorite(
            @PathVariable("plnId") Long plnId,
            @RequestParam("mId") Long mId) {
        
        log.info("찜 여부 확인: plnId={}, mId={}", plnId, mId);
        
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isFavorite = favoritePlannerService.isFavorite(mId, plnId);
            int favoriteCount = favoritePlannerService.getFavoriteCount(plnId);
            
            response.put("status", "success");
            response.put("isFavorite", isFavorite);
            response.put("favoriteCount", favoriteCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("찜 여부 확인 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
