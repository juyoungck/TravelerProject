import api from './api';

/**
 * boardApi.ts - 게시판 API 호출 함수
 * 게시글 및 댓글 CRUD API 연동
 */

/** 게시글 목록 조회 */
export const getBoardList = async (
  category: string = 'ALL',
  keyword: string = '',
  page: number = 1,
  size: number = 10
) => {
  const response = await api.get('/board/list', {
    params: { category, keyword, page, size }
  });
  return response.data;
};

/** 게시글 상세 조회 (댓글 포함) */
export const getBoardDetail = async (bdId: number) => {
  const response = await api.get(`/board/${bdId}`);
  return response.data;
};

/** 게시글 등록 */
export const createBoard = async (boardData: {
  mId: number;
  bdCategory: string;
  bdTitle: string;
  bdContent: string;
  plnId?: number;
  bdRating?: number;
}) => {
  const response = await api.post('/board', boardData);
  return response.data;
};

/** 게시글 수정 */
export const updateBoard = async (
  bdId: number,
  boardData: {
    mId: number;
    bdTitle: string;
    bdContent: string;
    plnId?: number;
    bdRating?: number;
  }
) => {
  const response = await api.put(`/board/${bdId}`, boardData);
  return response.data;
};

/** 게시글 삭제 */
export const deleteBoard = async (bdId: number, mId: number) => {
  const response = await api.delete(`/board/${bdId}`, {
    params: { mId }
  });
  return response.data;
};

/** 모집 마감 (동행 게시글) */
export const closeRecruit = async (bdId: number, mId: number) => {
  const response = await api.put(`/board/${bdId}/close`, null, {
    params: { mId }
  });
  return response.data;
};

/** 댓글/답글 등록 */
export const createComment = async (commentData: {
  bdId: number;
  mId: number;
  parentId?: number;
  cmtContent: string;
}) => {
  const response = await api.post('/board/comment', commentData);
  return response.data;
};

/** 댓글/답글 삭제 */
export const deleteComment = async (cmtId: number, mId: number) => {
  const response = await api.delete(`/board/comment/${cmtId}`, {
    params: { mId }
  });
  return response.data;
};