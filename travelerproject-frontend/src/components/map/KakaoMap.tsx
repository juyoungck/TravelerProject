/**
 * KakaoMap.tsx
 * 카카오맵 공통 컴포넌트
 * 
 * 기능:
 * - 여행지 마커 표시 (카테고리별 색상)
 * - 인포윈도우 (이미지, 정보, 찜 버튼, 상세보기)
 * - 플래너 마커 (일차별 색상 + 순서 번호)
 * - 플래너 경로 선 그리기 (일차별 색상)
 * - 현재 위치 표시
 * 
 * ★ 색상은 contentTypeUtils.ts에서 통합 관리
 * 
 * @author TravelerProject
 */

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { NearbyDestination } from '../../api/mapApi';
import { 
  createMarkerSvg, 
  createSelectedMarkerSvg, 
  createCurrentLocationMarkerSvg, 
  createPlannerMarkerSvg,
  MARKER_COLORS
} from '../../utils/markerIcons';
import { 
  getContentTypeName,
  getPlannerDayColor 
} from '../../utils/contentTypeUtils';

const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

// 카카오맵 스크립트 로드 여부 체크
let isKakaoLoaded = false;
let isKakaoLoading = false;
const loadCallbacks: (() => void)[] = [];

const loadKakaoMap = (callback: () => void) => {
  if (isKakaoLoaded && window.kakao?.maps) {
    callback();
    return;
  }
  
  loadCallbacks.push(callback);
  
  if (isKakaoLoading) return;
  
  isKakaoLoading = true;
  
  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
  script.async = true;
  
  script.onload = () => {
    window.kakao.maps.load(() => {
      isKakaoLoaded = true;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    });
  };
  
  document.head.appendChild(script);
};

interface KakaoMapProps {
  centerLat?: number;
  centerLng?: number;
  level?: number;
  destinations?: NearbyDestination[];
  plannerPlaces?: PlannerPlace[];
  showCurrentLocation?: boolean;
  currentLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (destination: NearbyDestination) => void;
  onPlannerMarkerClick?: (place: PlannerPlace) => void;
  onMapMoved?: (lat: number, lng: number) => void;
  onMapClick?: () => void;
  onNavigateToDetail?: (contentid: string) => void;
  onToggleFavorite?: (destination: NearbyDestination) => void;
  isFavorite?: (contentid: string) => boolean;
  className?: string;
  height?: string;
}

export interface PlannerPlace {
  contentid: string;
  contenttypeid?: string;
  title: string;
  mapx: number;
  mapy: number;
  dayNumber: number;
  orderNumber: number;
  addr1?: string;
  firstimage?: string;
  firstimage2?: string;
}

export interface KakaoMapRef {
  panTo: (lat: number, lng: number) => void;
  setCenter: (lat: number, lng: number, level?: number) => void;
  setLevel: (level: number) => void;
  getCenter: () => { lat: number; lng: number } | null;
  selectMarker: (contentid: string) => void;
  selectPlannerMarker: (contentid: string) => void;
  closeInfoWindow: () => void;
  fitBounds: () => void;
  relayout: () => void;
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };
const DEFAULT_LEVEL = 5;

