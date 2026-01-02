package com.traveler.app.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * 축제/공연/행사 서비스
 * 한국관광공사 searchFestival2 API 호출
 * 
 * lclsSystm2 구분:
 * - EV01: 축제
 * - EV02: 공연
 * - EV03: 행사
 */
@Service
@Slf4j
public class FestivalService {

    @Value("${tourapi.service-key}")
    private String apiKey;

    private static final String BASE_URL = "http://apis.data.go.kr/B551011/KorService2/searchFestival2";
    private static final String IMAGE_URL = "http://apis.data.go.kr/B551011/KorService2/detailImage2";

    /**
     * 축제/공연/행사 목록 조회
     * 
     * @param type 타입 (all, festival, performance, event)
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return 결과 Map
     */
    public Map<String, Object> getFestivalList(String type, int page, int size) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 날짜 범위: 오늘 ~ 1년 후
            LocalDate today = LocalDate.now();
            LocalDate oneYearLater = today.plusYears(1);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
            
            String startDate = today.format(formatter);
            String endDate = oneYearLater.format(formatter);

            // API 호출
            String response = callApi(startDate, endDate, page, size);
            
            // 파싱
            List<Map<String, Object>> items = parseResponse(response);
            
            // 타입별 필터링
            List<Map<String, Object>> filteredItems = filterByType(items, type);

