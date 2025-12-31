package com.traveler.app.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.traveler.app.dto.BoardCommentDto;

/**
 * BoardCommentDao - 댓글 데이터 접근 객체
 * MyBatis Mapper와 연결되어 DB 작업 수행
 */
@Mapper
public interface BoardCommentDao {
    
    /**
     * 댓글 목록 조회 (특정 게시글의 댓글 + 답글)
     * @param bdId 게시글 ID
     * @return 댓글 목록 (답글 포함)
     */
    List<BoardCommentDto> selectCommentList(Integer bdId);
    
    /**
     * 댓글 + 답글 총 개수 조회
     * @param bdId 게시글 ID
     * @return 총 개수
     */
    int selectCommentCount(Integer bdId);
    
    /**
     * 댓글/답글 등록
     * @param commentDto 댓글 정보
     * @return 등록된 행 수
     */
    int insertComment(BoardCommentDto commentDto);
    
    /**
     * 댓글/답글 삭제 (soft delete)
     * @param cmtId 댓글 ID
     * @return 삭제된 행 수
     */
    int deleteComment(Integer cmtId);
    
    /**
     * 댓글 작성자 확인 (삭제 권한 체크용)
     * @param cmtId 댓글 ID
     * @return 작성자 회원 ID
     */
    Integer selectCommentAuthor(Integer cmtId);
}