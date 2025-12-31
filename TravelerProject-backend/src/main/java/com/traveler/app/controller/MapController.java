package com.traveler.app.controller;

import com.traveler.app.dto.NearbyDestinationDto;
import com.traveler.app.service.MapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MapController.java
 * 지도 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/map")
public class MapController {

    @Autowired
    private MapService mapService;

    /**
     * 주변 여행지 조회 API
     */
    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> getNearbyDestinations(
            @RequestParam(name = "lat") Double lat,
            @RequestParam(name = "lng") Double lng,
            @RequestParam(name = "radius", required = false) Double radius,
            @RequestParam(name = "contenttypeid", required = false) String contenttypeid,
            @RequestParam(name = "limit", required = false) Integer limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<NearbyDestinationDto> destinations = mapService.getNearbyDestinations(
                    lat, lng, radius, contenttypeid, limit);
            
            response.put("status", "success");
            response.put("data", destinations);
            response.put("totalCount", destinations.size());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 특정 지역 여행지 조회 API
     */
    @GetMapping("/region")
    public ResponseEntity<Map<String, Object>> getDestinationsByRegion(
            @RequestParam(name = "lDongRegnCd") String lDongRegnCd,
            @RequestParam(name = "lDongSignguCd", required = false) String lDongSignguCd,
            @RequestParam(name = "contenttypeid", required = false) String contenttypeid,
            @RequestParam(name = "limit", required = false) Integer limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<NearbyDestinationDto> destinations = mapService.getDestinationsByRegion(
                    lDongRegnCd, lDongSignguCd, contenttypeid, limit);
            
            response.put("status", "success");
            response.put("data", destinations);
            response.put("totalCount", destinations.size());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 지도용 여행지 검색 API
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchDestinationsForMap(
            @RequestParam(name = "keyword") String keyword,
            @RequestParam(name = "contenttypeid", required = false) String contenttypeid,
            @RequestParam(name = "limit", required = false) Integer limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<NearbyDestinationDto> destinations = mapService.searchDestinationsForMap(
                    keyword, contenttypeid, limit);
            
            response.put("status", "success");
            response.put("data", destinations);
            response.put("totalCount", destinations.size());
            response.put("keyword", keyword);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}