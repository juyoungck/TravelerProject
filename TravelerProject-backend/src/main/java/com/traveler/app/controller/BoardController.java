package com.traveler.app.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.traveler.app.dto.BoardDto;
import com.traveler.app.dto.BoardCommentDto;
import com.traveler.app.service.BoardService;

/**
 * BoardController - 게시판 REST API 컨트롤러
 * 게시글 및 댓글 CRUD API 제공
 */
@RestController
@RequestMapping("/api/board")
public class BoardController {
    
    @Autowired
    private BoardService boardService;
    
    /**
     * 게시글 목록 조회
     * GET /api/board/list?category=COMPANION&keyword=제주&page=1&size=10
     * category: ALL(전체), COMPANION(동행), REVIEW(후기)
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getBoardList(
            @RequestParam(name = "category", defaultValue = "ALL") String category,
            @RequestParam(name = "searchType", defaultValue = "TITLE") String searchType,
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        try {
            Map<String, Object> result = boardService.getBoardList(category, searchType, keyword, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", result.get("list"));
            response.put("totalCount", result.get("totalCount"));
            response.put("totalPages", result.get("totalPages"));
            response.put("currentPage", result.get("currentPage"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "게시글 목록 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 게시글 상세 조회 (댓글 포함)
     * GET /api/board/{bdId}
     */
    @GetMapping("/{bdId}")
    public ResponseEntity<Map<String, Object>> getBoardDetail(
            @PathVariable("bdId") Integer bdId) {
        
        try {
            Map<String, Object> result = boardService.getBoardDetail(bdId);
            
            if (result == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "게시글을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "게시글 상세 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 게시글 등록
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBoard(@RequestBody BoardDto boardDto) {
        
        try {
            // 필수값 검증 (기존 코드 유지)
            if (boardDto.getMId() == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // ... 기존 검증 코드 ...
            
            Integer bdId = boardService.createBoard(boardDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "게시글이 등록되었습니다.");
            response.put("bdId", bdId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            // ★★★ 여기 수정! 에러 상세 출력 ★★★
            e.printStackTrace();  // 콘솔에 전체 에러 출력
            
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "게시글 등록 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 게시글 수정
     * PUT /api/board/{bdId}
     * Body: { mId, bdTitle, bdContent, plnId, bdRating }
     */
    @PutMapping("/{bdId}")
    public ResponseEntity<Map<String, Object>> updateBoard(
            @PathVariable("bdId") Integer bdId,
            @RequestBody BoardDto boardDto) {
        
        try {
            // 작성자 확인
            Integer authorId = boardService.getBoardAuthor(bdId);
            if (authorId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "게시글을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            if (!authorId.equals(boardDto.getMId())) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "수정 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            boardDto.setBdId(bdId);
            boolean success = boardService.updateBoard(boardDto);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "게시글이 수정되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "게시글 수정 실패");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "게시글 수정 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 게시글 삭제
     * DELETE /api/board/{bdId}?mId=1
     */
    @DeleteMapping("/{bdId}")
    public ResponseEntity<Map<String, Object>> deleteBoard(
            @PathVariable("bdId") Integer bdId,
            @RequestParam(name = "mId") Integer mId) {
        
        try {
            // 작성자 확인
            Integer authorId = boardService.getBoardAuthor(bdId);
            if (authorId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "게시글을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            if (!authorId.equals(mId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "삭제 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            boolean success = boardService.deleteBoard(bdId);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "게시글이 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "게시글 삭제 실패");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "게시글 삭제 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 모집 마감 (동행 게시글)
     * PUT /api/board/{bdId}/close?mId=1
     */
    @PutMapping("/{bdId}/close")
    public ResponseEntity<Map<String, Object>> closeRecruit(
            @PathVariable("bdId") Integer bdId,
            @RequestParam(name = "mId") Integer mId) {
        
        try {
            // 작성자 확인
            Integer authorId = boardService.getBoardAuthor(bdId);
            if (authorId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "게시글을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            if (!authorId.equals(mId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "모집 마감 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            boolean success = boardService.closeRecruit(bdId);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "모집이 마감되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "모집 마감 실패");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "모집 마감 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 댓글/답글 등록
     * POST /api/board/comment
     * Body: { bdId, mId, parentId, cmtContent }
     */
    @PostMapping("/comment")
    public ResponseEntity<Map<String, Object>> createComment(@RequestBody BoardCommentDto commentDto) {
        
        try {
            // 필수값 검증
            if (commentDto.getMId() == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            if (commentDto.getBdId() == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "게시글 ID가 필요합니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (commentDto.getCmtContent() == null || commentDto.getCmtContent().trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "댓글 내용을 입력해주세요.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            Integer cmtId = boardService.createComment(commentDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "댓글이 등록되었습니다.");
            response.put("cmtId", cmtId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "댓글 등록 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 댓글/답글 삭제
     * DELETE /api/board/comment/{cmtId}?mId=1
     */
    @DeleteMapping("/comment/{cmtId}")
    public ResponseEntity<Map<String, Object>> deleteComment(
            @PathVariable("cmtId") Integer cmtId,
            @RequestParam(name = "mId") Integer mId) {
        
        try {
            // 작성자 확인
            Integer authorId = boardService.getCommentAuthor(cmtId);
            if (authorId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "댓글을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            if (!authorId.equals(mId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "삭제 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            boolean success = boardService.deleteComment(cmtId);
            
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "댓글이 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "댓글 삭제 실패");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "댓글 삭제 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}