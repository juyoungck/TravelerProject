package com.traveler.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

/**
 * 한국관광공사 TourAPI 설정 클래스
 * application.properties의 tourapi.* 설정값을 자동으로 매핑
 */
@Configuration
@ConfigurationProperties(prefix = "tourapi")
@Getter
@Setter
public class TourApiConfig {
    
    /** API 서비스 키 */
    private String serviceKey;
    
    /** API 기본 URL */
    private String baseUrl;
    
    /** 모바일 OS 구분 */
    private String mobileOs;
    
    /** 앱 이름 */
    private String mobileApp;
}