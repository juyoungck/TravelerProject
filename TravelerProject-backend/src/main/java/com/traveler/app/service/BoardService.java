package com.traveler.app.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.traveler.app.dao.BoardDao;
import com.traveler.app.dao.BoardCommentDao;
import com.traveler.app.dto.BoardDto;
import com.traveler.app.dto.BoardCommentDto;

/**
 * BoardService - 게시판 비즈니스 로직
 * 게시글 및 댓글 관련 서비스 처리
 */
@Service
public class BoardService {
    
    @Autowired
    private BoardDao boardDao;
    
    @Autowired
    private BoardCommentDao boardCommentDao;
    
    /**
     * 게시글 목록 조회 (페이징, 카테고리 필터, 검색)
     * @param category 카테고리 (ALL, COMPANION, REVIEW)
     * @param keyword 검색어
     * @param page 페이지 번호
     * @param size 페이지당 개수
     * @return 게시글 목록 + 페이징 정보
     */
    public Map<String, Object> getBoardList(String category, String searchType, String keyword, int page, int size) {
        // offset 계산
        int offset = (page - 1) * size;
        
        // 파라미터 설정
        Map<String, Object> params = new HashMap<>();
        params.put("category", category);
        params.put("searchType", searchType);
        params.put("keyword", keyword);
        params.put("offset", offset);
        params.put("size", size);
        
        // 목록 조회
        List<BoardDto> list = boardDao.selectBoardList(params);
        
        // 총 개수 조회
        int totalCount = boardDao.selectBoardCount(params);
        
        // 총 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // 결과 반환	
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCount", totalCount);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);
        
        return result;
    }
    
    /**
     * 게시글 상세 조회 (댓글 포함)
     * @param bdId 게시글 ID
     * @return 게시글 상세 정보 + 댓글 목록
     */
    @Transactional
    public Map<String, Object> getBoardDetail(Integer bdId) {
        // 조회수 증가
        boardDao.updateViewCount(bdId);
        
        // 게시글 조회
        BoardDto board = boardDao.selectBoardDetail(bdId);
        
        if (board == null) {
            return null;
        }
        
        // 댓글 목록 조회
        List<BoardCommentDto> allComments = boardCommentDao.selectCommentList(bdId);
        
        // 댓글과 답글 분리 (parent_id가 null이면 댓글, 있으면 답글)
        List<BoardCommentDto> comments = new ArrayList<>();
        Map<Integer, List<BoardCommentDto>> repliesMap = new HashMap<>();
        
        for (BoardCommentDto comment : allComments) {
            if (comment.getParentId() == null) {
                // 일반 댓글
                comments.add(comment);
            } else {
                // 답글 - 부모 댓글 ID별로 그룹화
                repliesMap.computeIfAbsent(comment.getParentId(), k -> new ArrayList<>()).add(comment);
            }
        }
        
        // 각 댓글에 답글 목록 설정
        for (BoardCommentDto comment : comments) {
            List<BoardCommentDto> replies = repliesMap.get(comment.getCmtId());
            comment.setReplies(replies != null ? replies : new ArrayList<>());
        }
        
        // 댓글 + 답글 총 개수
        int commentCount = boardCommentDao.selectCommentCount(bdId);
        
        // 결과 반환
        Map<String, Object> result = new HashMap<>();
        result.put("board", board);
        result.put("comments", comments);
        result.put("commentCount", commentCount);
        
        return result;
    }
    
    /**
     * 게시글 등록
     * @param boardDto 게시글 정보
     * @return 등록된 게시글 ID
     */
    @Transactional
    public Integer createBoard(BoardDto boardDto) {
        // 동행 게시글이면 모집상태 'RECRUITING'으로 설정
        if ("COMPANION".equals(boardDto.getBdCategory())) {
            boardDto.setRecruitStatus("RECRUITING");
        }
        
        // 게시글 등록
        boardDao.insertBoard(boardDto);
        
        return boardDto.getBdId();
    }
    
    /**
     * 게시글 수정
     * @param boardDto 게시글 정보
     * @return 성공 여부
     */
    @Transactional
    public boolean updateBoard(BoardDto boardDto) {
        int result = boardDao.updateBoard(boardDto);
        return result > 0;
    }
    
    /**
     * 게시글 삭제
     * @param bdId 게시글 ID
     * @return 성공 여부
     */
    @Transactional
    public boolean deleteBoard(Integer bdId) {
        int result = boardDao.deleteBoard(bdId);
        return result > 0;
    }
    
    /**
     * 모집 마감 (동행 게시글)
     * @param bdId 게시글 ID
     * @return 성공 여부
     */
    @Transactional
    public boolean closeRecruit(Integer bdId) {
        int result = boardDao.updateRecruitStatus(bdId);
        return result > 0;
    }
    
    /**
     * 게시글 작성자 확인
     * @param bdId 게시글 ID
     * @return 작성자 회원 ID
     */
    public Integer getBoardAuthor(Integer bdId) {
        BoardDto board = boardDao.selectBoardDetail(bdId);
        return board != null ? board.getMId() : null;
    }
    
    /**
     * 댓글/답글 등록
     * @param commentDto 댓글 정보
     * @return 등록된 댓글 ID
     */
    @Transactional
    public Integer createComment(BoardCommentDto commentDto) {
        boardCommentDao.insertComment(commentDto);
        return commentDto.getCmtId();
    }
    
    /**
     * 댓글/답글 삭제
     * @param cmtId 댓글 ID
     * @return 성공 여부
     */
    @Transactional
    public boolean deleteComment(Integer cmtId) {
        int result = boardCommentDao.deleteComment(cmtId);
        return result > 0;
    }
    
    /**
     * 댓글 작성자 확인
     * @param cmtId 댓글 ID
     * @return 작성자 회원 ID
     */
    public Integer getCommentAuthor(Integer cmtId) {
        return boardCommentDao.selectCommentAuthor(cmtId);
    }
}