            result.put("status", "success");
            result.put("data", filteredItems);
            result.put("totalCount", filteredItems.size());
            result.put("currentPage", page);

        } catch (Exception e) {
            log.error("축제/공연/행사 조회 실패: {}", e.getMessage());
            result.put("status", "fail");
            result.put("message", e.getMessage());
        }

        return result;
    }

    /**
     * API 호출
     */
    private String callApi(String startDate, String endDate, int page, int size) throws Exception {
        StringBuilder urlBuilder = new StringBuilder(BASE_URL);
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + apiKey);
        urlBuilder.append("&" + URLEncoder.encode("MobileOS", "UTF-8") + "=" + URLEncoder.encode("ETC", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("MobileApp", "UTF-8") + "=" + URLEncoder.encode("TravelerProject", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("_type", "UTF-8") + "=" + URLEncoder.encode("json", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("eventStartDate", "UTF-8") + "=" + URLEncoder.encode(startDate, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("eventEndDate", "UTF-8") + "=" + URLEncoder.encode(endDate, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("arrange", "UTF-8") + "=" + URLEncoder.encode("A", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode(String.valueOf(size * 10), "UTF-8")); // 필터링 위해 넉넉히
        urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode("1", "UTF-8"));

        log.info("축제/공연/행사 API 호출: startDate={}, endDate={}", startDate, endDate);

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
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

        return sb.toString();
    }

    /**
     * JSON 응답 파싱
     */
    private List<Map<String, Object>> parseResponse(String response) {
        List<Map<String, Object>> items = new ArrayList<>();

        try {
            JSONObject json = new JSONObject(response);
            JSONObject responseObj = json.getJSONObject("response");
            JSONObject body = responseObj.getJSONObject("body");
            
            // items가 없거나 비어있는 경우 처리
            if (!body.has("items") || body.isNull("items")) {
                return items;
            }
            
            Object itemsObj = body.get("items");
            if (itemsObj instanceof String && ((String) itemsObj).isEmpty()) {
                return items;
            }
            
            JSONObject itemsWrapper = body.getJSONObject("items");
            
            // item이 배열인지 단일 객체인지 확인
            Object itemObj = itemsWrapper.get("item");
            JSONArray itemArray;
            
            if (itemObj instanceof JSONArray) {
                itemArray = (JSONArray) itemObj;
            } else {
                itemArray = new JSONArray();
                itemArray.put(itemObj);
            }

            for (int i = 0; i < itemArray.length(); i++) {
                JSONObject item = itemArray.getJSONObject(i);
                Map<String, Object> data = new HashMap<>();

                data.put("contentid", getStringValue(item, "contentid"));
                data.put("contenttypeid", getStringValue(item, "contenttypeid"));
                data.put("title", getStringValue(item, "title"));
                data.put("addr1", getStringValue(item, "addr1"));
                data.put("addr2", getStringValue(item, "addr2"));
                data.put("zipcode", getStringValue(item, "zipcode"));
                data.put("tel", getStringValue(item, "tel"));
                data.put("firstimage", getStringValue(item, "firstimage"));
                data.put("firstimage2", getStringValue(item, "firstimage2"));
                data.put("mapx", getStringValue(item, "mapx"));
                data.put("mapy", getStringValue(item, "mapy"));
                data.put("mlevel", getStringValue(item, "mlevel"));
                data.put("eventstartdate", getStringValue(item, "eventstartdate"));
                data.put("eventenddate", getStringValue(item, "eventenddate"));
                data.put("lDongRegnCd", getStringValue(item, "lDongRegnCd"));
                data.put("lDongSignguCd", getStringValue(item, "lDongSignguCd"));
                data.put("lclsSystm1", getStringValue(item, "lclsSystm1"));
                data.put("lclsSystm2", getStringValue(item, "lclsSystm2"));
                data.put("lclsSystm3", getStringValue(item, "lclsSystm3"));

                // 카테고리 설정 (lclsSystm2 기준)
                String lclsSystm2 = getStringValue(item, "lclsSystm2");
                String category = getCategoryByLclsSystm2(lclsSystm2);
                data.put("category", category);

                items.add(data);
            }
        } catch (Exception e) {
            log.error("응답 파싱 실패: {}", e.getMessage());
        }

        return items;
    }

    /**
     * JSON에서 String 값 안전하게 추출
     */
    private String getStringValue(JSONObject obj, String key) {
        if (obj.has(key) && !obj.isNull(key)) {
            return obj.get(key).toString();
        }
        return "";
    }

    /**
     * lclsSystm2 → 카테고리명 변환
     */
    private String getCategoryByLclsSystm2(String lclsSystm2) {
        if (lclsSystm2 == null || lclsSystm2.isEmpty()) {
            return "축제"; // 기본값
        }
        switch (lclsSystm2) {
            case "EV01":
                return "축제";
            case "EV02":
                return "공연";
            case "EV03":
                return "행사";
            default:
                return "축제";
        }
    }

    /**
     * 타입별 필터링
     */
    private List<Map<String, Object>> filterByType(List<Map<String, Object>> items, String type) {
        if ("all".equals(type)) {
            return items;
        }

        String targetCategory;
        switch (type) {
            case "festival":
                targetCategory = "축제";
                break;
            case "performance":
                targetCategory = "공연";
                break;
            case "event":
                targetCategory = "행사";
                break;
            default:
                return items;
        }

        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> item : items) {
            if (targetCategory.equals(item.get("category"))) {
                filtered.add(item);
            }
        }
        return filtered;
    }

    /**
     * 콘텐츠 이미지 목록 조회
     * 
     * @param contentId 콘텐츠 ID
     * @return 이미지 URL 목록
     */
    public Map<String, Object> getImages(String contentId) {
        Map<String, Object> result = new HashMap<>();

        try {
            StringBuilder urlBuilder = new StringBuilder(IMAGE_URL);
            urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + apiKey);
            urlBuilder.append("&" + URLEncoder.encode("MobileOS", "UTF-8") + "=" + URLEncoder.encode("ETC", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("MobileApp", "UTF-8") + "=" + URLEncoder.encode("TravelerProject", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("_type", "UTF-8") + "=" + URLEncoder.encode("json", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("contentId", "UTF-8") + "=" + URLEncoder.encode(contentId, "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("imageYN", "UTF-8") + "=" + URLEncoder.encode("Y", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode("20", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode("1", "UTF-8"));

            log.info("이미지 목록 API 호출: contentId={}", contentId);

            URL url = new URL(urlBuilder.toString());
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");

            BufferedReader rd;
            if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
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

            // 파싱
            List<String> images = parseImageResponse(sb.toString());

            result.put("status", "success");
            result.put("images", images);
            result.put("totalCount", images.size());

        } catch (Exception e) {
            log.error("이미지 목록 조회 실패: {}", e.getMessage());
            result.put("status", "fail");
            result.put("message", e.getMessage());
        }

        return result;
    }

    /**
     * 이미지 목록 응답 파싱
     */
    private List<String> parseImageResponse(String response) {
        List<String> images = new ArrayList<>();

        try {
            JSONObject json = new JSONObject(response);
            JSONObject responseObj = json.getJSONObject("response");
            JSONObject body = responseObj.getJSONObject("body");

            // items가 없거나 비어있는 경우 처리
            if (!body.has("items") || body.isNull("items")) {
                return images;
            }

            Object itemsObj = body.get("items");
            if (itemsObj instanceof String && ((String) itemsObj).isEmpty()) {
                return images;
            }

            JSONObject itemsWrapper = body.getJSONObject("items");

            // item이 배열인지 단일 객체인지 확인
            Object itemObj = itemsWrapper.get("item");
            JSONArray itemArray;

            if (itemObj instanceof JSONArray) {
                itemArray = (JSONArray) itemObj;
            } else {
                itemArray = new JSONArray();
                itemArray.put(itemObj);
            }

            for (int i = 0; i < itemArray.length(); i++) {
                JSONObject item = itemArray.getJSONObject(i);
                String originimgurl = getStringValue(item, "originimgurl");
                if (!originimgurl.isEmpty()) {
                    images.add(originimgurl);
                }
            }
        } catch (Exception e) {
            log.error("이미지 응답 파싱 실패: {}", e.getMessage());
        }

        return images;
    }
}