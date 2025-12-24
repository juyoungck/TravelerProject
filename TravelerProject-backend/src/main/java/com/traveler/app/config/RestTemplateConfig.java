package com.traveler.app.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * RestTemplate 설정 클래스
 * 외부 API 호출을 위한 HTTP 클라이언트 설정
 */
@Configuration
public class RestTemplateConfig {
    
    /**
     * RestTemplate 빈 생성
     * - 연결 타임아웃: 10초
     * - 읽기 타임아웃: 30초
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(30));
        
        return new RestTemplate(factory);
    }
    
    /**
     * ObjectMapper 빈 생성
     * JSON 파싱용
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}