package com.traveler.app.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 찜 DTO
 * 요청/응답 데이터 전송용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationFavoriteDto {
    
    /** 찜 ID */
    private Long favId;
    
    /** 회원 ID */
    private Long mId;
    
    /** 여행지 콘텐츠 ID */
    private String contentid;
    
    /** 생성일 */
    private Timestamp createdAt;
    
    /** 여행지 제목 (마이페이지 찜 목록용) */
    private String title;
    
    /** 여행지 이미지 (마이페이지 찜 목록용) */
    private String firstimage;
    
    /** 여행지 썸네일 (마이페이지 찜 목록용) */
    private String firstimage2;
    
    /** 여행지 주소 (마이페이지 찜 목록용) */
    private String addr1;
    
    /** 여행지 관광타입 (마이페이지 찜 목록용) */
    private String contenttypeid;
}