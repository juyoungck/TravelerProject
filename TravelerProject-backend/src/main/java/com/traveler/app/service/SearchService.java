package com.traveler.app.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.traveler.app.dao.SearchDao;

import lombok.extern.slf4j.Slf4j;

/**
 * 통합 검색 서비스
 * 여행지, 플래너 검색 로직
 */
@Service
@Slf4j
public class SearchService {
    
    private final SearchDao searchDao;
    
    public SearchService(SearchDao searchDao) {
        this.searchDao = searchDao;
    }
    
    /**
     * 통합 검색 (여행지 + 플래너 합쳐서 페이징)
     * 여행지 먼저 → 플래너 뒤에 정렬
     */
    public Map<String, Object> searchAll(String keyword, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        int offset = (page - 1) * size;
        
        // 통합 검색 결과 조회
        List<Map<String, Object>> list = searchDao.searchAll(keyword, offset, size);
        
        // 통합 검색 결과 개수
        int totalCount = searchDao.countSearchAll(keyword);
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        result.put("data", list);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
    
    /**
     * 기존 통합 검색 (여행지 + 플래너 따로)
     * @deprecated searchAll 사용 권장
     */
    public Map<String, Object> search(String keyword, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        
        // 여행지 검색
        Map<String, Object> destinations = searchDestinations(keyword, page, size);
        
        // 플래너 검색
        Map<String, Object> planners = searchPlanners(keyword, page, size);
        
        result.put("destinations", destinations);
        result.put("planners", planners);
        
        return result;
    }
    
    /**
     * 여행지 검색 (제목만)
     */
    public Map<String, Object> searchDestinations(String keyword, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        int offset = (page - 1) * size;
        
        // 검색 결과 조회
        List<Map<String, Object>> list = searchDao.searchDestinations(keyword, offset, size);
        
        // 검색 결과 개수
        int totalCount = searchDao.countSearchDestinations(keyword);
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        result.put("data", list);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
    
    /**
     * 플래너 검색 (제목만)
     */
    public Map<String, Object> searchPlanners(String keyword, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        int offset = (page - 1) * size;
        
        // 검색 결과 조회
        List<Map<String, Object>> list = searchDao.searchPlanners(keyword, offset, size);
        
        // 검색 결과 개수
        int totalCount = searchDao.countSearchPlanners(keyword);
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        result.put("data", list);
        result.put("currentPage", page);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        result.put("pageSize", size);
        
        return result;
    }
}