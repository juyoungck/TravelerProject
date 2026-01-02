/**
 * markerIcons.ts
 * 관광 타입별 카카오맵 마커 아이콘 (SVG 기반)
 * 
 * 마커 색상:
 * - 관광지(12): 파랑 (#3B82F6)
 * - 문화시설(14): 보라 (#8B5CF6)
 * - 축제/공연(15): 주황 (#F97316)
 * - 여행코스(25): 청록 (#06B6D4)
 * - 레포츠(28): 초록 (#22C55E)
 * - 숙박(32): 분홍 (#EC4899)
 * - 쇼핑(38): 노랑 (#EAB308)
 * - 음식점(39): 빨강 (#EF4444)
 * 
 * 플래너 일차별 색상 (10일차까지):
 * - 1일차: 파랑, 2일차: 초록, 3일차: 주황, 4일차: 보라
 * - 5일차: 분홍, 6일차: 청록, 7일차: 빨강, 8일차: 노랑
 * - 9일차: 남색, 10일차 이상: 회색
 */

/** 마커 색상 정의 */
export const MARKER_COLORS: Record<string, string> = {
  '12': '#3B82F6', // 관광지 - 파랑
  '14': '#8B5CF6', // 문화시설 - 보라
  '15': '#F97316', // 축제/공연 - 주황
  '25': '#06B6D4', // 여행코스 - 청록
  '28': '#22C55E', // 레포츠 - 초록
  '32': '#EC4899', // 숙박 - 분홍
  '38': '#EAB308', // 쇼핑 - 노랑
  '39': '#EF4444', // 음식점 - 빨강
};

/** 마커 아이콘 이모지 (인포윈도우용) */
export const MARKER_EMOJI: Record<string, string> = {
  '12': '🏛️', // 관광지
  '14': '🎭', // 문화시설
  '15': '🎉', // 축제/공연
  '25': '🗺️', // 여행코스
  '28': '⛷️', // 레포츠
  '32': '🏨', // 숙박
  '38': '🛍️', // 쇼핑
  '39': '🍽️', // 음식점
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

/**
 * 관광 타입별 마커 SVG 생성
 * 드롭 핀 모양의 마커를 생성한다.
 * 
 * @param contenttypeid 관광 타입 ID
 * @returns SVG 문자열 (Data URL 형태)
 */
export const createMarkerSvg = (contenttypeid: string): string => {
  const color = MARKER_COLORS[contenttypeid] || '#6B7280'; // 기본 회색
  
  // SVG 마커 (드롭 핀 모양 + 내부 아이콘)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <!-- 마커 핀 모양 (그림자) -->
      <ellipse cx="18" cy="46" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
      
      <!-- 마커 핀 본체 -->
      <path d="M18 0C8.06 0 0 8.06 0 18c0 12.62 16.19 28.4 16.88 29.1.55.54 1.42.9 2.12.9s1.57-.36 2.12-.9C21.81 46.4 36 30.62 36 18 36 8.06 27.94 0 18 0z" 
            fill="${color}"/>
      
      <!-- 내부 원 (흰색 배경) -->
      <circle cx="18" cy="16" r="10" fill="white"/>
      
      <!-- 타입별 아이콘 -->
      ${getMarkerIcon(contenttypeid)}
    </svg>
  `;
  
  // SVG를 Data URL로 변환
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
};

/**
 * 관광 타입별 내부 아이콘 SVG 경로
 */
const getMarkerIcon = (contenttypeid: string): string => {
  const color = MARKER_COLORS[contenttypeid] || '#6B7280';
  
  switch (contenttypeid) {
    case '12': // 관광지 - 카메라 아이콘
      return `<path d="M12 12h12v1h-12zM13 13h10v8h-10zM15 14h2v2h-2zM19 14h2v2h-2z" fill="${color}"/>
              <circle cx="18" cy="17" r="3" fill="${color}"/>`;
    
    case '14': // 문화시설 - 건물 아이콘
      return `<path d="M18 9l-8 4v2h16v-2l-8-4zM11 16v7h3v-4h8v4h3v-7h-14z" fill="${color}"/>`;
    
    case '15': // 축제/공연 - 별 아이콘
      return `<path d="M18 10l2 5h5l-4 3 1.5 5-4.5-3-4.5 3 1.5-5-4-3h5z" fill="${color}"/>`;
    
    case '25': // 여행코스 - 경로 아이콘
      return `<path d="M12 12c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM20 20c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM14 14l8 4" 
              stroke="${color}" stroke-width="2" fill="none"/>`;
    
    case '28': // 레포츠 - 자전거 아이콘
      return `<circle cx="14" cy="18" r="3" stroke="${color}" stroke-width="1.5" fill="none"/>
              <circle cx="22" cy="18" r="3" stroke="${color}" stroke-width="1.5" fill="none"/>
              <path d="M14 18l4-6 4 6M18 12v6" stroke="${color}" stroke-width="1.5" fill="none"/>`;
    
    case '32': // 숙박 - 침대 아이콘
      return `<path d="M10 19h16v2h-16zM10 15h6v4h-6zM17 13h8v6h-8z" fill="${color}"/>
              <circle cx="13" cy="14" r="2" fill="${color}"/>`;
    
    case '38': // 쇼핑 - 쇼핑백 아이콘
      return `<path d="M12 13h12v10h-12zM15 11v2M21 11v2" stroke="${color}" stroke-width="1.5" fill="none"/>
              <path d="M12 13h12v10h-12z" stroke="${color}" stroke-width="1.5" fill="none"/>`;
    
    case '39': // 음식점 - 포크&나이프 아이콘
      return `<path d="M14 10v6c0 1 1 2 2 2v5M22 10v5c0 2-2 3-2 3v5M14 10c0 2 1 3 2 3M22 10c0 0 0 3-2 3" 
              stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    
    default: // 기본 - 위치 핀 아이콘
      return `<circle cx="18" cy="16" r="4" fill="${color}"/>`;
  }
};

