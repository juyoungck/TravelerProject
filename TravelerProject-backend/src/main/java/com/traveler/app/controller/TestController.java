package com.traveler.app.controller;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * DB 연결 테스트용 컨트롤러
 * 테스트 완료 후 삭제해도 됩니다.
 */
@RestController
public class TestController {

    @Autowired
    private DataSource dataSource;

    /**
     * 서버 동작 확인용 API
     * 접속 URL: http://{baseUrl}:8080/test
     */
    @GetMapping("/test")
    public Map<String, String> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "서버가 정상 동작합니다!");
        response.put("status", "success");
        return response;
    }

    /**
     * Oracle DB 연결 테스트 API
     * 접속 URL: http://{baseUrl}:8080/test/db
     */
    @GetMapping("/test/db")
    public Map<String, String> testDbConnection() {
        Map<String, String> response = new HashMap<>();
        
        try {
            // DB 연결 시도
            dataSource.getConnection().close();
            response.put("message", "Oracle DB 연결 성공!");
            response.put("status", "success");
        } catch (Exception e) {
            response.put("message", "Oracle DB 연결 실패: " + e.getMessage());
            response.put("status", "fail");
        }
        
        return response;
    }
}