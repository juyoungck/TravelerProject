package com.traveler.app.dao;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import com.traveler.app.dto.BoardDto;

/**
 * BoardDao - 게시판 데이터 접근 객체
 * MyBatis Mapper와 연결되어 DB 작업 수행
 */
@Mapper
public interface BoardDao {
    
    /**
     * 게시글 목록 조회 (페이징, 카테고리 필터, 검색)
     * @param params {category, keyword, offset, size}
     * @return 게시글 목록
     */
    List<BoardDto> selectBoardList(Map<String, Object> params);
    
    /**
     * 게시글 총 개수 조회 (페이징용)
     * @param params {category, keyword}
     * @return 총 개수
     */
    int selectBoardCount(Map<String, Object> params);
    
    /**
     * 게시글 상세 조회
     * @param bdId 게시글 ID
     * @return 게시글 정보
     */
    BoardDto selectBoardDetail(Integer bdId);
    
    /**
     * 게시글 등록
     * @param boardDto 게시글 정보
     * @return 등록된 행 수
     */
    int insertBoard(BoardDto boardDto);
    
    /**
     * 게시글 수정
     * @param boardDto 게시글 정보
     * @return 수정된 행 수
     */
    int updateBoard(BoardDto boardDto);
    
    /**
     * 게시글 삭제 (soft delete)
     * @param bdId 게시글 ID
     * @return 삭제된 행 수
     */
    int deleteBoard(Integer bdId);
    
    /**
     * 조회수 증가
     * @param bdId 게시글 ID
     * @return 수정된 행 수
     */
    int updateViewCount(Integer bdId);
    
    /**
     * 모집 마감 (동행 게시글)
     * @param bdId 게시글 ID
     * @return 수정된 행 수
     */
    int updateRecruitStatus(Integer bdId);
}