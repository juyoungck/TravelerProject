/**
 * festivalApi.ts - 축제/공연/행사 API
 * 한국관광공사 OpenAPI 데이터 조회
 * 
 * 여행코스는 DB에서 조회 (contenttypeid=25)
 */

import api from './api';

/**
 * 축제/공연/행사 타입
 * - all: 전체
 * - festival: 축제 (EV01)
 * - performance: 공연 (EV02)
 * - event: 행사 (EV03)
 */
export type FestivalType = 'all' | 'festival' | 'performance' | 'event';

/**
 * 축제/공연/행사 데이터 인터페이스
 */
export interface FestivalItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  tel: string;
  firstimage: string;
  firstimage2: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  eventstartdate: string;
  eventenddate: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
  category: '축제' | '공연' | '행사' | '여행코스';
}

/**
 * 코스 경유지 인터페이스
 */
export interface CourseSpot {
  subnum: string;
  subname: string;
  subdetailoverview: string;
  subdetailimg: string;
  subdetailalt: string;
  subcontentid: string;
  mapx: string;
  mapy: string;
}

/**
 * 축제/공연/행사 목록 조회
 * 
 * @param type 타입 (all, festival, performance, event)
 * @param page 페이지 번호
 * @param size 페이지 크기
 * @returns API 응답
 */
export const getFestivalList = async (
  type: FestivalType = 'all',
  page: number = 1,
  size: number = 12
) => {
  const response = await api.get('/festival', {
    params: { type, page, size }
  });
  return response.data;
};

/**
 * 콘텐츠 이미지 목록 조회
 * 
 * @param contentId 콘텐츠 ID
 * @returns 이미지 URL 배열
 */
export const getFestivalImages = async (contentId: string) => {
  const response = await api.get(`/festival/images/${contentId}`);
  return response.data;
};

/**
 * 코스 경유지(상세정보) 조회
 * OpenAPI detailInfo2 사용
 * 
 * @param contentId 코스 콘텐츠 ID
 * @returns 경유지 목록
 */
export const getCourseDetail = async (contentId: string) => {
  const response = await api.get(`/festival/course/${contentId}`);
  return response.data;
};