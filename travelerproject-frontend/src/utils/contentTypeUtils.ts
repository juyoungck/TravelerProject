/**
 * contentTypeUtils.ts - 콘텐츠 타입 공통 유틸
 * 
 * 카테고리별 이름, 색상, 마커 색상 정의
 * 사용처: 여행지 리스트, 여행지 상세, 플래너, 통합검색, 지도, 마이페이지
 * 
 * 색상 정의:
 * - 관광(12): 파랑
 * - 문화(14): 보라
 * - 이벤트(15, 25): 주황 (축제/공연/행사/여행코스)
 * - 레저(28): 초록
 * - 숙박(32): 빨강
 * - 쇼핑(38): 핑크
 * - 음식(39): 노랑
 * - 기타: 회색
 * 
 * @author TravelerProject
 */

/** 콘텐츠 타입 스타일 인터페이스 */
export interface ContentTypeStyle {
  name: string;           // 표시 이름
  bgColor: string;        // 배경 색상 (Tailwind class)
  textColor: string;      // 텍스트 색상 (Tailwind class)
  markerColor: string;    // 지도 마커 색상 (HEX)
  emoji: string;          // 이모지 (인포윈도우용)
}

/** 
 * 콘텐츠 타입별 스타일 정의
 */
export const CONTENT_TYPE_STYLES: { [key: string]: ContentTypeStyle } = {
  '12': { 
    name: '관광', 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-600',
    markerColor: '#3B82F6',  // blue-500
    emoji: '🏛️'
  },
  '14': { 
    name: '문화', 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-600',
    markerColor: '#8B5CF6',  // purple-500
    emoji: '🎭'
  },
  '15': { 
    name: '이벤트', 
    bgColor: 'bg-orange-100', 
    textColor: 'text-orange-600',
    markerColor: '#F97316',  // orange-500
    emoji: '🎉'
  },
  '25': { 
    name: '이벤트', 
    bgColor: 'bg-orange-100', 
    textColor: 'text-orange-600',
    markerColor: '#F97316',  // orange-500
    emoji: '🗺️'
  },
  '28': { 
    name: '레저', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-600',
    markerColor: '#22C55E',  // green-500
    emoji: '⛷️'
  },
  '32': { 
    name: '숙박', 
    bgColor: 'bg-red-100', 
    textColor: 'text-red-600',
    markerColor: '#EF4444',  // red-500
    emoji: '🏨'
  },
  '38': { 
    name: '쇼핑', 
    bgColor: 'bg-pink-100', 
    textColor: 'text-pink-600',
    markerColor: '#EC4899',  // pink-500
    emoji: '🛍️'
  },
  '39': { 
    name: '음식', 
    bgColor: 'bg-yellow-100', 
    textColor: 'text-yellow-700',
    markerColor: '#EAB308',  // yellow-500
    emoji: '🍽️'
  },
};

/** 기본 스타일 (매칭되지 않을 때) */
export const DEFAULT_CONTENT_TYPE_STYLE: ContentTypeStyle = {
  name: '기타',
  bgColor: 'bg-gray-100',
  textColor: 'text-gray-600',
  markerColor: '#6B7280',  // gray-500
  emoji: '📍'
};

/**
 * 콘텐츠 타입 ID로 스타일 가져오기
 * @param typeId 콘텐츠 타입 ID (예: '12', '14', ...)
 * @returns ContentTypeStyle 객체
 */
export const getContentTypeStyle = (typeId: string | undefined | null): ContentTypeStyle => {
  if (!typeId) return DEFAULT_CONTENT_TYPE_STYLE;
  return CONTENT_TYPE_STYLES[typeId] || DEFAULT_CONTENT_TYPE_STYLE;
};

/**
 * 콘텐츠 타입 이름만 가져오기 (하위 호환용)
 * @param typeId 콘텐츠 타입 ID
 * @returns 타입 이름
 */
export const getContentTypeName = (typeId: string | undefined | null): string => {
  return getContentTypeStyle(typeId).name;
};

/**
 * 콘텐츠 타입 마커 색상 가져오기
 * @param typeId 콘텐츠 타입 ID
 * @returns HEX 색상 코드
 */
