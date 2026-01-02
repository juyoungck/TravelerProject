package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 찜 Entity
 * 테이블: favorite_destination
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationFavorite {
    
    /** 찜 ID (PK) */
    private Long favId;
    
    /** 회원 ID (FK) */
    private Long mId;
    
    /** 여행지 콘텐츠 ID (FK) */
    private String contentid;
    
    /** 생성일 */
    private Timestamp createdAt;
    
    /** 여행지 제목 (조인용, DB 컬럼 아님) */
    private String title;
    
    /** 여행지 이미지 (조인용, DB 컬럼 아님) */
    private String firstimage;
    
    /** 여행지 주소 (조인용, DB 컬럼 아님) */
    private String addr1;
}