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

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.traveler.app.util.GridConverter;

import lombok.extern.slf4j.Slf4j;

/**
 * 날씨 서비스
 * 초단기실황 (기온) + 초단기예보 (하늘상태) API 호출
 */
@Service
@Slf4j
public class WeatherService {

    private static final String API_KEY = "82c35c8d8bc1dfb2da647bac77fc73221519592d1202e7769fef3011e885f90c";
    private static final String NCST_URL = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";  // 초단기실황
    private static final String FCST_URL = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";  // 초단기예보

    /**
     * 위경도로 현재 날씨 조회
     * @param lat 위도
     * @param lon 경도
     * @return 날씨 정보 (기온, 기상상황)
     */
    public Map<String, Object> getWeather(double lat, double lon) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 1. 위경도 → 격자 변환
            int[] grid = GridConverter.toGrid(lat, lon);
            int nx = grid[0];
            int ny = grid[1];

            log.info("좌표 변환: lat={}, lon={} → nx={}, ny={}", lat, lon, nx, ny);

            // 2. 초단기실황 API 호출 (기온, 강수형태)
            Map<String, String> ncstData = callNcstApi(nx, ny);
            
            // 3. 초단기예보 API 호출 (하늘상태)
            String skyCode = callFcstApi(nx, ny);

            // 4. 기상상황 결정
            String pty = ncstData.get("pty");  // 강수형태
            String sky = determineSky(pty, skyCode);

            // 5. 결과 구성
            Map<String, String> weather = new HashMap<>();
            weather.put("temperature", ncstData.get("temperature"));
            weather.put("sky", sky);

            result.put("status", "success");
            result.put("weather", weather);

        } catch (Exception e) {
            log.error("날씨 조회 실패: {}", e.getMessage());
            result.put("status", "fail");
            result.put("message", e.getMessage());
        }

        return result;
    }

    /**
     * 초단기실황 API 호출 (기온, 강수형태)
     * 매시 정시 발표, 40분 후 API 제공
     */
    private Map<String, String> callNcstApi(int nx, int ny) throws Exception {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime baseTime;
        
        // 40분 이후면 현재 시간, 이전이면 1시간 전
        if (now.getMinute() >= 40) {
            baseTime = now;
        } else {
            baseTime = now.minusHours(1);
        }

        String baseDate = baseTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTimeStr = baseTime.format(DateTimeFormatter.ofPattern("HH")) + "00";

        StringBuilder urlBuilder = new StringBuilder(NCST_URL);
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + API_KEY);
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
     * 초단기예보 API 호출 (하늘상태)
     * 매시 30분 발표, 약 45분 후 API 제공
     * 예: 10:29 → 08:30 데이터 (09:30은 아직 안 나옴)
     *     10:45 → 09:30 데이터
     */
    private String callFcstApi(int nx, int ny) throws Exception {
        LocalDateTime now = LocalDateTime.now();
        
        int minute = now.getMinute();
        LocalDateTime baseTime;
        
        // 45분 이후면 현재 시간의 30분, 이전이면 이전 시간의 30분
        if (minute >= 45) {
            baseTime = now;
        } else if (minute >= 15) {
            // 15~44분이면 1시간 전 30분
            baseTime = now.minusHours(1);
        } else {
            // 0~14분이면 2시간 전 30분
            baseTime = now.minusHours(2);
        }

        String baseDate = baseTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTimeStr = baseTime.format(DateTimeFormatter.ofPattern("HH")) + "30";

        StringBuilder urlBuilder = new StringBuilder(FCST_URL);
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + API_KEY);
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

        BufferedReader rd;
        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();

        return sb.toString();
    }

    /**
     * 초단기실황 응답 파싱 (기온, 강수형태)
     */
    private Map<String, String> parseNcstResponse(String response) {
        Map<String, String> data = new HashMap<>();

        try {
            JSONObject json = new JSONObject(response);
            JSONObject body = json.getJSONObject("response").getJSONObject("body");
            JSONArray items = body.getJSONObject("items").getJSONArray("item");

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                String category = item.getString("category");
                String value = item.getString("obsrValue");

                switch (category) {
                    case "T1H":  // 기온
                        data.put("temperature", value);
                        break;
                    case "PTY":  // 강수형태
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
     * 초단기예보 응답 파싱 (하늘상태 - 첫 번째 값)
     */
    private String parseFcstResponse(String response) {
        try {
            JSONObject json = new JSONObject(response);
            JSONObject body = json.getJSONObject("response").getJSONObject("body");
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

        return "1";  // 기본값: 맑음
    }

    /**
     * 기상상황 결정 (PTY + SKY 조합)
     */
    private String determineSky(String pty, String skyCode) {
        // 강수형태 우선 (비/눈이 오면 SKY 무시)
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

        // 강수 없으면 하늘상태로 판단
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

        return "맑음";  // 기본값
    }
}