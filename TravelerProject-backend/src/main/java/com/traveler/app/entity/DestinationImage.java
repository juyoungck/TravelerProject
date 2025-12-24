package com.traveler.app.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 이미지 Entity
 * 테이블: destination_image
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationImage {
    
    /** 이미지ID (PK) */
    private Long imgId;
    
    /** 콘텐츠ID (FK) */
    private String contentid;
    
    /** 원본이미지URL */
    private String originimgurl;
}