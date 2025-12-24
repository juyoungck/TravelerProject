package com.traveler.app.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 여행지 기본정보 Entity
 * 테이블: destination
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination {
    
    /** 콘텐츠ID (PK) */
    private String contentid;
    
    /** 관광타입ID (FK) */
    private String contenttypeid;
    
    /** 제목 */
    private String title;
    
    /** 개요 */
    private String overview;
    
    /** 홈페이지URL */
    private String homepage;
    
    /** 전화번호 */
    private String tel;
    
    /** 주소 */
    private String addr1;
    
    /** 상세주소 */
    private String addr2;
    
    /** 우편번호 */
    private String zipcode;
    
    /** 법정동 시도코드 (FK) */
    private String lDongRegnCd;
    
    /** 법정동 시군구코드 */
    private String lDongSignguCd;
    
    /** GPS X좌표 (경도) */
    private Double mapx;
    
    /** GPS Y좌표 (위도) */
    private Double mapy;
    
    /** 지도레벨 */
    private Integer mlevel;
    
    /** 대표이미지 (원본) */
    private String firstimage;
    
    /** 대표이미지 (썸네일) */
    private String firstimage2;
    
    /** API 수정일 */
    private String modifiedtime;
    
    /** 조회수 */
    private Integer viewCount;
    
    /** API 동기화일시 */
    private Timestamp syncDate;
    
    /** 생성일 */
    private Timestamp createdAt;
}