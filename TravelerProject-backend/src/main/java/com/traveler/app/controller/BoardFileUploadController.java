package com.traveler.app.controller;

import com.traveler.app.service.BoardFileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * FileUploadController.java
 * 파일 업로드 REST API 컨트롤러
 * 
 * 엔드포인트:
 * - POST /api/upload/board : 게시판 이미지 업로드 (TOAST UI용)
 */
@RestController
@RequestMapping("/api/upload")
public class BoardFileUploadController {
    
    @Autowired
    private BoardFileUploadService fileUploadService;
    
    /**
     * 게시판 이미지 업로드 (TOAST UI Editor 전용)
     * POST /api/upload/board
     * 
     * TOAST UI Editor의 이미지 업로드 훅에서 호출
     * 응답 형식이 TOAST UI가 요구하는 형식에 맞춰져 있음
     * 
     * @param file 업로드할 이미지 파일
     * @return TOAST UI 형식의 응답 (url 필드 필수)
     */
    @PostMapping("/board")
    public ResponseEntity<Map<String, Object>> uploadBoardImage(
            @RequestParam("file") MultipartFile file) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // "board" 폴더에 저장
            String imageUrl = fileUploadService.uploadImage(file, "board");
            
            // TOAST UI Editor가 요구하는 응답 형식
            response.put("success", true);
            response.put("url", imageUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "파일 저장 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 리뷰 이미지 업로드
     * POST /api/upload/review
     */
    @PostMapping("/review")
    public ResponseEntity<Map<String, Object>> uploadReviewImage(
            @RequestParam("file") MultipartFile file) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // "review" 폴더에 저장
            String imageUrl = fileUploadService.uploadImage(file, "review");
            
            response.put("success", true);
            response.put("url", imageUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "파일 저장 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
