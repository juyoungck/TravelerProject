package com.traveler.app.entity;

import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BoardComment Entity - 게시판 댓글 테이블 매핑
 * 댓글 및 답글 정보를 담는 엔티티 클래스
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardComment {
    
    /** 댓글 ID (PK) */
    private Integer cmtId;
    
    /** 게시글 ID (FK) */
    private Integer bdId;
    
    /** 작성자 회원 ID (FK) */
    private Integer mId;
    
    /** 부모 댓글 ID (답글인 경우, null이면 일반 댓글) */
    private Integer parentId;
    
    /** 댓글 내용 */
    private String cmtContent;
    
    /** 삭제 여부 (0: 정상, 1: 삭제) */
    private Integer isDeleted;
    
    /** 생성일시 */
    private Timestamp createdAt;
    
    /** 수정일시 */
    private Timestamp updatedAt;
}