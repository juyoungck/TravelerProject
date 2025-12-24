package com.traveler.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 법정동 코드 API 응답 DTO
 * ldongCode2 API 응답 매핑용
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LdongCodeDto {
    
    /** 순번 */
    private int rnum;
    
    /** 코드 (시도코드 또는 시군구코드) */
    @JsonProperty("code")
    private String code;
    
    /** 이름 (시도명 또는 시군구명) */
    @JsonProperty("name")
    private String name;
}