export const getContentTypeMarkerColor = (typeId: string | undefined | null): string => {
  return getContentTypeStyle(typeId).markerColor;
};

/**
 * 콘텐츠 타입 이모지 가져오기
 * @param typeId 콘텐츠 타입 ID
 * @returns 이모지 문자
 */
export const getContentTypeEmoji = (typeId: string | undefined | null): string => {
  return getContentTypeStyle(typeId).emoji;
};

/**
 * 카테고리 태그 렌더링용 클래스 문자열 생성
 * @param typeId 콘텐츠 타입 ID
 * @returns Tailwind 클래스 문자열
 */
export const getContentTypeClasses = (typeId: string | undefined | null): string => {
  const style = getContentTypeStyle(typeId);
  return `${style.bgColor} ${style.textColor}`;
};

/**
 * 필터용 콘텐츠 타입 목록 (축제/여행코스 제외 - 메인 필터용)
 */
export const FILTER_CONTENT_TYPES: { [key: string]: string } = {
  '12': '관광',
  '14': '문화',
  '28': '레저',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식',
};

/**
 * 마커 색상 맵 (markerIcons.ts 호환용)
 * KakaoMap.tsx 등에서 직접 색상 조회 시 사용
 */
export const MARKER_COLORS: Record<string, string> = {
  '12': '#3B82F6', // 관광 - 파랑
  '14': '#8B5CF6', // 문화 - 보라
  '15': '#F97316', // 이벤트 - 주황
  '25': '#F97316', // 이벤트 - 주황
  '28': '#22C55E', // 레저 - 초록
  '32': '#EF4444', // 숙박 - 빨강
  '38': '#EC4899', // 쇼핑 - 핑크
  '39': '#EAB308', // 음식 - 노랑
};

/**
 * 마커 이모지 맵 (인포윈도우용)
 */
export const MARKER_EMOJI: Record<string, string> = {
  '12': '🏛️', // 관광
  '14': '🎭', // 문화
  '15': '🎉', // 이벤트
  '25': '🗺️', // 이벤트(코스)
  '28': '⛷️', // 레저
  '32': '🏨', // 숙박
  '38': '🛍️', // 쇼핑
  '39': '🍽️', // 음식
};

/**
 * 콘텐츠 타입 이름 맵 (mapApi.ts 호환용)
 */
export const CONTENT_TYPE_NAME: Record<string, string> = {
  '12': '관광',
  '14': '문화',
  '15': '이벤트',
  '25': '이벤트',
  '28': '레저',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식',
};

/** ★ 플래너 일차별 색상 배열 (10일차까지 지원) */
export const PLANNER_DAY_COLORS: string[] = [
  '#3B82F6', // 1일차 - 파랑
  '#22C55E', // 2일차 - 초록
  '#F97316', // 3일차 - 주황
  '#8B5CF6', // 4일차 - 보라
  '#EC4899', // 5일차 - 분홍
  '#06B6D4', // 6일차 - 청록
  '#EF4444', // 7일차 - 빨강
  '#EAB308', // 8일차 - 노랑
  '#6366F1', // 9일차 - 남색 (인디고)
  '#6B7280', // 10일차 이상 - 회색
];

/**
 * 일차 번호에 따른 색상 반환
 * @param dayNumber 일차 번호 (1부터 시작)
 * @returns 색상 코드
 */
export const getPlannerDayColor = (dayNumber: number): string => {
  const index = Math.min(dayNumber - 1, PLANNER_DAY_COLORS.length - 1);
  return PLANNER_DAY_COLORS[Math.max(0, index)];
};

export default {
  CONTENT_TYPE_STYLES,
  DEFAULT_CONTENT_TYPE_STYLE,
  FILTER_CONTENT_TYPES,
  MARKER_COLORS,
  MARKER_EMOJI,
  CONTENT_TYPE_NAME,
  PLANNER_DAY_COLORS,
  getContentTypeStyle,
  getContentTypeName,
  getContentTypeMarkerColor,
  getContentTypeEmoji,
  getContentTypeClasses,
  getPlannerDayColor,
};