const KakaoMap = forwardRef<KakaoMapRef, KakaoMapProps>(({
  centerLat = DEFAULT_CENTER.lat,
  centerLng = DEFAULT_CENTER.lng,
  level = DEFAULT_LEVEL,
  destinations = [],
  plannerPlaces = [],
  showCurrentLocation = false,
  currentLocation = null,
  onMarkerClick,
  onPlannerMarkerClick,
  onMapMoved,
  onMapClick,
  onToggleFavorite,
  isFavorite,
  className = '',
  height = '100%',
}, ref) => {
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const plannerMarkersRef = useRef<kakao.maps.Marker[]>([]);
  const polylinesRef = useRef<kakao.maps.Polyline[]>([]);
  const infoWindowRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const plannerInfoWindowRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const currentLocationMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const destinationsMapRef = useRef<Map<string, NearbyDestination>>(new Map());
  const markerDestMapRef = useRef<Map<kakao.maps.Marker, NearbyDestination>>(new Map());
  const selectedMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const plannerMarkerMapRef = useRef<Map<string, kakao.maps.Marker>>(new Map());
  const plannerPlacesMapRef = useRef<Map<string, PlannerPlace>>(new Map());
  
  const onToggleFavoriteRef = useRef(onToggleFavorite);
  const isFavoriteRef = useRef(isFavorite);
  
  useEffect(() => {
    onToggleFavoriteRef.current = onToggleFavorite;
  }, [onToggleFavorite]);
  
  useEffect(() => {
    isFavoriteRef.current = isFavorite;
  }, [isFavorite]);

  /** 마커 이미지 원복 */
  const resetMarkerImage = useCallback((marker: kakao.maps.Marker, destination: NearbyDestination) => {
    const src = createMarkerSvg(destination.contenttypeid);
    const size = new kakao.maps.Size(36, 48);
    const option = { offset: new kakao.maps.Point(18, 48) };
    marker.setImage(new kakao.maps.MarkerImage(src, size, option));
  }, []);

  /** 인포윈도우 닫기 */
  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.setMap(null);
    }
    if (selectedMarkerRef.current) {
      const dest = markerDestMapRef.current.get(selectedMarkerRef.current);
      if (dest) {
        resetMarkerImage(selectedMarkerRef.current, dest);
      }
      selectedMarkerRef.current = null;
    }
  }, [resetMarkerImage]);

  /** 플래너 인포윈도우 닫기 */
  const closePlannerInfoWindow = useCallback(() => {
    if (plannerInfoWindowRef.current) {
      plannerInfoWindowRef.current.setMap(null);
      plannerInfoWindowRef.current = null;
    }
  }, []);

  /** 인포윈도우 DOM 요소 생성 */
  const createInfoWindowElement = useCallback((destination: NearbyDestination): HTMLElement => {
    const color = MARKER_COLORS[destination.contenttypeid] || '#6B7280';
    const imageUrl = destination.firstimage2 || destination.firstimage;

    const favorited = isFavoriteRef.current
      ? isFavoriteRef.current(destination.contentid)
      : false;

    let distanceText = '';
    if (destination.distance !== null && destination.distance !== undefined) {
      distanceText =
        destination.distance < 1
          ? `${Math.round(destination.distance * 1000)}m`
          : `${destination.distance}km`;
    }

    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      width: 280px;
      padding: 12px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: default;
    `;

    container.addEventListener('mousedown', e => e.stopPropagation());
    container.addEventListener('touchstart', e => e.stopPropagation());

    /** 닫기 버튼 */
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border: none;
      background: rgba(243,244,246,0.9);
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      color: #6b7280;
      z-index: 10;
    `;
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeInfoWindow();
    });
    container.appendChild(closeBtn);

    /** 이미지 영역 */
    if (imageUrl) {
      const imgContainer = document.createElement('div');
      imgContainer.style.cssText = `
        width: 100%;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 10px;
      `;

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = destination.title;
      img.style.cssText = `width: 100%; height: 100%; object-fit: cover;`;
      img.onerror = () => { imgContainer.style.display = 'none'; };

      imgContainer.appendChild(img);
      container.appendChild(imgContainer);
    }

    /** 타입 + 거리 + 찜 버튼 */
    const badgeContainer = document.createElement('div');
    badgeContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      padding-right: ${imageUrl ? '0' : '30px'};
    `;

    // ★ contentTypeUtils의 getContentTypeName 사용
    const badge = document.createElement('span');
    badge.innerHTML = `${getContentTypeName(destination.contenttypeid)}`;
    badge.style.cssText = `
      background: ${color}20;
      color: ${color};
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    `;
    badgeContainer.appendChild(badge);

    if (distanceText) {
      const distance = document.createElement('span');
      distance.textContent = distanceText;
      distance.style.cssText = `font-size: 11px; color: #9ca3af;`;
      badgeContainer.appendChild(distance);
    }

    /** 찜 버튼 */
    const favoriteBtn = document.createElement('button');
    favoriteBtn.style.cssText = `
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
      transition: transform 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const updateFavoriteIcon = (isFav: boolean) => {
      if (isFav) {
        // 채운 하트 (빨간색)
        favoriteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        `;
      } else {
        // 빈 하트 (테두리만)
        favoriteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        `;
      }
    };

    updateFavoriteIcon(favorited);

    favoriteBtn.addEventListener('mouseenter', () => {
      favoriteBtn.style.transform = 'scale(1.15)';
    });
    favoriteBtn.addEventListener('mouseleave', () => {
      favoriteBtn.style.transform = 'scale(1)';
    });
    favoriteBtn.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();

      if (onToggleFavoriteRef.current) {
        onToggleFavoriteRef.current(destination);
        const wasActive = favoriteBtn.querySelector('svg')?.getAttribute('fill') === '#EF4444';
        updateFavoriteIcon(!wasActive);
      } else {
        alert('로그인이 필요한 기능입니다.');
      }
    });
    badgeContainer.appendChild(favoriteBtn);

    container.appendChild(badgeContainer);

    /** 제목 */
    const title = document.createElement('h3');
    title.textContent = destination.title;
    title.style.cssText = `
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      padding-right: 30px;
    `;
    container.appendChild(title);

    /** 주소 */
    const addr = document.createElement('p');
    addr.textContent = destination.addr1 || '주소 정보 없음';
    addr.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 13px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    container.appendChild(addr);

    /** 상세 버튼 */
    const detailBtn = document.createElement('button');
    detailBtn.textContent = '상세정보 보기 ↗';
    detailBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      background: ${color};
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    `;

    detailBtn.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      window.open(
        `${window.location.origin}/?page=travel-detail&contentid=${destination.contentid}`,
        '_blank'
      );
      closeInfoWindow();
    });

    container.appendChild(detailBtn);

    /** 말풍선 꼬리 */
    const tail = document.createElement('div');
    tail.style.cssText = `
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid white;
    `;
    container.appendChild(tail);

    return container;
  }, [closeInfoWindow]);

  /** 플래너 마커용 인포윈도우 DOM 요소 생성 */
  const createPlannerInfoWindowElement = useCallback((place: PlannerPlace): HTMLElement => {
    const color = getPlannerDayColor(place.dayNumber);
    const imageUrl = place.firstimage2 || place.firstimage;

    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      width: 280px;
      padding: 12px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: default;
    `;

    container.addEventListener('mousedown', e => e.stopPropagation());
    container.addEventListener('touchstart', e => e.stopPropagation());

    /** 닫기 버튼 */
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border: none;
      background: rgba(243,244,246,0.9);
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      color: #6b7280;
      z-index: 10;
    `;
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      closePlannerInfoWindow();
    });
    container.appendChild(closeBtn);

    /** 이미지 영역 */
    if (imageUrl) {
      const imgContainer = document.createElement('div');
      imgContainer.style.cssText = `
        width: 100%;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 10px;
      `;

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = place.title;
      img.style.cssText = `width: 100%; height: 100%; object-fit: cover;`;
      img.onerror = () => { imgContainer.style.display = 'none'; };

      imgContainer.appendChild(img);
      container.appendChild(imgContainer);
    }

    /** 일차 + 순서 배지 */
    const badgeContainer = document.createElement('div');
    badgeContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    `;

    const dayBadge = document.createElement('span');
    dayBadge.textContent = `Day ${place.dayNumber}`;
    dayBadge.style.cssText = `
      background: ${color};
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    `;
    badgeContainer.appendChild(dayBadge);

    const orderBadge = document.createElement('span');
    orderBadge.textContent = `${place.orderNumber}번째 장소`;
    orderBadge.style.cssText = `font-size: 12px; color: #6b7280;`;
    badgeContainer.appendChild(orderBadge);

    container.appendChild(badgeContainer);

    /** 제목 */
    const title = document.createElement('h3');
    title.textContent = place.title;
    title.style.cssText = `
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      padding-right: 30px;
    `;
    container.appendChild(title);

    /** 주소 */
    if (place.addr1) {
      const addr = document.createElement('p');
      addr.textContent = place.addr1;
      addr.style.cssText = `
        margin: 0 0 10px 0;
        font-size: 13px;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      container.appendChild(addr);
    }

    /** 상세 버튼 */
    const detailBtn = document.createElement('button');
    detailBtn.textContent = '상세정보 보기 ↗';
    detailBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      background: ${color};
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    `;

    detailBtn.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      window.open(
        `${window.location.origin}/?page=travel-detail&contentid=${place.contentid}`,
        '_blank'
      );
      closePlannerInfoWindow();
    });

    container.appendChild(detailBtn);

    /** 말풍선 꼬리 */
    const tail = document.createElement('div');
    tail.style.cssText = `
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid white;
    `;
    container.appendChild(tail);

    return container;
  }, [closePlannerInfoWindow]);

  /** 인포윈도우 표시 */
  const showInfoWindow = useCallback((marker: kakao.maps.Marker, destination: NearbyDestination, map: kakao.maps.Map) => {
    if (infoWindowRef.current) {
      infoWindowRef.current.setMap(null);
    }
    
    if (selectedMarkerRef.current && selectedMarkerRef.current !== marker) {
      const prevDest = markerDestMapRef.current.get(selectedMarkerRef.current);
      if (prevDest) {
        resetMarkerImage(selectedMarkerRef.current, prevDest);
      }
    }
    
    const src = createSelectedMarkerSvg(destination.contenttypeid);
    const size = new kakao.maps.Size(44, 58);
    const option = { offset: new kakao.maps.Point(22, 58) };
    marker.setImage(new kakao.maps.MarkerImage(src, size, option));
    selectedMarkerRef.current = marker;
    
    const content = createInfoWindowElement(destination);
    
    const infoWindow = new kakao.maps.CustomOverlay({
      content: content,
      position: marker.getPosition(),
      xAnchor: 0.5,
      yAnchor: 1.35,
      zIndex: 999,
    });
    infoWindow.setMap(map);
    infoWindowRef.current = infoWindow;
  }, [createInfoWindowElement, resetMarkerImage]);

  /** 마커 생성 */
  const createMarker = useCallback((destination: NearbyDestination, map: kakao.maps.Map): kakao.maps.Marker => {
    const position = new kakao.maps.LatLng(destination.mapy, destination.mapx);
    const src = createMarkerSvg(destination.contenttypeid);
    const size = new kakao.maps.Size(36, 48);
    const option = { offset: new kakao.maps.Point(18, 48) };
    
    const marker = new kakao.maps.Marker({
      position,
      image: new kakao.maps.MarkerImage(src, size, option),
      title: destination.title,
      map,
      clickable: true,
    });
    
    markerDestMapRef.current.set(marker, destination);
    
    kakao.maps.event.addListener(marker, 'click', function() {
      if (onMarkerClick) {
        onMarkerClick(destination);
      }
    });
    
    return marker;
  }, [onMarkerClick]);

  /** 플래너 마커 생성 */
  const createPlannerMarker = useCallback((place: PlannerPlace, map: kakao.maps.Map): kakao.maps.Marker => {
    const position = new kakao.maps.LatLng(place.mapy, place.mapx);
    const src = createPlannerMarkerSvg(place.dayNumber, place.orderNumber);
    const size = new kakao.maps.Size(32, 32);
    const option = { offset: new kakao.maps.Point(16, 16) };
    
    const marker = new kakao.maps.Marker({
      position,
      image: new kakao.maps.MarkerImage(src, size, option),
      title: `${place.dayNumber}일차 ${place.orderNumber}번: ${place.title}`,
      map,
    });
  
    plannerMarkerMapRef.current.set(place.contentid, marker);
    plannerPlacesMapRef.current.set(place.contentid, place);

    kakao.maps.event.addListener(marker, 'click', function() {
      closePlannerInfoWindow();
      
      if (onPlannerMarkerClick) {
        onPlannerMarkerClick(place);
      }
      
      map.panTo(marker.getPosition());
      
      const content = createPlannerInfoWindowElement(place);
      const infoWindow = new kakao.maps.CustomOverlay({
        content: content,
        position: marker.getPosition(),
        xAnchor: 0.5,
        yAnchor: 1.35,
        zIndex: 999,
      });
      infoWindow.setMap(map);
      plannerInfoWindowRef.current = infoWindow;
    });
    
    return marker;
  }, [onPlannerMarkerClick, createPlannerInfoWindowElement, closePlannerInfoWindow]);

  /** 플래너 경로 선 그리기 */
  const drawPlannerRoutes = useCallback((places: PlannerPlace[], map: kakao.maps.Map) => {
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];
    
    if (places.length < 2) return;
    
    const dayGroups: Map<number, PlannerPlace[]> = new Map();
    places.forEach(place => {
      const dayPlaces = dayGroups.get(place.dayNumber) || [];
      dayPlaces.push(place);
      dayGroups.set(place.dayNumber, dayPlaces);
    });
    
    dayGroups.forEach((dayPlaces, dayNumber) => {
      dayPlaces.sort((a, b) => a.orderNumber - b.orderNumber);
      
      if (dayPlaces.length < 2) return;
      
      const path = dayPlaces.map(place => 
        new kakao.maps.LatLng(place.mapy, place.mapx)
      );
      
      const color = getPlannerDayColor(dayNumber);
      
      const polyline = new kakao.maps.Polyline({
        path: path,
        strokeWeight: 4,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });
      
      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    });
  }, []);

  /** 지도 초기화 */
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    loadKakaoMap(() => {
      const map = new kakao.maps.Map(mapContainerRef.current!, {
        center: new kakao.maps.LatLng(centerLat, centerLng),
        level,
      });
      mapRef.current = map;
      
      const zoomControl = new kakao.maps.ZoomControl();
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
      
      kakao.maps.event.addListener(map, 'click', function() {
        closeInfoWindow();
        closePlannerInfoWindow();
        if (onMapClick) onMapClick();
      });
      
      kakao.maps.event.addListener(map, 'idle', function() {
        if (onMapMoved && mapRef.current) {
          const center = mapRef.current.getCenter();
          onMapMoved(center.getLat(), center.getLng());
        }
      });
    });
    
    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      plannerMarkersRef.current.forEach(m => m.setMap(null));
      plannerMarkersRef.current = [];
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
      markerDestMapRef.current.clear();
      if (infoWindowRef.current) infoWindowRef.current.setMap(null);
      if (currentLocationMarkerRef.current) currentLocationMarkerRef.current.setMap(null);
      if (plannerInfoWindowRef.current) plannerInfoWindowRef.current.setMap(null);
    };
  }, []);

  /** 중심 좌표 변경 */
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(new kakao.maps.LatLng(centerLat, centerLng));
    }
  }, [centerLat, centerLng]);

  /** 마커 업데이트 (여행지) */
  useEffect(() => {
    if (!mapRef.current) return;
    
    const currentSelectedId = selectedMarkerRef.current 
      ? markerDestMapRef.current.get(selectedMarkerRef.current)?.contentid 
      : null;
    
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    markerDestMapRef.current.clear();
    destinationsMapRef.current.clear();
    selectedMarkerRef.current = null;
    if (infoWindowRef.current) infoWindowRef.current.setMap(null);
    
    destinations.forEach(dest => {
      if (dest.mapx && dest.mapy) {
        const marker = createMarker(dest, mapRef.current!);
        markersRef.current.push(marker);
        destinationsMapRef.current.set(dest.contentid, dest);
        
        if (currentSelectedId && dest.contentid === currentSelectedId) {
          setTimeout(() => {
            if (mapRef.current) {
              showInfoWindow(marker, dest, mapRef.current);
            }
          }, 10);
        }
      }
    });
  }, [destinations]);

  /** 플래너 마커 + 경로 선 업데이트 */
  useEffect(() => {
    if (!mapRef.current) return;
    
    plannerMarkersRef.current.forEach(m => m.setMap(null));
    plannerMarkersRef.current = [];
    plannerMarkerMapRef.current.clear();
    plannerPlacesMapRef.current.clear();
    
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];
    
    if (!plannerPlaces.length) return;
    
    plannerPlaces.forEach(place => {
      if (place.mapx && place.mapy) {
        const marker = createPlannerMarker(place, mapRef.current!);
        plannerMarkersRef.current.push(marker);
      }
    });
    
    drawPlannerRoutes(plannerPlaces, mapRef.current);
    
  }, [plannerPlaces, createPlannerMarker, drawPlannerRoutes]);

  /** 현재 위치 마커 */
  useEffect(() => {
    if (!mapRef.current) return;
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
      currentLocationMarkerRef.current = null;
    }
    if (showCurrentLocation && currentLocation) {
      const src = createCurrentLocationMarkerSvg();
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
        image: new kakao.maps.MarkerImage(src, new kakao.maps.Size(24, 24), { offset: new kakao.maps.Point(12, 12) }),
        title: '현재 위치',
        map: mapRef.current,
        zIndex: 100,
      });
      currentLocationMarkerRef.current = marker;
    }
  }, [showCurrentLocation, currentLocation]);

  /** 외부 메서드 */
  useImperativeHandle(ref, () => ({
    panTo: (lat, lng) => mapRef.current?.panTo(new kakao.maps.LatLng(lat, lng)),
    setCenter: (lat, lng, newLevel) => {
      if (mapRef.current) {
        mapRef.current.setCenter(new kakao.maps.LatLng(lat, lng));
        if (newLevel !== undefined) mapRef.current.setLevel(newLevel);
      }
    },
    setLevel: (newLevel) => mapRef.current?.setLevel(newLevel),
    getCenter: () => {
      if (mapRef.current) {
        const c = mapRef.current.getCenter();
        return { lat: c.getLat(), lng: c.getLng() };
      }
      return null;
    },
    selectMarker: (contentid) => {
      const dest = destinationsMapRef.current.get(contentid);
      if (dest && mapRef.current) {
        const marker = markersRef.current.find(m => markerDestMapRef.current.get(m)?.contentid === contentid);
        if (marker) {
          mapRef.current.panTo(marker.getPosition());
          setTimeout(() => {
            if (mapRef.current) {
              showInfoWindow(marker, dest, mapRef.current);
            }
          }, 300);
        }
      }
    },
    closeInfoWindow: closeInfoWindow,
    fitBounds: () => {
      if (mapRef.current && destinations.length) {
        const bounds = new kakao.maps.LatLngBounds();
        destinations.forEach(d => d.mapx && d.mapy && bounds.extend(new kakao.maps.LatLng(d.mapy, d.mapx)));
        mapRef.current.setBounds(bounds);
      }
    },
    relayout: () => {
      if (mapRef.current) {
        mapRef.current.relayout();
      }
    },
    selectPlannerMarker: (contentid) => {
      const marker = plannerMarkerMapRef.current.get(contentid);
      const place = plannerPlacesMapRef.current.get(contentid);
      
      if (marker && place && mapRef.current) {
        closePlannerInfoWindow();
        mapRef.current.panTo(marker.getPosition());
        
        const content = createPlannerInfoWindowElement(place);
        const infoWindow = new kakao.maps.CustomOverlay({
          content: content,
          position: marker.getPosition(),
          xAnchor: 0.5,
          yAnchor: 1.35,
          zIndex: 999,
        });
        infoWindow.setMap(mapRef.current);
        plannerInfoWindowRef.current = infoWindow;
      }
    },
  }), [destinations, showInfoWindow, closeInfoWindow, closePlannerInfoWindow, createPlannerInfoWindowElement]);

  return <div ref={mapContainerRef} className={className} style={{ width: '100%', height, position: 'relative' }} />;
});

KakaoMap.displayName = 'KakaoMap';
export default KakaoMap;
