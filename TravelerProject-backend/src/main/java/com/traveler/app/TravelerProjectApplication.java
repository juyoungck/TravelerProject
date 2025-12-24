package com.traveler.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 여행 플래너 애플리케이션 메인 클래스
 */
@SpringBootApplication
@ConfigurationPropertiesScan  // @ConfigurationProperties 자동 스캔
@EnableScheduling             // 스케줄러 활성화
public class TravelerProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelerProjectApplication.class, args);
    }
}