package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.entity.Destination;
import com.traveler.app.service.DestinationService;

/**
 * 여행지 API 컨트롤러
 * 여행지 조회 및 동기화 기능 제공
 */
@RestController
@RequestMapping("/api/destination")
public class DestinationController {

	private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }
   
    /**
     * 여행지 목록 조회 (관광타입별, 페이징)
     * URL: GET /api/destination/list/{contenttypeid}?page=1&size=10
     */
    @GetMapping("/list/{contenttypeid}")
    public Map<String, Object> getDestinationsByType(
            @PathVariable("contenttypeid") String contenttypeid,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> result = destinationService.getDestinationsWithPaging(contenttypeid, page, size);
            
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
}