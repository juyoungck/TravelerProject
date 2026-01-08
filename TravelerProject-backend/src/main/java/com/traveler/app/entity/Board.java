package com.traveler.app.entity;

import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Board Entity - 게시판 테이블 매핑
 * 게시글 정보를 담는 엔티티 클래스
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Board {
    
    /** 게시글 ID (PK) */
    private Integer bdId;
    
    /** 작성자 회원 ID (FK) */
    private Integer mId;
    
    /** 카테고리 ('COMPANION', 'REVIEW') */
    private String bdCategory;
    
    /** 게시글 제목 */
    private String bdTitle;
    
    /** 게시글 내용 */
    private String bdContent;
    
    /** 조회수 */
    private Integer bdViewCount;
    
    /** 모집 상태 - 동행만 사용 ('RECRUITING', 'CLOSED') */
    private String recruitStatus;
    
    /** 연결된 플래너 ID (FK, 선택사항) */
    private Integer plnId;
    
    /** 평점 - 후기만 사용 (1 ~ 5 정수) */
    private Integer bdRating;
    
    /** 삭제 여부 (0: 정상, 1: 삭제) */
    private Integer isDeleted;
    
    /** 생성일시 */
    private Timestamp createdAt;
    
    /** 수정일시 */
    private Timestamp updatedAt;
    
    /** 삭제일시 */
    private Timestamp deletedAt;
    
    /** 작성자 닉네임 (JOIN용, DB 컬럼 아님) */
    private String authorNickname;
}