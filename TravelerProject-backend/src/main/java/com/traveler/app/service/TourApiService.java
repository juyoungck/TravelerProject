package com.traveler.app.service;

import java.net.URI;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveler.app.config.TourApiConfig;
import com.traveler.app.dto.LdongCodeDto;
import com.traveler.app.dto.TourApiResponse;
import com.traveler.app.dto.DestinationDto;
import com.traveler.app.dto.DestinationDetailDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 한국관광공사 TourAPI 호출 서비스
 * 외부 API를 호출하여 데이터를 가져오는 역할
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TourApiService {

    private final TourApiConfig tourApiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 법정동 시도 코드 조회
     * API: ldongCode2
     * @return 시도 코드 목록
     */
    public List<LdongCodeDto> fetchLdongRegnCodes() {
        try {
            // API URL 생성
            URI uri = UriComponentsBuilder
                    .fromUriString(tourApiConfig.getBaseUrl() + "/ldongCode2")
                    .queryParam("serviceKey", tourApiConfig.getServiceKey())
                    .queryParam("numOfRows", 100)
                    .queryParam("pageNo", 1)
                    .queryParam("MobileOS", tourApiConfig.getMobileOs())
                    .queryParam("MobileApp", tourApiConfig.getMobileApp())
                    .queryParam("_type", "json")
                    .build(true)
                    .toUri();

            log.info("법정동 시도 코드 API 호출: {}", uri);

            // API 호출
            String response = restTemplate.getForObject(uri, String.class);
            
            // ★★★ 원본 응답 출력 (디버그용) ★★★
            log.info("API 원본 응답: {}", response);

            // JSON 파싱
            TourApiResponse<LdongCodeDto> apiResponse = objectMapper.readValue(
                    response,
                    new TypeReference<TourApiResponse<LdongCodeDto>>() {}
            );

            // 응답 확인
            if (apiResponse.getResponse() != null 
                    && apiResponse.getResponse().getBody() != null
                    && apiResponse.getResponse().getBody().getItems() != null) {
                
                List<LdongCodeDto> items = apiResponse.getResponse().getBody().getItems().getItem();
                log.info("법정동 시도 코드 조회 완료: {}건", items != null ? items.size() : 0);
                return items != null ? items : Collections.emptyList();
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("법정동 시도 코드 API 호출 실패: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 법정동 시군구 코드 조회
     * API: ldongCode2 (lDongRegnCd 파라미터 추가)
     * @param lDongRegnCd 시도 코드
     * @return 시군구 코드 목록
     */
    public List<LdongCodeDto> fetchLdongSignguCodes(String lDongRegnCd) {
        try {
            // API URL 생성
            URI uri = UriComponentsBuilder
                    .fromUriString(tourApiConfig.getBaseUrl() + "/ldongCode2")
                    .queryParam("serviceKey", tourApiConfig.getServiceKey())
                    .queryParam("numOfRows", 100)
                    .queryParam("pageNo", 1)
                    .queryParam("MobileOS", tourApiConfig.getMobileOs())
                    .queryParam("MobileApp", tourApiConfig.getMobileApp())
                    .queryParam("lDongRegnCd", lDongRegnCd)
                    .queryParam("_type", "json")
                    .build(true)
                    .toUri();

            log.info("법정동 시군구 코드 API 호출 (시도코드: {}): {}", lDongRegnCd, uri);

            // API 호출
            String response = restTemplate.getForObject(uri, String.class);
            
            // JSON 파싱
            TourApiResponse<LdongCodeDto> apiResponse = objectMapper.readValue(
                    response,
                    new TypeReference<TourApiResponse<LdongCodeDto>>() {}
            );

            // 응답 확인
            if (apiResponse.getResponse() != null 
                    && apiResponse.getResponse().getBody() != null
                    && apiResponse.getResponse().getBody().getItems() != null) {
                
                List<LdongCodeDto> items = apiResponse.getResponse().getBody().getItems().getItem();
                log.info("법정동 시군구 코드 조회 완료 (시도코드: {}): {}건", lDongRegnCd, items != null ? items.size() : 0);
                return items != null ? items : Collections.emptyList();
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("법정동 시군구 코드 API 호출 실패 (시도코드: {}): {}", lDongRegnCd, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    
    /**
     * 여행지 목록 조회 (지역기반)
     * API: areaBasedList2
     * @param contenttypeid 관광타입ID
     * @param pageNo 페이지 번호
     * @param numOfRows 한 페이지 결과 수
     * @return 여행지 목록
     */
    public List<DestinationDto> fetchDestinations(String contenttypeid, int pageNo, int numOfRows) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(tourApiConfig.getBaseUrl() + "/areaBasedList2")
                    .queryParam("serviceKey", tourApiConfig.getServiceKey())
                    .queryParam("numOfRows", numOfRows)
                    .queryParam("pageNo", pageNo)
                    .queryParam("MobileOS", tourApiConfig.getMobileOs())
                    .queryParam("MobileApp", tourApiConfig.getMobileApp())
                    .queryParam("_type", "json")
                    .queryParam("arrange", "C")  // 수정일순 정렬
                    .queryParam("contentTypeId", contenttypeid)
                    .build(true)
                    .toUri();

            log.info("여행지 목록 API 호출 (타입: {}, 페이지: {}): {}", contenttypeid, pageNo, uri);

            String response = restTemplate.getForObject(uri, String.class);
            // ★★★ 원본 응답 출력 (디버그용) ★★★
            log.info("여행지 API 원본 응답: {}", response);

            TourApiResponse<DestinationDto> apiResponse = objectMapper.readValue(
                    response,
                    new TypeReference<TourApiResponse<DestinationDto>>() {}
            );

            if (apiResponse.getResponse() != null
                    && apiResponse.getResponse().getBody() != null
                    && apiResponse.getResponse().getBody().getItems() != null) {

                List<DestinationDto> items = apiResponse.getResponse().getBody().getItems().getItem();
                log.info("여행지 목록 조회 완료 (타입: {}, 페이지: {}): {}건", contenttypeid, pageNo, items != null ? items.size() : 0);
                return items != null ? items : Collections.emptyList();
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("여행지 목록 API 호출 실패: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 여행지 총 개수 조회
     * @param contenttypeid 관광타입ID
     * @return 총 개수
     */
    public int fetchDestinationTotalCount(String contenttypeid) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(tourApiConfig.getBaseUrl() + "/areaBasedList2")
                    .queryParam("serviceKey", tourApiConfig.getServiceKey())
                    .queryParam("numOfRows", 1)
                    .queryParam("pageNo", 1)
                    .queryParam("MobileOS", tourApiConfig.getMobileOs())
                    .queryParam("MobileApp", tourApiConfig.getMobileApp())
                    .queryParam("_type", "json")
                    .queryParam("contentTypeId", contenttypeid)
                    .build(true)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);

            TourApiResponse<DestinationDto> apiResponse = objectMapper.readValue(
                    response,
                    new TypeReference<TourApiResponse<DestinationDto>>() {}
            );

            if (apiResponse.getResponse() != null
                    && apiResponse.getResponse().getBody() != null) {
                int totalCount = apiResponse.getResponse().getBody().getTotalCount();
                log.info("여행지 총 개수 (타입: {}): {}건", contenttypeid, totalCount);
                return totalCount;
            }

            return 0;

        } catch (Exception e) {
            log.error("여행지 총 개수 조회 실패: {}", e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 여행지 상세정보 조회
     * API: detailCommon2
     * @param contentid 콘텐츠ID
     * @return 상세정보
     */
    public DestinationDetailDto fetchDestinationDetail(String contentid) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(tourApiConfig.getBaseUrl() + "/detailCommon2")
                    .queryParam("serviceKey", tourApiConfig.getServiceKey())
                    .queryParam("MobileOS", tourApiConfig.getMobileOs())
                    .queryParam("MobileApp", tourApiConfig.getMobileApp())
                    .queryParam("_type", "json")
                    .queryParam("contentId", contentid)
                    .queryParam("overviewYN", "Y")
                    .queryParam("defaultYN", "Y")
                    .build(true)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);

            TourApiResponse<DestinationDetailDto> apiResponse = objectMapper.readValue(
                    response,
                    new TypeReference<TourApiResponse<DestinationDetailDto>>() {}
            );

            if (apiResponse.getResponse() != null
                    && apiResponse.getResponse().getBody() != null
                    && apiResponse.getResponse().getBody().getItems() != null) {

                List<DestinationDetailDto> items = apiResponse.getResponse().getBody().getItems().getItem();
                if (items != null && !items.isEmpty()) {
                    return items.get(0);
                }
            }

            return null;

        } catch (Exception e) {
            log.error("여행지 상세정보 API 호출 실패 (contentid: {}): {}", contentid, e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 여행지 동기화 목록 조회 (특정 날짜 이후 수정된 데이터)
     * API: detailSync2
     * @param modifiedTime 수정일 기준 (yyyyMMdd 형식)
     * @param pageNo 페이지 번호
     * @param numOfRows 한 페이지 결과 수
     * @return 수정된 여행지 목록
     */
    public List<DestinationDto> fetchModifiedDestinations(String modifiedTime, int pageNo, int numOfRows) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(tourApiConfig.getBaseUrl() + "/detailSync2")
                    .queryParam("serviceKey", tourApiConfig.getServiceKey())
                    .queryParam("numOfRows", numOfRows)
                    .queryParam("pageNo", pageNo)
                    .queryParam("MobileOS", tourApiConfig.getMobileOs())
                    .queryParam("MobileApp", tourApiConfig.getMobileApp())
                    .queryParam("_type", "json")
                    .queryParam("modifiedTime", modifiedTime)
                    .build(true)
                    .toUri();

            log.info("동기화 API 호출 (수정일: {}, 페이지: {}): {}", modifiedTime, pageNo, uri);

            String response = restTemplate.getForObject(uri, String.class);
            
            log.info("동기화 API 원본 응답: {}", response);

            TourApiResponse<DestinationDto> apiResponse = objectMapper.readValue(
                    response,
                    new TypeReference<TourApiResponse<DestinationDto>>() {}
            );

            if (apiResponse.getResponse() != null
                    && apiResponse.getResponse().getBody() != null
                    && apiResponse.getResponse().getBody().getItems() != null) {

                List<DestinationDto> items = apiResponse.getResponse().getBody().getItems().getItem();
                log.info("동기화 목록 조회 완료 (수정일: {}, 페이지: {}): {}건", modifiedTime, pageNo, items != null ? items.size() : 0);
                return items != null ? items : Collections.emptyList();
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("동기화 API 호출 실패: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 동기화 목록 총 개수 조회
     * @param modifiedTime 수정일 기준 (yyyyMMdd 형식)
     * @return 총 개수
     */
    public int fetchModifiedTotalCount(String modifiedTime) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(tourApiConfig.getBaseUrl() + "/detailSync2")
                    .queryParam("serviceKey", tourApiConfig.getServiceKey())
                    .queryParam("numOfRows", 1)
                    .queryParam("pageNo", 1)
                    .queryParam("MobileOS", tourApiConfig.getMobileOs())
                    .queryParam("MobileApp", tourApiConfig.getMobileApp())
                    .queryParam("_type", "json")
                    .queryParam("modifiedTime", modifiedTime)
                    .build(true)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);

            TourApiResponse<DestinationDto> apiResponse = objectMapper.readValue(
                    response,
                    new TypeReference<TourApiResponse<DestinationDto>>() {}
            );

            if (apiResponse.getResponse() != null
                    && apiResponse.getResponse().getBody() != null) {
                int totalCount = apiResponse.getResponse().getBody().getTotalCount();
                log.info("동기화 총 개수 (수정일: {}): {}건", modifiedTime, totalCount);
                return totalCount;
            }

            return 0;

        } catch (Exception e) {
            log.error("동기화 총 개수 조회 실패: {}", e.getMessage(), e);
            return 0;
        }
    }
}