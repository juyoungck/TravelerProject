package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.traveler.app.dto.MyFavoriteDestinationDto;
import com.traveler.app.dto.MyFavoritePlannerDto;
import com.traveler.app.service.FavoriteService;
import com.traveler.app.service.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * FavoriteController
 * 찜(즐겨찾기) 관련 API 컨트롤러
 * 
 * API 엔드포인트:
 * [여행지 찜]
 * - GET /api/favorites/destinations : 내 여행지 찜 목록
 * - POST /api/favorites/destinations/{contentid} : 여행지 찜 추가
 * - DELETE /api/favorites/destinations/{contentid} : 여행지 찜 삭제
 * - POST /api/favorites/destinations/{contentid}/toggle : 여행지 찜 토글
 * - GET /api/favorites/destinations/{contentid}/check : 여행지 찜 여부 확인
 * 
 * [플래너 찜]
 * - GET /api/favorites/planners : 내 플래너 찜 목록
 * - POST /api/favorites/planners/{plnId} : 플래너 찜 추가
 * - DELETE /api/favorites/planners/{plnId} : 플래너 찜 삭제
 * - POST /api/favorites/planners/{plnId}/toggle : 플래너 찜 토글
 * - GET /api/favorites/planners/{plnId}/check : 플래너 찜 여부 확인
 * 
 * @author TravelerProject
 */
