package com.traveler.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.dto.PlannerDetailDto;
import com.traveler.app.dto.PlannerRequestDto;
import com.traveler.app.service.PlannerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 플래너 Controller
 * - 플래너 관련 REST API 엔드포인트
 * - 요청/응답 처리
 */
@Slf4j
@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class PlannerController {

    private final PlannerService plannerService;

    /**
     * 플래너 생성
     * POST /api/planner
     * 
     * @param requestDto 플래너 생성 요청 데이터
     * @return 생성된 플래너 상세 정보
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPlanner(@RequestBody PlannerRequestDto requestDto) {
        log.info("플래너 생성 요청: {}", requestDto.getPlnTitle());
        
        Map<String, Object> response = new HashMap<>();
        try {
            PlannerDetailDto planner = plannerService.createPlanner(requestDto);
            response.put("status", "success");
            response.put("data", planner);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("플래너 생성 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 플래너 수정 (저장)
     * PUT /api/planner/{plnId}
     * 
     * @param plnId 플래너 ID
     * @param requestDto 플래너 수정 요청 데이터
     * @return 수정된 플래너 상세 정보
     */
    @PutMapping("/{plnId}")
    public ResponseEntity<Map<String, Object>> updatePlanner(
            @PathVariable("plnId") Long plnId,
            @RequestBody PlannerRequestDto requestDto) {
        log.info("플래너 수정 요청: plnId={}", plnId);
        
        Map<String, Object> response = new HashMap<>();
        try {
            PlannerDetailDto planner = plannerService.updatePlanner(plnId, requestDto);
            response.put("status", "success");
            response.put("data", planner);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("플래너 수정 실패 - 잘못된 요청", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            log.error("플래너 수정 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 플래너 삭제
     * DELETE /api/planner/{plnId}
     * 
     * @param plnId 플래너 ID
     * @return 삭제 결과
     */
    @DeleteMapping("/{plnId}")
    public ResponseEntity<Map<String, Object>> deletePlanner(@PathVariable("plnId") Long plnId) {
        log.info("플래너 삭제 요청: plnId={}", plnId);
        
        Map<String, Object> response = new HashMap<>();
        try {
            plannerService.deletePlanner(plnId);
            response.put("status", "success");
            response.put("message", "플래너가 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("플래너 삭제 실패 - 잘못된 요청", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            log.error("플래너 삭제 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 플래너 상세 조회
     * GET /api/planner/{plnId}
     * 
     * @param plnId 플래너 ID
     * @return 플래너 상세 정보
     */
    @GetMapping("/{plnId}")
    public ResponseEntity<Map<String, Object>> getPlannerDetail(@PathVariable("plnId") Long plnId) {
        log.info("플래너 상세 조회 요청: plnId={}", plnId);
        
        Map<String, Object> response = new HashMap<>();
        try {
            PlannerDetailDto planner = plannerService.getPlannerDetail(plnId);
            response.put("status", "success");
            response.put("data", planner);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("플래너 조회 실패 - 존재하지 않음", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            log.error("플래너 조회 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 내 플래너 목록 조회
     * GET /api/planner/my?mId=1&page=1&size=10
     * 
     * @param mId 회원 ID (JWT 구현 전까지 임시로 쿼리 파라미터로 받음)
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 10)
     * @return 플래너 목록과 페이징 정보
     */
    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyPlannerList(
            @RequestParam(name = "mId") Long mId,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        log.info("내 플래너 목록 조회 요청: mId={}, page={}, size={}", mId, page, size);
        
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = plannerService.getMyPlannerList(mId, page, size);
            response.put("status", "success");
            response.putAll(result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("내 플래너 목록 조회 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 인기 플래너 목록 조회
     * GET /api/planner/popular?page=1&size=10
     * 
     * @param page 페이지 번호 (기본값: 1)
     * @param size 페이지 크기 (기본값: 10)
     * @return 플래너 목록과 페이징 정보
     */
    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> getPopularPlannerList(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        log.info("인기 플래너 목록 조회 요청: page={}, size={}", page, size);
        
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = plannerService.getPopularPlannerList(page, size);
            response.put("status", "success");
            response.putAll(result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("인기 플래너 목록 조회 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 공유 링크 생성
     * POST /api/planner/{plnId}/share
     * 
     * @param plnId 플래너 ID
     * @return 생성된 공유 링크
     */
    @PostMapping("/{plnId}/share")
    public ResponseEntity<Map<String, Object>> createShareLink(@PathVariable("plnId") Long plnId) {
        log.info("공유 링크 생성 요청: plnId={}", plnId);
        
        Map<String, Object> response = new HashMap<>();
        try {
            String shareLink = plannerService.createShareLink(plnId);
            response.put("status", "success");
            response.put("shareLink", shareLink);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("공유 링크 생성 실패 - 잘못된 요청", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            log.error("공유 링크 생성 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * 공유 링크로 플래너 조회
     * GET /api/planner/share/{shareLink}
     * 
     * @param shareLink 공유 링크
     * @return 플래너 상세 정보
     */
    @GetMapping("/share/{shareLink}")
    public ResponseEntity<Map<String, Object>> getPlannerByShareLink(@PathVariable("shareLink") String shareLink) {
        log.info("공유 링크로 플래너 조회 요청: shareLink={}", shareLink);
        
        Map<String, Object> response = new HashMap<>();
        try {
            PlannerDetailDto planner = plannerService.getPlannerByShareLink(shareLink);
            response.put("status", "success");
            response.put("data", planner);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("공유 링크 조회 실패 - 유효하지 않은 링크", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            log.error("공유 링크 조회 실패", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
