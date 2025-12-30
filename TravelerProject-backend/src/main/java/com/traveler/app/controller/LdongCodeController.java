package com.traveler.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
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
}