@Slf4j
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    private final JwtService jwtService;
    
    // ============================================
    // 여행지 찜 API
    // ============================================
    
    /**
     * 내 여행지 찜 목록 조회
     * GET /api/favorites/destinations
     */
    @GetMapping("/destinations")
    public ResponseEntity<Map<String, Object>> getMyFavoriteDestinations(
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            List<MyFavoriteDestinationDto> favorites = favoriteService.getMyFavoriteDestinations(mId);
            int totalCount = favoriteService.countMyFavoriteDestinations(mId);
            
            response.put("status", "success");
            response.put("data", favorites);
            response.put("totalCount", totalCount);
            
            log.info("내 여행지 찜 목록 조회 - 회원 ID: {}, 찜 수: {}", mId, totalCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("여행지 찜 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "찜 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 여행지 찜 추가
     * POST /api/favorites/destinations/{contentid}
     */
    @PostMapping("/destinations/{contentid}")
    public ResponseEntity<Map<String, Object>> addFavoriteDestination(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("contentid") String contentid) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            boolean result = favoriteService.addFavoriteDestination(mId, contentid);
            
            if (result) {
                response.put("status", "success");
                response.put("message", "찜 목록에 추가되었습니다.");
                response.put("isFavorite", true);
            } else {
                response.put("status", "info");
                response.put("message", "이미 찜한 여행지입니다.");
                response.put("isFavorite", true);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("여행지 찜 추가 오류", e);
            response.put("status", "error");
            response.put("message", "찜 추가 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 여행지 찜 삭제
     * DELETE /api/favorites/destinations/{contentid}
     */
    @DeleteMapping("/destinations/{contentid}")
    public ResponseEntity<Map<String, Object>> removeFavoriteDestination(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("contentid") String contentid) {  // ← 이름 추가!
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            boolean result = favoriteService.removeFavoriteDestination(mId, contentid);
            
            if (result) {
                response.put("status", "success");
                response.put("message", "찜 목록에서 삭제되었습니다.");
                response.put("isFavorite", false);
            } else {
                response.put("status", "info");
                response.put("message", "찜 목록에 없는 여행지입니다.");
                response.put("isFavorite", false);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("여행지 찜 삭제 오류", e);
            response.put("status", "error");
            response.put("message", "찜 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 여행지 찜 토글 (찜 ↔ 찜 취소)
     * POST /api/favorites/destinations/{contentid}/toggle
     */
    @PostMapping("/destinations/{contentid}/toggle")
    public ResponseEntity<Map<String, Object>> toggleFavoriteDestination(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("contentid") String contentid) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            boolean isFavorite = favoriteService.toggleFavoriteDestination(mId, contentid);
            
            response.put("status", "success");
            response.put("isFavorite", isFavorite);
            response.put("message", isFavorite ? "찜 목록에 추가되었습니다." : "찜 목록에서 삭제되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("여행지 찜 토글 오류", e);
            response.put("status", "error");
            response.put("message", "찜 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 여행지 찜 여부 확인
     * GET /api/favorites/destinations/{contentid}/check
     */
    @GetMapping("/destinations/{contentid}/check")
    public ResponseEntity<Map<String, Object>> checkFavoriteDestination(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("contentid") String contentid) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "success");
                response.put("isFavorite", false);
                return ResponseEntity.ok(response);
            }
            
            boolean isFavorite = favoriteService.isFavoriteDestination(mId, contentid);
            
            response.put("status", "success");
            response.put("isFavorite", isFavorite);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("여행지 찜 여부 확인 오류", e);
            response.put("status", "error");
            response.put("message", "찜 여부 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // ============================================
    // 플래너 찜 API
    // ============================================
    
    /**
     * 내 플래너 찜 목록 조회
     * GET /api/favorites/planners
     */
    @GetMapping("/planners")
    public ResponseEntity<Map<String, Object>> getMyFavoritePlanners(
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            List<MyFavoritePlannerDto> favorites = favoriteService.getMyFavoritePlanners(mId);
            int totalCount = favoriteService.countMyFavoritePlanners(mId);
            
            response.put("status", "success");
            response.put("data", favorites);
            response.put("totalCount", totalCount);
            
            log.info("내 플래너 찜 목록 조회 - 회원 ID: {}, 찜 수: {}", mId, totalCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("플래너 찜 목록 조회 오류", e);
            response.put("status", "error");
            response.put("message", "찜 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 플래너 찜 추가
     * POST /api/favorites/planners/{plnId}
     */
    @PostMapping("/planners/{plnId}")
    public ResponseEntity<Map<String, Object>> addFavoritePlanner(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("plnId") Long plnId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            boolean result = favoriteService.addFavoritePlanner(mId, plnId);
            
            if (result) {
                response.put("status", "success");
                response.put("message", "찜 목록에 추가되었습니다.");
                response.put("isFavorite", true);
            } else {
                response.put("status", "info");
                response.put("message", "이미 찜한 플래너입니다.");
                response.put("isFavorite", true);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("플래너 찜 추가 오류", e);
            response.put("status", "error");
            response.put("message", "찜 추가 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 플래너 찜 삭제
     * DELETE /api/favorites/planners/{plnId}
     */
    @DeleteMapping("/planners/{plnId}")
    public ResponseEntity<Map<String, Object>> removeFavoritePlanner(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long plnId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            boolean result = favoriteService.removeFavoritePlanner(mId, plnId);
            
            if (result) {
                response.put("status", "success");
                response.put("message", "찜 목록에서 삭제되었습니다.");
                response.put("isFavorite", false);
            } else {
                response.put("status", "info");
                response.put("message", "찜 목록에 없는 플래너입니다.");
                response.put("isFavorite", false);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("플래너 찜 삭제 오류", e);
            response.put("status", "error");
            response.put("message", "찜 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 플래너 찜 토글 (찜 ↔ 찜 취소)
     * POST /api/favorites/planners/{plnId}/toggle
     */
    @PostMapping("/planners/{plnId}/toggle")
    public ResponseEntity<Map<String, Object>> toggleFavoritePlanner(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long plnId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "error");
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            boolean isFavorite = favoriteService.toggleFavoritePlanner(mId, plnId);
            
            response.put("status", "success");
            response.put("isFavorite", isFavorite);
            response.put("message", isFavorite ? "찜 목록에 추가되었습니다." : "찜 목록에서 삭제되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("플래너 찜 토글 오류", e);
            response.put("status", "error");
            response.put("message", "찜 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 플래너 찜 여부 확인
     * GET /api/favorites/planners/{plnId}/check
     */
    @GetMapping("/planners/{plnId}/check")
    public ResponseEntity<Map<String, Object>> checkFavoritePlanner(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long plnId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.replace("Bearer ", "");
            Long mId = jwtService.getMemberIdFromToken(token);
            
            if (mId == null) {
                response.put("status", "success");
                response.put("isFavorite", false);
                return ResponseEntity.ok(response);
            }
            
            boolean isFavorite = favoriteService.isFavoritePlanner(mId, plnId);
            
            response.put("status", "success");
            response.put("isFavorite", isFavorite);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("플래너 찜 여부 확인 오류", e);
            response.put("status", "error");
            response.put("message", "찜 여부 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}
