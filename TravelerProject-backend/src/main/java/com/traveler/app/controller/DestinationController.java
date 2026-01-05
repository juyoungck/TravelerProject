package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.traveler.app.entity.Destination;
import com.traveler.app.entity.DestinationImage;
import com.traveler.app.scheduler.DestinationScheduler;
import com.traveler.app.service.DestinationService;

import lombok.extern.slf4j.Slf4j;  


/**
 * 여행지 API 컨트롤러
 * 여행지 조회 및 동기화 기능 제공
 * * 수정: 전체 조회(/list)와 타입별 조회(/list/{id}) 통합 지원
 * * 수정: 정렬 옵션(sort) 추가 (latest, popular)
 */
@Slf4j 
@RestController
@RequestMapping("/api/destination")
public class DestinationController {

    private final DestinationService destinationService;
    private final DestinationScheduler destinationScheduler;

    public DestinationController(DestinationService destinationService, DestinationScheduler destinationScheduler) {
        this.destinationService = destinationService;
        this.destinationScheduler = destinationScheduler;
    }

    /**
     * 여행지 현황 조회
     * URL: GET /api/destination/status
     */
    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "success");
        response.put("data", destinationService.getDestinationStatus());
        
        return response;
    }

    /**
     * 관광타입 목록 조회
     * URL: GET /api/destination/types
     */
    @GetMapping("/types")
    public Map<String, Object> getContentTypes() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "success");
        response.put("data", destinationService.getContentTypes());
        
        return response;
    }

    // ============================================
    // 지역 코드 조회 API
    // ============================================

    /**
     * 시도 목록 조회
     * URL: GET /api/destination/regions
     */
    @GetMapping("/regions")
    public Map<String, Object> getRegions() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> regions = destinationService.getRegions();
            
            response.put("status", "success");
            response.put("data", regions);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "시도 목록 조회 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 시군구 목록 조회 (시도 코드로)
     * URL: GET /api/destination/regions/{lDongRegnCd}/signgu
     */
    @GetMapping("/regions/{lDongRegnCd}/signgu")
    public Map<String, Object> getSignguList(@PathVariable("lDongRegnCd") String lDongRegnCd) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> signguList = destinationService.getSignguList(lDongRegnCd);
            
            response.put("status", "success");
            response.put("data", signguList);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "시군구 목록 조회 실패: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * 관광타입별 API 총 데이터 개수 조회
     * URL: GET /api/destination/total-count/{contenttypeid}
     */
    @GetMapping("/total-count/{contenttypeid}")
    public Map<String, Object> getTotalCount(@PathVariable("contenttypeid") String contenttypeid) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int totalCount = destinationService.getApiTotalCount(contenttypeid);
            int totalPages = (int) Math.ceil(totalCount / 100.0);
            
            response.put("status", "success");
            response.put("contenttypeid", contenttypeid);
            response.put("totalCount", totalCount);
            response.put("totalPages", totalPages);
            response.put("recommendedUrl", "/api/destination/sync/" + contenttypeid + "?startPage=1&endPage=" + totalPages);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 특정 관광타입 여행지 동기화
     * URL: GET /api/destination/sync/{contenttypeid}?startPage=1&endPage=10
     */
    @GetMapping("/sync/{contenttypeid}")
    public Map<String, Object> syncByType(
            @PathVariable("contenttypeid") String contenttypeid,
            @RequestParam(value = "startPage", defaultValue = "1") int startPage,
            @RequestParam(value = "endPage", defaultValue = "10") int endPage) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
           int count = destinationService.syncDestinationsByType(contenttypeid, startPage, endPage);
            response.put("status", "success");
            response.put("message", "여행지 동기화 완료");
            response.put("contenttypeid", contenttypeid);
            response.put("startPage", startPage);
            response.put("endPage", endPage);
            response.put("savedCount", count);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "동기화 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 전체 관광타입 여행지 동기화
     * URL: GET /api/destination/sync-all?maxCountPerType=100
     */
    @GetMapping("/sync-all")
    public Map<String, Object> syncAll(
            @RequestParam(value = "maxCountPerType", defaultValue = "50") int maxCountPerType) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Integer> result = destinationService.syncAllDestinations(maxCountPerType);
            response.put("status", "success");
            response.put("message", "전체 여행지 동기화 완료");
            response.put("result", result);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "동기화 실패: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * 변경 데이터 동기화 (수동 실행)
     * URL: GET /api/destination/sync-modified
     */
    @GetMapping("/sync-modified")
    public Map<String, Object> syncModified() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = destinationService.syncModifiedDestinations();
            response.put("status", "success");
            response.put("message", "변경 데이터 동기화 완료");
            response.put("updatedCount", count);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "동기화 실패: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * 스케줄러 수동 실행 (테스트용)
     * URL: GET /api/destination/scheduler/run
     */
    @GetMapping("/scheduler/run")
    public Map<String, Object> runScheduler() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "success");
        response.put("message", "스케줄러가 백그라운드에서 실행됩니다. 콘솔 로그를 확인하세요.");
        
        // 비동기로 실행 (응답 먼저 반환)
        new Thread(() -> {
            destinationScheduler.manualUpdate();
        }).start();
        
        return response;
    }
    
    /**
     * 특정 날짜 기준 변경 데이터 동기화 (테스트용)
     * URL: GET /api/destination/sync-modified-test?date=20241224
     */
    @GetMapping("/sync-modified-test")
    public Map<String, Object> syncModifiedTest(
            @RequestParam(value = "date") String date) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = destinationService.syncModifiedDestinationsByDate(date);
            
            response.put("status", "success");
            response.put("message", "변경 데이터 동기화 완료");
            response.put("date", date);
            response.put("updatedCount", count);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "동기화 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 여행지 목록 조회 (관광타입별, 페이징, 지역 필터, 정렬 지원)
     * URL 1: GET /api/destination/list (전체 조회)
     * URL 2: GET /api/destination/list/{contenttypeid} (타입별 조회)
     * * @param contenttypeid 관광타입 ID (선택, 없으면 전체)
     * @param page 페이지 번호 (1부터 시작)
     * @param size 페이지 크기
     * @param sort 정렬 기준 (latest: 최신순, popular: 인기순) - 추가됨
     * @param lDongRegnCd 법정동 시도 코드 (선택)
     * @param lDongSignguCd 법정동 시군구 코드 (선택)
     */
    @GetMapping({"/list", "/list/{contenttypeid}"})
    public Map<String, Object> getDestinationsByType(
            @PathVariable(value = "contenttypeid", required = false) String contenttypeid,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "latest") String sort, // ✅ 정렬 파라미터 추가
            @RequestParam(value = "lDongRegnCd", required = false) String lDongRegnCd,
            @RequestParam(value = "lDongSignguCd", required = false) String lDongSignguCd) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> result;
            
            // 지역 필터가 있으면 지역별 조회
            if (lDongRegnCd != null && !lDongRegnCd.isEmpty()) {
                // Service 메서드에 sort 파라미터 전달
                result = destinationService.getDestinationsWithPagingAndRegion(
                    contenttypeid, page, size, sort, lDongRegnCd, lDongSignguCd);
            } else {
                // 지역 필터 없으면 전체 조회
                // Service 메서드에 sort 파라미터 전달
                result = destinationService.getDestinationsWithPaging(contenttypeid, page, size, sort);
            }
            
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
     * 여행지 검색 (키워드 + 지역 필터 지원)
     * URL: GET /api/destination/search?keyword=서울&page=1&size=10&lDongRegnCd=11
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
            Map<String, Object> result;
            
            // 지역 필터가 있으면 지역별 검색
            if (lDongRegnCd != null && !lDongRegnCd.isEmpty()) {
                result = destinationService.searchDestinationsWithRegion(
                    keyword, page, size, lDongRegnCd, lDongSignguCd);
            } else {
                // 지역 필터 없으면 전체 검색
                result = destinationService.searchDestinations(keyword, page, size);
            }
            
            response.put("status", "success");
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
     * 조회수 증가
     * URL: PUT /api/destination/{contentid}/view
     */
    @PutMapping("/{contentid}/view")
    public Map<String, Object> increaseViewCount(@PathVariable("contentid") String contentid) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            destinationService.increaseViewCount(contentid);
            Destination destination = destinationService.getDestinationById(contentid);
            
            response.put("status", "success");
            response.put("message", "조회수가 증가했습니다.");
            response.put("viewCount", destination != null ? destination.getViewCount() : 0);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
    
    /**
     * 여행지 이미지 목록 조회
     * URL: GET /api/destination/detail/{contentid}/images
     */
    @GetMapping("/detail/{contentid}/images")
    public Map<String, Object> getDestinationImages(@PathVariable("contentid") String contentid) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<DestinationImage> images = destinationService.getImagesByContentId(contentid);
            
            response.put("status", "success");
            response.put("data", images);
            response.put("totalCount", images.size());
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
    
    /**
     * 상세정보 수집 (overview, homepage)
     * URL: GET /api/destination/sync-detail?startIndex=1&endIndex=1000
     */
    @GetMapping("/sync-detail")
    public Map<String, Object> syncDetail(
            @RequestParam(value = "startIndex", defaultValue = "1") int startIndex,
            @RequestParam(value = "endIndex", defaultValue = "1000") int endIndex) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = destinationService.syncDestinationDetails(startIndex, endIndex);
            
            response.put("status", "success");
            response.put("message", "상세정보 수집 완료");
            response.put("startIndex", startIndex);
            response.put("endIndex", endIndex);
            response.put("savedCount", count);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "수집 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 이미지 목록 수집
     * URL: GET /api/destination/sync-image?startIndex=1&endIndex=1000
     */
    @GetMapping("/sync-image")
    public Map<String, Object> syncImage(
            @RequestParam(value = "startIndex", defaultValue = "1") int startIndex,
            @RequestParam(value = "endIndex", defaultValue = "1000") int endIndex) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = destinationService.syncDestinationImages(startIndex, endIndex);
            int totalImages = destinationService.getImageCount();
            
            response.put("status", "success");
            response.put("message", "이미지 수집 완료");
            response.put("startIndex", startIndex);
            response.put("endIndex", endIndex);
            response.put("processedCount", count);
            response.put("totalImages", totalImages);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "수집 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 상세정보/이미지 수집 현황
     * URL: GET /api/destination/detail-status
     */
    @GetMapping("/detail-status")
    public Map<String, Object> getDetailStatus() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "success");
        response.put("withoutDetail", destinationService.countDestinationsWithoutDetail());
        response.put("totalImages", destinationService.getImageCount());
        
        return response;
    }
    
    /**
     * 썸네일 다운로드
     * URL: GET /api/destination/download-thumbnail?startIndex=1&endIndex=1000
     */
    @GetMapping("/download-thumbnail")
    public Map<String, Object> downloadThumbnail(
            @RequestParam(value = "startIndex", defaultValue = "1") int startIndex,
            @RequestParam(value = "endIndex", defaultValue = "1000") int endIndex) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = destinationService.downloadThumbnails(startIndex, endIndex);
            
            response.put("status", "success");
            response.put("message", "썸네일 다운로드 완료");
            response.put("startIndex", startIndex);
            response.put("endIndex", endIndex);
            response.put("downloadedCount", count);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "다운로드 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 썸네일 다운로드 현황
     * URL: GET /api/destination/thumbnail-status
     */
    @GetMapping("/thumbnail-status")
    public Map<String, Object> getThumbnailStatus() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "success");
        response.put("data", destinationService.getThumbnailStatus());
        
        return response;
    }
    
    /**
     * 이미지가 있는 여행지 중 랜덤 N개 조회
     * GET /api/destination/random?size=4
     */
    @GetMapping("/random")
    public ResponseEntity<Map<String, Object>> getRandomDestinations(
            @RequestParam(value = "size", defaultValue = "4") int size) {
        
        log.info("랜덤 여행지 조회: size={}", size);
        
        Map<String, Object> response = new HashMap<>();
        try {
            List<Destination> destinations = destinationService.getRandomDestinationsWithImage(size);
            
            response.put("status", "success");
            response.put("data", destinations);
            response.put("count", destinations.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("랜덤 여행지 조회 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
