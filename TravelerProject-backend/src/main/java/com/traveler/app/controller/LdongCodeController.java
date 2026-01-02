package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.entity.LdongRegnCode;
import com.traveler.app.entity.LdongSignguCode;
import com.traveler.app.service.LdongCodeService;

/**
 * 법정동 코드 API 컨트롤러
 * 법정동 코드 조회 및 동기화 기능 제공
 * 
 * 수정: 시군구 조회 API에 PathVariable 방식 추가
 */
@RestController
@RequestMapping("/api/ldong")
public class LdongCodeController {

    private final LdongCodeService ldongCodeService;

    public LdongCodeController(LdongCodeService ldongCodeService) {
        this.ldongCodeService = ldongCodeService;
    }
    
    /**
     * API 응답 원본 확인 (디버그용)
     * 호출 URL: GET /api/ldong/test-api
     */
    @GetMapping("/test-api")
    public Map<String, Object> testApi() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var regnCodes = ldongCodeService.fetchRegnCodesForTest();
            response.put("status", "success");
            response.put("data", regnCodes);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 법정동 코드 동기화 (API → DB 저장)
     * 호출 URL: GET /api/ldong/sync
     */
    @GetMapping("/sync")
    public Map<String, Object> syncLdongCodes() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = ldongCodeService.syncAllLdongCodes();
            response.put("status", "success");
            response.put("message", "법정동 코드 동기화 완료");
            response.put("totalCount", count);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", "동기화 실패: " + e.getMessage());
        }
        
        return response;
    }

    /**
     * 시도 코드 목록 조회
     * 호출 URL: GET /api/ldong/regn
     */
    @GetMapping("/regn")
    public Map<String, Object> getRegnCodes() {
        Map<String, Object> response = new HashMap<>();
        
        List<LdongRegnCode> list = ldongCodeService.getAllRegnCodes();
        response.put("status", "success");
        response.put("count", list.size());
        response.put("data", list);
        
        return response;
    }

    /**
     * 시군구 코드 목록 조회 (PathVariable 방식) - 프론트엔드 호환용
     * 호출 URL: GET /api/ldong/signgu/11
     */
    @GetMapping("/signgu/{regnCd}")
    public Map<String, Object> getSignguCodesByPath(@PathVariable("regnCd") String regnCd) {
        Map<String, Object> response = new HashMap<>();
        
        List<LdongSignguCode> list = ldongCodeService.getSignguCodesByRegnCd(regnCd);
        response.put("status", "success");
        response.put("regnCd", regnCd);
        response.put("count", list.size());
        response.put("data", list);
        
        return response;
    }

    /**
     * 시군구 코드 목록 조회 (RequestParam 방식) - 기존 호환용
     * 호출 URL: GET /api/ldong/signgu?regnCd=11
     */
    @GetMapping("/signgu")
    public Map<String, Object> getSignguCodes(@RequestParam("regnCd") String regnCd) {
        Map<String, Object> response = new HashMap<>();
        
        List<LdongSignguCode> list = ldongCodeService.getSignguCodesByRegnCd(regnCd);
        response.put("status", "success");
        response.put("regnCd", regnCd);
        response.put("count", list.size());
        response.put("data", list);
        
        return response;
    }

    /**
     * 저장된 코드 현황 조회
     * 호출 URL: GET /api/ldong/status
     */
    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "success");
        response.put("regnCodeCount", ldongCodeService.getRegnCodeCount());
        response.put("signguCodeCount", ldongCodeService.getSignguCodeCount());
        
        return response;
    }
}
