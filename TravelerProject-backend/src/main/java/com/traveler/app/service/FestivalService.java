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
import java.util.concurrent.ConcurrentHashMap;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * 축제/공연/행사 서비스
 * 한국관광공사 OpenAPI 호출
 * 
 * API 사용:
 * - searchFestival2: 축제/공연/행사 목록
 * - detailImage2: 이미지 목록
 * - detailInfo2: 코스 경유지 상세
 * 
 * 여행코스 목록은 DB에서 조회 (contenttypeid=25)
 */
@Service
@Slf4j
public class FestivalService {

    @Value("${tourapi.service-key}")
    private String apiKey;

    private static final String BASE_URL = "http://apis.data.go.kr/B551011/KorService2/searchFestival2";
    private static final String IMAGE_URL = "http://apis.data.go.kr/B551011/KorService2/detailImage2";
    private static final String DETAIL_URL = "http://apis.data.go.kr/B551011/KorService2/detailInfo2";
    
    private static final long CACHE_DURATION = 6 * 60 * 60 * 1000;
    
    private final ConcurrentHashMap<String, CacheData> listCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, CacheData> imageCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, CacheData> courseDetailCache = new ConcurrentHashMap<>();

    private static class CacheData {
        Map<String, Object> data;
        long timestamp;
        
        CacheData(Map<String, Object> data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }
        
        boolean isValid() {
            return (System.currentTimeMillis() - timestamp) < CACHE_DURATION;
        }
    }

    public Map<String, Object> getFestivalList(String type, int page, int size) {
        String cacheKey = type + "_" + page + "_" + size;
        CacheData cached = listCache.get(cacheKey);
        if (cached != null && cached.isValid()) {
            log.info("축제/공연/행사 캐시 사용: type={}", type);
            return cached.data;
        }
        
        Map<String, Object> result = new HashMap<>();

        try {
            LocalDate today = LocalDate.now();
            LocalDate oneYearLater = today.plusYears(1);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
            
            String startDate = today.format(formatter);
            String endDate = oneYearLater.format(formatter);

            log.info("축제/공연/행사 API 호출: type={}", type);
            
            String response = callFestivalApi(startDate, endDate, size);
            List<Map<String, Object>> items = parseFestivalResponse(response);
            List<Map<String, Object>> filteredItems = filterByType(items, type);

            result.put("status", "success");
            result.put("data", filteredItems);
            result.put("totalCount", filteredItems.size());
            result.put("currentPage", page);
            
            listCache.put(cacheKey, new CacheData(result));
            cleanExpiredCache();

        } catch (Exception e) {
            log.error("축제/공연/행사 조회 실패: {}", e.getMessage());
            result.put("status", "fail");
            result.put("message", e.getMessage());
        }

        return result;
    }
    
    private void cleanExpiredCache() {
        listCache.entrySet().removeIf(entry -> !entry.getValue().isValid());
        imageCache.entrySet().removeIf(entry -> !entry.getValue().isValid());
        courseDetailCache.entrySet().removeIf(entry -> !entry.getValue().isValid());
    }

    private String callFestivalApi(String startDate, String endDate, int size) throws Exception {
        StringBuilder urlBuilder = new StringBuilder(BASE_URL);
        urlBuilder.append("?serviceKey=" + apiKey);
        urlBuilder.append("&MobileOS=ETC&MobileApp=TravelerProject&_type=json");
        urlBuilder.append("&eventStartDate=" + startDate);
        urlBuilder.append("&eventEndDate=" + endDate);
        urlBuilder.append("&arrange=A&numOfRows=" + (size * 10) + "&pageNo=1");

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);

