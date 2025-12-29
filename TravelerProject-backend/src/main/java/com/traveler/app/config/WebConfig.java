/**
 * WebConfig.java
 * 웹 관련 설정 클래스
 * 
 * @description CORS 설정, 인터셉터 등록 등
 */
package com.traveler.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    /**
     * CORS 설정
     * 프론트엔드(React)에서 백엔드로 API 요청을 허용
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 허용할 프론트엔드 주소
                .allowedOrigins(
                        "http://localhost:3000",    // React 개발 서버
                        "http://localhost:5173",    // Vite 개발 서버
                        "http://localhost:5174"     // Vite 추가 포트
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
}
