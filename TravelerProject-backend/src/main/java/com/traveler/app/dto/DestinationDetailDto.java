package com.traveler.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 상세정보 API 응답 DTO
 * detailCommon2 API 응답 매핑용
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DestinationDetailDto {
    
    /** 콘텐츠ID */
    @JsonProperty("contentid")
    private String contentid;
    
    /** 개요 */
    @JsonProperty("overview")
    private String overview;
    
    /** 홈페이지URL */
    @JsonProperty("homepage")
    private String homepage;
    
    /** 제목 */
    @JsonProperty("title")
    private String title;
    
    /** 전화번호 */
    @JsonProperty("tel")
    private String tel;
}