        BufferedReader rd = new BufferedReader(new InputStreamReader(
            conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300 
                ? conn.getInputStream() : conn.getErrorStream(), "UTF-8"));

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) sb.append(line);
        rd.close();
        conn.disconnect();

        return sb.toString();
    }

    private List<Map<String, Object>> parseFestivalResponse(String response) {
        List<Map<String, Object>> items = new ArrayList<>();

        try {
            JSONObject json = new JSONObject(response);
            JSONObject body = json.getJSONObject("response").getJSONObject("body");
            
            if (!body.has("items") || body.isNull("items")) return items;
            
            Object itemsObj = body.get("items");
            if (itemsObj instanceof String && ((String) itemsObj).isEmpty()) return items;
            
            JSONObject itemsWrapper = body.getJSONObject("items");
            Object itemObj = itemsWrapper.get("item");
            JSONArray itemArray = itemObj instanceof JSONArray ? (JSONArray) itemObj : new JSONArray().put(itemObj);

            for (int i = 0; i < itemArray.length(); i++) {
                JSONObject item = itemArray.getJSONObject(i);
                Map<String, Object> data = new HashMap<>();

                data.put("contentid", getStringValue(item, "contentid"));
                data.put("contenttypeid", getStringValue(item, "contenttypeid"));
                data.put("title", getStringValue(item, "title"));
                data.put("addr1", getStringValue(item, "addr1"));
                data.put("addr2", getStringValue(item, "addr2"));
                data.put("tel", getStringValue(item, "tel"));
                data.put("firstimage", getStringValue(item, "firstimage"));
                data.put("firstimage2", getStringValue(item, "firstimage2"));
                data.put("mapx", getStringValue(item, "mapx"));
                data.put("mapy", getStringValue(item, "mapy"));
                data.put("eventstartdate", getStringValue(item, "eventstartdate"));
                data.put("eventenddate", getStringValue(item, "eventenddate"));
                data.put("lclsSystm2", getStringValue(item, "lclsSystm2"));
                data.put("category", getCategoryByLclsSystm2(getStringValue(item, "lclsSystm2")));

                items.add(data);
            }
        } catch (Exception e) {
            log.error("응답 파싱 실패: {}", e.getMessage());
        }

        return items;
    }

    private String getStringValue(JSONObject obj, String key) {
        return obj.has(key) && !obj.isNull(key) ? obj.get(key).toString() : "";
    }

    private String getCategoryByLclsSystm2(String lclsSystm2) {
        if (lclsSystm2 == null || lclsSystm2.isEmpty()) return "축제";
        switch (lclsSystm2) {
            case "EV01": return "축제";
            case "EV02": return "공연";
            case "EV03": return "행사";
            default: return "축제";
        }
    }

    private List<Map<String, Object>> filterByType(List<Map<String, Object>> items, String type) {
        if ("all".equals(type)) return items;

        String targetCategory = type.equals("festival") ? "축제" : type.equals("performance") ? "공연" : type.equals("event") ? "행사" : null;
        if (targetCategory == null) return items;

        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> item : items) {
            if (targetCategory.equals(item.get("category"))) filtered.add(item);
        }
        return filtered;
    }

    public Map<String, Object> getImages(String contentId) {
        CacheData cached = imageCache.get(contentId);
        if (cached != null && cached.isValid()) {
            log.info("이미지 목록 캐시 사용: contentId={}", contentId);
            return cached.data;
        }
        
        Map<String, Object> result = new HashMap<>();

        try {
            String urlStr = IMAGE_URL + "?serviceKey=" + apiKey 
                + "&MobileOS=ETC&MobileApp=TravelerProject&_type=json"
                + "&contentId=" + contentId + "&imageYN=Y&numOfRows=20&pageNo=1";

            log.info("이미지 목록 API 호출: contentId={}", contentId);

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            BufferedReader rd = new BufferedReader(new InputStreamReader(
                conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300 
                    ? conn.getInputStream() : conn.getErrorStream(), "UTF-8"));

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) sb.append(line);
            rd.close();
            conn.disconnect();

            List<String> images = parseImageResponse(sb.toString());

            result.put("status", "success");
            result.put("images", images);
            result.put("totalCount", images.size());
            
            imageCache.put(contentId, new CacheData(result));

        } catch (Exception e) {
            log.error("이미지 목록 조회 실패: {}", e.getMessage());
            result.put("status", "fail");
            result.put("message", e.getMessage());
        }

        return result;
    }

    private List<String> parseImageResponse(String response) {
        List<String> images = new ArrayList<>();

        try {
            JSONObject json = new JSONObject(response);
            JSONObject body = json.getJSONObject("response").getJSONObject("body");

            if (!body.has("items") || body.isNull("items")) return images;

            Object itemsObj = body.get("items");
            if (itemsObj instanceof String && ((String) itemsObj).isEmpty()) return images;

            JSONObject itemsWrapper = body.getJSONObject("items");
            Object itemObj = itemsWrapper.get("item");
            JSONArray itemArray = itemObj instanceof JSONArray ? (JSONArray) itemObj : new JSONArray().put(itemObj);

            for (int i = 0; i < itemArray.length(); i++) {
                String originimgurl = getStringValue(itemArray.getJSONObject(i), "originimgurl");
                if (!originimgurl.isEmpty()) images.add(originimgurl);
            }
        } catch (Exception e) {
            log.error("이미지 응답 파싱 실패: {}", e.getMessage());
        }

        return images;
    }

    public Map<String, Object> getCourseDetail(String contentId) {
        CacheData cached = courseDetailCache.get(contentId);
        if (cached != null && cached.isValid()) {
            log.info("코스 경유지 캐시 사용: contentId={}", contentId);
            return cached.data;
        }
        
        Map<String, Object> result = new HashMap<>();

        try {
            String urlStr = DETAIL_URL + "?serviceKey=" + apiKey 
                + "&MobileOS=ETC&MobileApp=TravelerProject&_type=json"
                + "&contentId=" + contentId + "&contentTypeId=25&numOfRows=50&pageNo=1";

            log.info("코스 경유지 API 호출: contentId={}", contentId);

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            BufferedReader rd = new BufferedReader(new InputStreamReader(
                conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300 
                    ? conn.getInputStream() : conn.getErrorStream(), "UTF-8"));

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) sb.append(line);
            rd.close();
            conn.disconnect();

            List<Map<String, Object>> spots = parseCourseDetailResponse(sb.toString());

            result.put("status", "success");
            result.put("spots", spots);
            result.put("totalCount", spots.size());
            
            courseDetailCache.put(contentId, new CacheData(result));

        } catch (Exception e) {
            log.error("코스 경유지 조회 실패: {}", e.getMessage());
            result.put("status", "fail");
            result.put("message", e.getMessage());
        }

        return result;
    }

    private List<Map<String, Object>> parseCourseDetailResponse(String response) {
        List<Map<String, Object>> spots = new ArrayList<>();

        try {
            JSONObject json = new JSONObject(response);
            JSONObject body = json.getJSONObject("response").getJSONObject("body");
            
            if (!body.has("items") || body.isNull("items")) return spots;
            
            Object itemsObj = body.get("items");
            if (itemsObj instanceof String && ((String) itemsObj).isEmpty()) return spots;
            
            JSONObject itemsWrapper = body.getJSONObject("items");
            Object itemObj = itemsWrapper.get("item");
            JSONArray itemArray = itemObj instanceof JSONArray ? (JSONArray) itemObj : new JSONArray().put(itemObj);

            for (int i = 0; i < itemArray.length(); i++) {
                JSONObject item = itemArray.getJSONObject(i);
                Map<String, Object> spot = new HashMap<>();

                spot.put("subnum", getStringValue(item, "subnum"));
                spot.put("subname", getStringValue(item, "subname"));
                spot.put("subdetailoverview", getStringValue(item, "subdetailoverview"));
                spot.put("subdetailimg", getStringValue(item, "subdetailimg"));
                spot.put("subcontentid", getStringValue(item, "subcontentid"));
                spot.put("mapx", getStringValue(item, "mapx"));
                spot.put("mapy", getStringValue(item, "mapy"));

                spots.add(spot);
            }
            
            spots.sort((a, b) -> {
                try {
                    return Integer.parseInt((String) a.getOrDefault("subnum", "0")) 
                         - Integer.parseInt((String) b.getOrDefault("subnum", "0"));
                } catch (Exception e) { return 0; }
            });
            
        } catch (Exception e) {
            log.error("코스 경유지 응답 파싱 실패: {}", e.getMessage());
        }

        return spots;
    }
}