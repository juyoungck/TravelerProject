/**
 * plannerApi.ts - 플래너 API 호출 함수
 * 백엔드의 플래너 관련 API를 호출하는 함수들
 */

import api from './api';

// ==================== 타입 정의 ====================

/** 장소 정보 (요청용) */
export interface PlaceRequest {
  contentid: string;
  sortOrder: number;
}

/** 일차별 계획 (요청용) */
export interface DayPlanRequest {
  dayNumber: number;
  tripDate: string; // yyyy-MM-dd
  memo?: string;
  places: PlaceRequest[];
}

/** 플래너 생성/수정 요청 */
export interface PlannerRequest {
  mId: number;
  plnTitle: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  isPublic: number;  // 0: 비공개, 1: 공개
  dayPlans: DayPlanRequest[];
}

/** 장소 상세 정보 (응답용) */
export interface PlaceDetail {
  placeId: number;
  contentid: string;
  sortOrder: number;
  title: string;
  addr1: string;
  firstimage: string;
  contenttypeid: string;
  mapx: string;
  mapy: string;
}

/** 일차별 계획 상세 (응답용) */
export interface DayPlanDetail {
  dayId: number;
  dayNumber: number;
  tripDate: string;
  memo: string;
  places: PlaceDetail[];
}

/** 플래너 상세 정보 (응답용) */
export interface PlannerDetail {
  plnId: number;
  mId: number;
  authorNickname: string;
  plnTitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  lDongRegnCd: string;
  lDongSignguCd: string;
  regionName: string;
  shareLink: string;
  isPublic: number;
  createdAt: string;
  updatedAt: string;
  favoriteCount: number;
  dayPlans: DayPlanDetail[];
}

/** 플래너 목록 아이템 (응답용) */
export interface PlannerListItem {
  plnId: number;
  mId: number;
  authorNickname: string;
  plnTitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  regionName: string;
  isPublic: number;
  createdAt: string;
  thumbnailImage: string;
  favoriteCount: number;
}

/** 페이징 응답 */
export interface PlannerListResponse {
  status: string;
  planners: PlannerListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// ==================== API 함수 ====================

/**
 * 플래너 생성
 * @param data 플래너 생성 데이터
 * @returns 생성된 플래너 상세 정보
 */
export const createPlanner = async (data: PlannerRequest): Promise<PlannerDetail> => {
  const response = await api.post('/planner', data);
  return response.data.data;
};

/**
 * 플래너 수정 (저장)
 * @param plnId 플래너 ID
 * @param data 플래너 수정 데이터
 * @returns 수정된 플래너 상세 정보
 */
export const updatePlanner = async (plnId: number, data: PlannerRequest): Promise<PlannerDetail> => {
  const response = await api.put(`/planner/${plnId}`, data);
  return response.data.data;
};

/**
 * 플래너 삭제
 * @param plnId 플래너 ID
 */
export const deletePlanner = async (plnId: number): Promise<void> => {
  await api.delete(`/planner/${plnId}`);
};

/**
 * 플래너 상세 조회
 * @param plnId 플래너 ID
 * @returns 플래너 상세 정보
 */
export const getPlannerDetail = async (plnId: number): Promise<PlannerDetail> => {
  const response = await api.get(`/planner/${plnId}`);
  return response.data.data;
};

/**
 * 내 플래너 목록 조회
 * @param mId 회원 ID
 * @param page 페이지 번호 (1부터 시작)
 * @param size 페이지 크기
 * @returns 플래너 목록과 페이징 정보
 */
export const getMyPlannerList = async (
  mId: number,
  page: number = 1,
  size: number = 10
): Promise<PlannerListResponse> => {
  const response = await api.get('/planner/my', {
    params: { mId, page, size }
  });
  return response.data;
};

/**
 * 인기 플래너 목록 조회
 * @param page 페이지 번호 (1부터 시작)
 * @param size 페이지 크기
 * @returns 플래너 목록과 페이징 정보
 */
export const getPopularPlannerList = async (
  page: number = 1,
  size: number = 10
): Promise<PlannerListResponse> => {
  const response = await api.get('/planner/popular', {
    params: { page, size }
  });
  return response.data;
};

/**
 * 공유 링크 생성
 * @param plnId 플래너 ID
 * @returns 생성된 공유 링크
 */
export const createShareLink = async (plnId: number): Promise<string> => {
  const response = await api.post(`/planner/${plnId}/share`);
  return response.data.shareLink;
};

/**
 * 공유 링크로 플래너 조회
 * @param shareLink 공유 링크
 * @returns 플래너 상세 정보
 */
export const getPlannerByShareLink = async (shareLink: string): Promise<PlannerDetail> => {
  const response = await api.get(`/planner/share/${shareLink}`);
  return response.data.data;
};
