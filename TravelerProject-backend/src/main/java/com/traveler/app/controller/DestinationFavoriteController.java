package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.dto.DestinationFavoriteDto;
import com.traveler.app.entity.DestinationFavorite;
import com.traveler.app.service.DestinationFavoriteService;

/**
 * 여행지 찜 API 컨트롤러
 * 찜 추가/해제/조회 기능 제공
 */
@RestController
@RequestMapping("/api/favorite")
public class DestinationFavoriteController {

    private final DestinationFavoriteService favoriteService;

    public DestinationFavoriteController(DestinationFavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    /**
     * 찜 추가
     * POST /api/favorite/destination
     */
    @PostMapping("/destination")
    public Map<String, Object> addFavorite(@RequestBody DestinationFavoriteDto dto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int favoriteCount = favoriteService.addFavorite(dto);
            
            response.put("status", "success");
            response.put("message", "찜 추가 완료");
            response.put("favoriteCount", favoriteCount);
        } catch (IllegalStateException e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "찜 추가 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 찜 해제
     * DELETE /api/favorite/destination/{contentid}?memberId={memberId}
     */
    @DeleteMapping("/destination/{contentid}")
    public Map<String, Object> removeFavorite(
            @PathVariable("contentid") String contentid,
            @RequestParam("memberId") Long memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int favoriteCount = favoriteService.removeFavorite(memberId, contentid);
            
            response.put("status", "success");
            response.put("message", "찜 해제 완료");
            response.put("favoriteCount", favoriteCount);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "찜 해제 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 찜 토글 (찜/찜해제 한번에 처리)
     * POST /api/favorite/destination/toggle
     */
    @PostMapping("/destination/toggle")
    public Map<String, Object> toggleFavorite(@RequestBody DestinationFavoriteDto dto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isFavorite = favoriteService.toggleFavorite(dto.getMId(), dto.getContentid());
            int favoriteCount = favoriteService.getFavoriteCount(dto.getContentid());
            
            response.put("status", "success");
            response.put("isFavorite", isFavorite);
            response.put("message", isFavorite ? "찜 추가 완료" : "찜 해제 완료");
            response.put("favoriteCount", favoriteCount);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "찜 토글 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 찜 여부 확인
     * GET /api/favorite/destination/{contentid}/check?memberId={memberId}
     */
    @GetMapping("/destination/{contentid}/check")
    public Map<String, Object> checkFavorite(
            @PathVariable("contentid") String contentid,
            @RequestParam("memberId") Long memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isFavorite = favoriteService.isFavorite(memberId, contentid);
            
            response.put("status", "success");
            response.put("contentid", contentid);
            response.put("isFavorite", isFavorite);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 여행지별 찜 개수 조회
     * GET /api/favorite/destination/{contentid}/count
     */
    @GetMapping("/destination/{contentid}/count")
    public Map<String, Object> getFavoriteCount(@PathVariable("contentid") String contentid) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int favoriteCount = favoriteService.getFavoriteCount(contentid);
            
            response.put("status", "success");
            response.put("contentid", contentid);
            response.put("favoriteCount", favoriteCount);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 회원별 찜 목록 조회 (마이페이지용)
     * GET /api/favorite/member/{memberId}
     */
    @GetMapping("/member/{memberId}")
    public Map<String, Object> getFavoritesByMember(@PathVariable("memberId") Long memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<DestinationFavorite> favorites = favoriteService.getFavoritesByMemberId(memberId);
            
            response.put("status", "success");
            response.put("data", favorites);
            response.put("totalCount", favorites.size());
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
}