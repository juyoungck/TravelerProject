/**
 * WebConfig.java
 * 웹 관련 설정 클래스
 * 
 * @description CORS 설정, 인터셉터 등록 등
 */
package com.traveler.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    // 업로드 경로 (application.properties에서 설정)
    @Value("${file.upload.path:./uploads/}")
    private String uploadPath;
    
    /**
     * CORS 설정
     * 프론트엔드(React)에서 백엔드로 API 요청을 허용
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 허용할 프론트엔드 주소
                .allowedOriginPatterns(
                        "http://localhost:3000",    // React 개발 서버
                        "http://localhost:5173",    // Vite 개발 서버
                        "http://localhost:5174",     // Vite 추가 포트
                        "http://3.35.195.153:3000",
                        "http://3.35.195.153:5173",
                        "http://3.35.195.153:5174",
                        "http://3.35.195.153"
                )
                // 허용할 HTTP 메서드
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                // 허용할 헤더
                .allowedHeaders("*")
                // 노출할 헤더 (클라이언트에서 접근 가능하게)
                .exposedHeaders("Authorization")
                // 자격 증명 허용 (쿠키, 인증 헤더 등)
                .allowCredentials(true)
                // preflight 요청 캐시 시간 (1시간)
                .maxAge(3600);
    }
    
    /**
     * 정적 리소스 핸들러 등록
     * /uploads/** URL로 접근하면 실제 파일 시스템의 uploads 폴더에서 파일을 찾음
     * 예: http://localhost:8080/uploads/board/image.jpg
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath);
    }
}