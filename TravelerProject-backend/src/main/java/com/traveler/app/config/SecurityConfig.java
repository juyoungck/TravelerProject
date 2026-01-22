package com.traveler.app.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * SecurityConfig
 * Spring Security 설정 클래스
 * 
 * - CORS 설정 (프론트엔드 연동)
 * - CSRF 비활성화 (REST API)
 * - 세션 비활성화 (JWT 사용)
 * - 비밀번호 암호화 설정
 * 
 * @author TravelerProject
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * 비밀번호 암호화 Bean
     * BCrypt 알고리즘 사용 (강력한 단방향 암호화)
     * 
     * @return PasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * Security Filter Chain 설정
     * 
     * @param http HttpSecurity
     * @return SecurityFilterChain
     * @throws Exception 예외
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF 비활성화 (REST API는 CSRF 공격에 덜 취약)
            .csrf(csrf -> csrf.disable())
            
            // 세션 비활성화 (JWT 사용하므로 서버 세션 불필요)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 요청별 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 인증 없이 접근 가능한 API
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/destination/**").permitAll()
                .requestMatchers("/api/ldong/**").permitAll()
                .requestMatchers("/api/test/**").permitAll()
                
                // 정적 리소스
                .requestMatchers("/thumbnails/**").permitAll()
                
                // 그 외 요청은 인증 필요
                .anyRequest().permitAll()  // 개발 중에는 모두 허용
                // .anyRequest().authenticated()  // 운영 시 주석 해제
            );
        
        return http.build();
    }
    
    /**
     * CORS 설정
     * 프론트엔드({baseUrl}:5173)에서의 요청을 허용
     * 
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 Origin (프론트엔드 주소)
        configuration.setAllowedOrigins(Arrays.asList(
            baseUrl + ":5173",    // Vite 개발 서버
            baseUrl + ":3000",    // 대체 포트
            "http://127.0.0.1:5173"
        ));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 자격 증명 허용 (쿠키, Authorization 헤더 등)
        configuration.setAllowCredentials(true);
        
        // 노출할 헤더 (프론트엔드에서 접근 가능한 응답 헤더)
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));
        
        // preflight 요청 캐시 시간 (초)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
