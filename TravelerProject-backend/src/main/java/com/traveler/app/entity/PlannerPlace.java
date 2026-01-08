package com.traveler.app.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 플래너 장소 Entity
 * - DB의 planner_place 테이블과 매핑
 * - 일차별 방문 장소 정보를 담는 클래스
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerPlace {
    
    /** 장소 ID (PK) */
    private Long placeId;
    
    /** 일차 ID (FK) */
    private Long dayId;
    
    /** 콘텐츠 ID (FK - destination 테이블 참조) */
    private String contentid;
    
    /** 방문 순서 */
    private Integer sortOrder;
}
