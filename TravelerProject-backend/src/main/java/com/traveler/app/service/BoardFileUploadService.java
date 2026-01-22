package com.traveler.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * FileUploadService.java
 * 게시판 이미지 업로드 처리 서비스
 */
@Service
public class BoardFileUploadService {
    
    // application.properties에서 설정값 읽기
    @Value("${file.upload.path:./uploads/}")
    private String uploadPath;
    
    // 서버 URL (이미지 접근용)
    @Value("${app.base-url}:8080")
    private String serverUrl;
    
    // 허용되는 이미지 확장자
    private static final String[] ALLOWED_EXTENSIONS = {
        "jpg", "jpeg", "png", "gif", "webp"
    };
    
    // 최대 파일 크기 (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    /**
     * 이미지 파일 업로드
     * @param file 업로드할 파일
     * @param subFolder 하위 폴더명 (예: "board")
     * @return 업로드된 이미지 URL
     */
    public String uploadImage(MultipartFile file, String subFolder) throws IOException {
        // 1. 파일 유효성 검사
        validateFile(file);
        
        // 2. 저장 디렉토리 생성
        String savePath = uploadPath + subFolder + "/";
        File directory = new File(savePath);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        // 3. 고유한 파일명 생성 (UUID + 원본 확장자)
        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + "." + extension;
        
        // 4. 파일 저장
        Path filePath = Paths.get(savePath + newFilename);
        Files.write(filePath, file.getBytes());
        
        // 5. 접근 가능한 URL 반환
        return serverUrl + "/uploads/" + subFolder + "/" + newFilename;
    }
    
    /**
     * 파일 유효성 검사
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }
        
        String extension = getExtension(file.getOriginalFilename());
        if (!isAllowedExtension(extension)) {
            throw new IllegalArgumentException(
                "허용되지 않는 파일 형식입니다. (허용: jpg, jpeg, png, gif, webp)"
            );
        }
    }
    
    /**
     * 파일 확장자 추출
     */
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
    
    /**
     * 허용된 확장자인지 확인
     */
    private boolean isAllowedExtension(String extension) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equals(extension)) {
                return true;
            }
        }
        return false;
    }
}
