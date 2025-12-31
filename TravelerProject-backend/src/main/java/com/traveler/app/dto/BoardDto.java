package com.traveler.app.dto;

import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BoardDto - 게시글 요청/응답 DTO
 * 게시글 CRUD에 사용되는 데이터 전송 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDto {
    
    /** 게시글 ID */
    private Integer bdId;
    
    /** 작성자 회원 ID */
    private Integer mId;
    
    /** 작성자 닉네임 (조회 시 JOIN) */
    private String authorNickname;
    
    /** 카테고리 ('COMPANION', 'REVIEW') */
    private String bdCategory;
    
    /** 게시글 제목 */
    private String bdTitle;
    
    /** 게시글 내용 */
    private String bdContent;
    
    /** 조회수 */
    private Integer bdViewCount;
    
    /** 모집 상태 ('RECRUITING', 'CLOSED') */
    private String recruitStatus;
    
    /** 연결된 플래너 ID */
    private Integer plnId;
    
    /** 연결된 플래너 제목 (조회 시 JOIN) */
    private String plannerTitle;
    
    /** 평점 (1 ~ 5 정수) */
    private Integer bdRating;
    
    /** 삭제 여부 */
    private Integer isDeleted;
    
    /** 생성일시 */
    private Timestamp createdAt;
    
    /** 수정일시 */
    private Timestamp updatedAt;
    
    /** 댓글 + 답글 총 개수 (목록 조회 시) */
    private Integer commentCount;
}