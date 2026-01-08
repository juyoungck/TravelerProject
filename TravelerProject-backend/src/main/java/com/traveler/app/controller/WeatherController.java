package com.traveler.app.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.traveler.app.service.WeatherService;

/**
 * 날씨 API 컨트롤러
 * 위경도로 현재 날씨 조회
 */
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    /**
     * 날씨 조회
     * URL: GET /api/weather?lat=37.5665&lon=126.9780
     * 
     * @param lat 위도
     * @param lon 경도
     * @return 날씨 정보 (기온, 기상상황)
     */
    @GetMapping
    public Map<String, Object> getWeather(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon) {
        return weatherService.getWeather(lat, lon);
    }
}