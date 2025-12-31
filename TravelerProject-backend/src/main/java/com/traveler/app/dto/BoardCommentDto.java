package com.traveler.app.dto;

import java.sql.Timestamp;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BoardCommentDto - 댓글 요청/응답 DTO
 * 댓글 및 답글 CRUD에 사용되는 데이터 전송 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardCommentDto {
    
    /** 댓글 ID */
    private Integer cmtId;
    
    /** 게시글 ID */
    private Integer bdId;
    
    /** 작성자 회원 ID */
    private Integer mId;
    
    /** 작성자 닉네임 (조회 시 JOIN) */
    private String authorNickname;
    
    /** 부모 댓글 ID (답글인 경우) */
    private Integer parentId;
    
    /** 댓글 내용 */
    private String cmtContent;
    
    /** 삭제 여부 */
    private Integer isDeleted;
    
    /** 생성일시 */
    private Timestamp createdAt;
    
    /** 수정일시 */
    private Timestamp updatedAt;
    
    /** 답글 목록 (댓글 조회 시 포함) */
    private List<BoardCommentDto> replies;
}