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
 */
@RestController
@RequestMapping("/api/ldong")
public class LdongCodeController {

    private final LdongCodeService ldongCodeService;

    public LdongCodeController(LdongCodeService ldongCodeService) {
        this.ldongCodeService = ldongCodeService;
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

    /**
     * 시도 목록 조회
     * 호출 URL: GET /api/ldong/regn
     */
    @GetMapping("/regn")
    public Map<String, Object> getRegnCodes() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<LdongRegnCode> list = ldongCodeService.getAllRegnCodes();
            response.put("status", "success");
            response.put("data", list);
            response.put("count", list.size());
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * 특정 시도의 시군구 목록 조회
     * 호출 URL: GET /api/ldong/signgu/{lDongRegnCd}
     */
    @GetMapping("/signgu/{lDongRegnCd}")
    public Map<String, Object> getSignguCodes(@PathVariable("lDongRegnCd") String lDongRegnCd) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<LdongSignguCode> list = ldongCodeService.getSignguCodesByRegnCd(lDongRegnCd);
            response.put("status", "success");
            response.put("data", list);
            response.put("count", list.size());
            response.put("lDongRegnCd", lDongRegnCd);
        } catch (Exception e) {
            response.put("status", "fail");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
}
