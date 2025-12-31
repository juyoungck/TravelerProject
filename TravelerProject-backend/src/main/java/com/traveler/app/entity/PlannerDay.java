package com.traveler.app.entity;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 플래너 일차 Entity
 * - DB의 planner_day 테이블과 매핑
 * - 플래너의 각 일차 정보를 담는 클래스
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerDay {
    
    /** 일차 ID (PK) */
    private Long dayId;
    
    /** 플래너 ID (FK) */
    private Long plnId;
    
    /** N일차 (1, 2, 3...) */
    private Integer dayNumber;
    
    /** 여행 일자 */
    private LocalDate tripDate;
    
    /** 메모 */
    private String memo;
}
