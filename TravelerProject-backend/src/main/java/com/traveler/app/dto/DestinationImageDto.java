package com.traveler.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 이미지 API 응답 DTO
 * detailImage2 API 응답 매핑용
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DestinationImageDto {
    
    /** 콘텐츠ID */
    @JsonProperty("contentid")
    private String contentid;
    
    /** 원본이미지URL */
    @JsonProperty("originimgurl")
    private String originimgurl;
    
    /** 썸네일이미지URL */
    @JsonProperty("smallimageurl")
    private String smallimageurl;
}