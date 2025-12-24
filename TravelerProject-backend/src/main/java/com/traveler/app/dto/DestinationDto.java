package com.traveler.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 API 응답 DTO
 * areaBasedList2 API 응답 매핑용
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DestinationDto {
    
    /** 콘텐츠ID */
    @JsonProperty("contentid")
    private String contentid;
    
    /** 관광타입ID */
    @JsonProperty("contenttypeid")
    private String contenttypeid;
    
    /** 제목 */
    @JsonProperty("title")
    private String title;
    
    /** 전화번호 */
    @JsonProperty("tel")
    private String tel;
    
    /** 주소 */
    @JsonProperty("addr1")
    private String addr1;
    
    /** 상세주소 */
    @JsonProperty("addr2")
    private String addr2;
    
    /** 우편번호 */
    @JsonProperty("zipcode")
    private String zipcode;
    
    /** 법정동 시도코드 */
    @JsonProperty("lDongRegnCd")
    private String lDongRegnCd;
    
    /** 법정동 시군구코드 */
    @JsonProperty("lDongSignguCd")
    private String lDongSignguCd;
    
    /** GPS X좌표 (경도) */
    @JsonProperty("mapx")
    private String mapx;
    
    /** GPS Y좌표 (위도) */
    @JsonProperty("mapy")
    private String mapy;
    
    /** 지도레벨 */
    @JsonProperty("mlevel")
    private String mlevel;
    
    /** 대표이미지 (원본) */
    @JsonProperty("firstimage")
    private String firstimage;
    
    /** 대표이미지 (썸네일) */
    @JsonProperty("firstimage2")
    private String firstimage2;
    
    /** API 수정일 */
    @JsonProperty("modifiedtime")
    private String modifiedtime;
}