/**
 * 플래너용 일차별 마커 SVG 생성
 * 일차별로 다른 색상 + 순서 번호가 표시된 마커
 * 
 * @param dayNumber 일차 번호 (1, 2, 3...)
 * @param orderNumber 해당 일차 내 순서 번호 (1, 2, 3...)
 * @returns SVG 문자열 (Data URL 형태)
 */
export const createPlannerMarkerSvg = (dayNumber: number, orderNumber: number): string => {
  // ★ 확장된 일차별 색상 사용
  const color = getPlannerDayColor(dayNumber);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- 원형 배경 -->
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
      
      <!-- 순서 번호 -->
      <text x="16" y="21" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="14" font-weight="bold">
        ${orderNumber}
      </text>
    </svg>
  `;
  
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
};

/**
 * 사용자 현재 위치 마커 SVG
 * 파란색 점 + 물결 효과
 */
export const createCurrentLocationMarkerSvg = (): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <!-- 외부 물결 효과 -->
      <circle cx="12" cy="12" r="10" fill="rgba(59, 130, 246, 0.2)"/>
      <circle cx="12" cy="12" r="6" fill="rgba(59, 130, 246, 0.4)"/>
      
      <!-- 중심 점 -->
      <circle cx="12" cy="12" r="4" fill="#3B82F6" stroke="white" stroke-width="2"/>
    </svg>
  `;
  
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
};

/**
 * 선택된 마커 SVG (크기가 더 큰 버전)
 * 
 * @param contenttypeid 관광 타입 ID
 * @returns SVG 문자열 (Data URL 형태)
 */
export const createSelectedMarkerSvg = (contenttypeid: string): string => {
  const color = MARKER_COLORS[contenttypeid] || '#6B7280';
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="58" viewBox="0 0 44 58">
      <!-- 그림자 -->
      <ellipse cx="22" cy="55" rx="8" ry="3" fill="rgba(0,0,0,0.3)"/>
      
      <!-- 외곽선 효과 -->
      <path d="M22 0C10 0 0 10 0 22c0 15.5 20 34 21 35 .7.6 1.6 1 2.5 1s1.8-.4 2.5-1c1-1 21-19.5 21-35C44 10 34 0 22 0z" 
            fill="white"/>
      
      <!-- 마커 본체 -->
      <path d="M22 3C12 3 3 12 3 22c0 13.5 17.5 30 18.4 31 .4.4 1 .6 1.6.6s1.2-.2 1.6-.6c.9-1 18.4-17.5 18.4-31C43 12 34 3 22 3z" 
            fill="${color}"/>
      
      <!-- 내부 원 -->
      <circle cx="22" cy="19" r="12" fill="white"/>
      
      <!-- 체크 아이콘 -->
      <path d="M16 19l4 4 8-8" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
};
