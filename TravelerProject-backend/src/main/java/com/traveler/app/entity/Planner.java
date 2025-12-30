package com.traveler.app.entity;

import java.sql.Timestamp;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 플래너 Entity
 * - DB의 planner 테이블과 매핑
 * - 여행 계획의 기본 정보를 담는 클래스
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Planner {
    
    /** 플래너 ID (PK) */
    private Long plnId;
    
    /** 회원 ID (FK) */
    private Long mId;
    
    /** 여행 제목 */
    private String plnTitle;
    
    /** 시작일 */
    private LocalDate startDate;
    
    /** 종료일 */
    private LocalDate endDate;
    
    /** 총 일수 */
    private Integer totalDays;
    
    /** 법정동 시도코드 (FK) */
    private String lDongRegnCd;
    
    /** 법정동 시군구코드 */
    private String lDongSignguCd;
    
    /** 공유 링크 */
    private String shareLink;
    
    /** 공개 여부 (0: 비공개, 1: 공개) */
    private Integer isPublic;
    
    /** 생성일 */
    private Timestamp createdAt;
    
    /** 수정일 */
    private Timestamp updatedAt;
}
