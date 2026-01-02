package com.traveler.app.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.traveler.app.util.GridConverter;

import lombok.extern.slf4j.Slf4j;

/**
 * 날씨 서비스
 * 초단기실황 (기온) + 초단기예보 (하늘상태) API 호출
 * 
 * 수정: 5분 캐시 + 중복 호출 방지 + 에러 처리 강화
 */
@Service
@Slf4j
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;
    
    private static final String NCST_URL = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
    private static final String FCST_URL = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";
    
    /** 캐시 유효 시간: 5분 (밀리초) */
    private static final long CACHE_DURATION = 5 * 60 * 1000;
    
    /** 위치 동일 판정 거리 (km) */
    private static final double SAME_LOCATION_THRESHOLD = 1.0;
    
    /** 캐시 저장소 */
    private final ConcurrentHashMap<String, CacheData> weatherCache = new ConcurrentHashMap<>();
    
    /** 요청 중인 좌표 (중복 호출 방지) */
    private final ConcurrentHashMap<String, Boolean> requestingKeys = new ConcurrentHashMap<>();

    /**
     * 캐시 데이터 클래스
     */
    private static class CacheData {
        double lat;
        double lon;
        Map<String, Object> data;
        long timestamp;
        
        CacheData(double lat, double lon, Map<String, Object> data) {
            this.lat = lat;
            this.lon = lon;
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }
        
        boolean isValid() {
            return (System.currentTimeMillis() - timestamp) < CACHE_DURATION;
        }
    }

    /**
     * 위경도로 현재 날씨 조회
     */
    public Map<String, Object> getWeather(double lat, double lon) {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 캐시 확인
        CacheData cached = findValidCache(lat, lon);
        if (cached != null) {
            log.info("날씨 캐시 사용: lat={}, lon={}", lat, lon);
            return cached.data;
        }
        
        // 2. 중복 호출 방지
        String requestKey = getGridKey(lat, lon);
        if (requestingKeys.putIfAbsent(requestKey, true) != null) {
            log.info("날씨 API 요청 중... 대기: {}", requestKey);
            result.put("status", "pending");
            result.put("message", "요청 중입니다.");
            return result;
        }

        try {
            // 3. 위경도 → 격자 변환
            int[] grid = GridConverter.toGrid(lat, lon);
            int nx = grid[0];
            int ny = grid[1];

            log.info("날씨 API 호출: lat={}, lon={} → nx={}, ny={}", lat, lon, nx, ny);

            // 4. 초단기실황 API 호출
            Map<String, String> ncstData = callNcstApi(nx, ny);
            
            // 5. 초단기예보 API 호출
            String skyCode = callFcstApi(nx, ny);

            // 6. 기온이 없으면 실패
            if (ncstData.get("temperature") == null) {
                result.put("status", "fail");
                result.put("message", "날씨 데이터를 가져올 수 없습니다.");
                return result;
            }

            // 7. 기상상황 결정
            String pty = ncstData.get("pty");
            String sky = determineSky(pty, skyCode);

            // 8. 결과 구성
            Map<String, String> weather = new HashMap<>();
            weather.put("temperature", ncstData.get("temperature"));
            weather.put("sky", sky);

            result.put("status", "success");
            result.put("weather", weather);
            
            // 9. 캐시 저장
            weatherCache.put(requestKey, new CacheData(lat, lon, result));
            
            // 오래된 캐시 정리
            cleanExpiredCache();

        } catch (Exception e) {
            log.error("날씨 조회 실패: {}", e.getMessage());
            result.put("status", "fail");
            result.put("message", e.getMessage());
        } finally {
            // 요청 완료 표시
            requestingKeys.remove(requestKey);
        }

        return result;
    }
    
    /**
     * 격자 키 생성 (nx_ny)
     */
    private String getGridKey(double lat, double lon) {
        int[] grid = GridConverter.toGrid(lat, lon);
        return grid[0] + "_" + grid[1];
    }
    
    /**
     * 유효한 캐시 찾기
     */
    private CacheData findValidCache(double lat, double lon) {
        String key = getGridKey(lat, lon);
        CacheData cached = weatherCache.get(key);
        
        if (cached != null && cached.isValid()) {
            return cached;
        }
        
        // 만료된 캐시 삭제
        if (cached != null) {
            weatherCache.remove(key);
        }
        
        return null;
    }
    
    /**
     * 만료된 캐시 정리
     */
    private void cleanExpiredCache() {
        weatherCache.entrySet().removeIf(entry -> !entry.getValue().isValid());
    }

    /**
     * 초단기실황 API 호출
     */
    private Map<String, String> callNcstApi(int nx, int ny) throws Exception {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime baseTime;
        
        if (now.getMinute() >= 40) {
            baseTime = now;
        } else {
            baseTime = now.minusHours(1);
        }

        String baseDate = baseTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTimeStr = baseTime.format(DateTimeFormatter.ofPattern("HH")) + "00";

        StringBuilder urlBuilder = new StringBuilder(NCST_URL);
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + apiKey);
        urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode("1", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode("10", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("dataType", "UTF-8") + "=" + URLEncoder.encode("JSON", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("base_date", "UTF-8") + "=" + URLEncoder.encode(baseDate, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("base_time", "UTF-8") + "=" + URLEncoder.encode(baseTimeStr, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("nx", "UTF-8") + "=" + URLEncoder.encode(String.valueOf(nx), "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("ny", "UTF-8") + "=" + URLEncoder.encode(String.valueOf(ny), "UTF-8"));

        log.info("초단기실황 API 호출: baseDate={}, baseTime={}", baseDate, baseTimeStr);

        String response = callApi(urlBuilder.toString());
        return parseNcstResponse(response);
    }

    /**
     * 초단기예보 API 호출
     */
    private String callFcstApi(int nx, int ny) throws Exception {
        LocalDateTime now = LocalDateTime.now();
        
        int minute = now.getMinute();
        LocalDateTime baseTime;
        
        if (minute >= 45) {
            baseTime = now;
        } else if (minute >= 15) {
            baseTime = now.minusHours(1);
        } else {
            baseTime = now.minusHours(2);
        }

        String baseDate = baseTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTimeStr = baseTime.format(DateTimeFormatter.ofPattern("HH")) + "30";

        StringBuilder urlBuilder = new StringBuilder(FCST_URL);
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + apiKey);
        urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode("1", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode("60", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("dataType", "UTF-8") + "=" + URLEncoder.encode("JSON", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("base_date", "UTF-8") + "=" + URLEncoder.encode(baseDate, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("base_time", "UTF-8") + "=" + URLEncoder.encode(baseTimeStr, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("nx", "UTF-8") + "=" + URLEncoder.encode(String.valueOf(nx), "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("ny", "UTF-8") + "=" + URLEncoder.encode(String.valueOf(ny), "UTF-8"));

        log.info("초단기예보 API 호출: baseDate={}, baseTime={}", baseDate, baseTimeStr);

        String response = callApi(urlBuilder.toString());
        return parseFcstResponse(response);
    }

    /**
     * HTTP API 호출
     */
    private String callApi(String urlStr) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);

        int responseCode = conn.getResponseCode();
        
        BufferedReader rd;
        if (responseCode >= 200 && responseCode <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "UTF-8"));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();

        String response = sb.toString();
        
        if (responseCode != 200) {
            log.error("API 응답 에러 - 코드: {}, 응답: {}", responseCode, 
                response.substring(0, Math.min(200, response.length())));
            throw new RuntimeException("API 호출 실패 (HTTP " + responseCode + ")");
        }
        
        if (!response.trim().startsWith("{")) {
            log.error("API 응답이 JSON이 아님: {}", response.substring(0, Math.min(200, response.length())));
            throw new RuntimeException("API 응답 형식 오류");
        }

        return response;
    }

    /**
     * 초단기실황 응답 파싱
     */
    private Map<String, String> parseNcstResponse(String response) {
        Map<String, String> data = new HashMap<>();

        try {
            JSONObject json = new JSONObject(response);
            JSONObject responseObj = json.getJSONObject("response");
            
            JSONObject header = responseObj.getJSONObject("header");
            String resultCode = header.getString("resultCode");
            
            if (!"00".equals(resultCode)) {
                String resultMsg = header.optString("resultMsg", "알 수 없는 오류");
                log.error("초단기실황 API 오류: {} - {}", resultCode, resultMsg);
                return data;
            }
            
            JSONObject body = responseObj.getJSONObject("body");
            
            if (body.isNull("items") || body.optString("items", "").isEmpty()) {
                log.warn("초단기실황 데이터 없음");
                return data;
            }
            
            JSONArray items = body.getJSONObject("items").getJSONArray("item");

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                String category = item.getString("category");
                String value = item.getString("obsrValue");

                switch (category) {
                    case "T1H":
                        data.put("temperature", value);
                        break;
                    case "PTY":
                        data.put("pty", value);
                        break;
                }
            }
        } catch (Exception e) {
            log.error("초단기실황 파싱 실패: {}", e.getMessage());
        }

        return data;
    }

    /**
     * 초단기예보 응답 파싱
     */
    private String parseFcstResponse(String response) {
        try {
            JSONObject json = new JSONObject(response);
            JSONObject responseObj = json.getJSONObject("response");
            
            JSONObject header = responseObj.getJSONObject("header");
            String resultCode = header.getString("resultCode");
            
            if (!"00".equals(resultCode)) {
                String resultMsg = header.optString("resultMsg", "알 수 없는 오류");
                log.error("초단기예보 API 오류: {} - {}", resultCode, resultMsg);
                return "1";
            }
            
            JSONObject body = responseObj.getJSONObject("body");
            
            if (body.isNull("items") || body.optString("items", "").isEmpty()) {
                log.warn("초단기예보 데이터 없음");
                return "1";
            }
            
            JSONArray items = body.getJSONObject("items").getJSONArray("item");

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                String category = item.getString("category");

                if ("SKY".equals(category)) {
                    return item.getString("fcstValue");
                }
            }
        } catch (Exception e) {
            log.error("초단기예보 파싱 실패: {}", e.getMessage());
        }

        return "1";
    }

    /**
     * 기상상황 결정
     */
    private String determineSky(String pty, String skyCode) {
        if (pty != null && !"0".equals(pty)) {
            switch (pty) {
                case "1":
                case "5":
                    return "비";
                case "2":
                case "6":
                    return "비/눈";
                case "3":
                case "7":
                    return "눈";
            }
        }

        if (skyCode != null) {
            switch (skyCode) {
                case "1":
                    return "맑음";
                case "3":
                    return "구름많음";
                case "4":
                    return "흐림";
            }
        }

        return "맑음";
    }
}