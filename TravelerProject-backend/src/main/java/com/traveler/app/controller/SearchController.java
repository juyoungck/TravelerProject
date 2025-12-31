package com.traveler.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.service.SearchService;

/**
 * 통합 검색 API 컨트롤러
 * 여행지, 플래너 검색
 */
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * 통합 검색 (여행지 + 플래너)
     * URL: GET /api/search?keyword=경복궁&page=1&size=10
     */
    @GetMapping
    public Map<String, Object> search(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> result = searchService.search(keyword, page, size);
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
     * 여행지만 검색
     * URL: GET /api/search/destination?keyword=경복궁&page=1&size=10
     */
    @GetMapping("/destination")
    public Map<String, Object> searchDestination(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> result = searchService.searchDestinations(keyword, page, size);
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
     * 플래너만 검색
     * URL: GET /api/search/planner?keyword=제주여행&page=1&size=10
     */
    @GetMapping("/planner")
    public Map<String, Object> searchPlanner(
            @RequestParam("keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> result = searchService.searchPlanners(keyword, page, size);
            response.put("status", "success");
            response.put("keyword", keyword);
            response.putAll(result);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }

        return response;
    }
}