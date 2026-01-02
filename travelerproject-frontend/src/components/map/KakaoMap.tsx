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
 */

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { NearbyDestination } from '../../api/mapApi';
import { 
  createMarkerSvg, 
  createSelectedMarkerSvg, 
  createCurrentLocationMarkerSvg,
  createPlannerMarkerSvg,
  getPlannerDayColor,
  MARKER_COLORS,
  MARKER_EMOJI
} from '../../utils/markerIcons';

const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

// 카카오맵 스크립트 로드 여부 체크
let isKakaoLoaded = false;
let isKakaoLoading = false;
const loadCallbacks: (() => void)[] = [];

const loadKakaoMap = (callback: () => void) => {
  // 이미 로드됨
  if (isKakaoLoaded && window.kakao?.maps) {
    callback();
    return;
  }
  
  // 콜백 등록
  loadCallbacks.push(callback);
  
  // 이미 로딩 중이면 대기
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
  onMapMoved?: (lat: number, lng: number) => void;
  onMapClick?: () => void;
  onNavigateToDetail?: (contentid: string) => void;
  onToggleFavorite?: (destination: NearbyDestination) => void;  // ★ 찜 토글 콜백
  isFavorite?: (contentid: string) => boolean;  // ★ 찜 여부 확인 함수
  className?: string;
  height?: string;
}

export interface PlannerPlace {
  contentid: string;
  title: string;
  mapx: number;
  mapy: number;
  dayNumber: number;
  orderNumber: number;
}

export interface KakaoMapRef {
  panTo: (lat: number, lng: number) => void;
  setCenter: (lat: number, lng: number, level?: number) => void;
  setLevel: (level: number) => void;
  getCenter: () => { lat: number; lng: number } | null;
  selectMarker: (contentid: string) => void;
  closeInfoWindow: () => void;
  fitBounds: () => void;
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
  onMapMoved,
  onMapClick,
  onNavigateToDetail,
  onToggleFavorite,  // ★ 추가
  isFavorite,  // ★ 추가
  className = '',
  height = '100%',
}, ref) => {
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const plannerMarkersRef = useRef<kakao.maps.Marker[]>([]);  // ★ 플래너 마커 분리
  const polylinesRef = useRef<kakao.maps.Polyline[]>([]);  // ★ 경로 선
  const infoWindowRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const currentLocationMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const destinationsMapRef = useRef<Map<string, NearbyDestination>>(new Map());
  const markerDestMapRef = useRef<Map<kakao.maps.Marker, NearbyDestination>>(new Map());
  const selectedMarkerRef = useRef<kakao.maps.Marker | null>(null);
  
  // 콜백을 ref로 저장 (클로저 문제 해결)
  const onNavigateToDetailRef = useRef(onNavigateToDetail);
  const onToggleFavoriteRef = useRef(onToggleFavorite);
  const isFavoriteRef = useRef(isFavorite);
  
  useEffect(() => {
    onNavigateToDetailRef.current = onNavigateToDetail;
  }, [onNavigateToDetail]);
  
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

  /** 인포윈도우 닫기 함수 */
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

  /** ★ 인포윈도우 DOM 요소 생성 (찜 버튼 추가) */
  const createInfoWindowElement = useCallback((destination: NearbyDestination): HTMLElement => {
  const emoji = MARKER_EMOJI[destination.contenttypeid] || '📍';
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

  /** 공통 컨테이너 */
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

  /** 찜 버튼 */
  const favoriteBtn = document.createElement('button');
  favoriteBtn.textContent = favorited ? '♥' : '♡';
  favoriteBtn.style.cssText = `
    position: absolute;
    top: 40px;
    right: 8px;
    border: none;
    background: rgba(255,255,255,0.9);
    cursor: pointer;
    font-size: 22px;
    color: ${favorited ? '#EF4444' : '#374151'};
    padding: 0 4px;
    line-height: 1;
    z-index: 10;
    transition: transform 0.1s;
  `;

  favoriteBtn.addEventListener('mouseenter', () => {
    favoriteBtn.style.transform = 'scale(1.2)';
  });
  favoriteBtn.addEventListener('mouseleave', () => {
    favoriteBtn.style.transform = 'scale(1)';
  });
  favoriteBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();

    if (onToggleFavoriteRef.current) {
      onToggleFavoriteRef.current(destination);
      const active = favoriteBtn.textContent === '♥';
      favoriteBtn.textContent = active ? '♡' : '♥';
      favoriteBtn.style.color = active ? '#9ca3af' : '#EF4444';
    } else {
      alert('로그인이 필요한 기능입니다.');
    }
  });

  /** 이미지 영역 */
  if (imageUrl) {
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
      width: 100%;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 10px;
      position: relative;
    `;

    // 👉 버튼을 이미지 위로
    imgContainer.appendChild(closeBtn);
    imgContainer.appendChild(favoriteBtn);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = destination.title;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    img.onerror = () => {
      imgContainer.style.display = 'none';
      // 이미지 없어진 경우 → 버튼을 컨테이너로 이동
      container.appendChild(closeBtn);
      container.appendChild(favoriteBtn);
    };

    imgContainer.appendChild(img);
    container.appendChild(imgContainer);
  } else {
    // 👉 이미지 없을 때는 컨테이너 우상단
    container.appendChild(closeBtn);
    container.appendChild(favoriteBtn);
  }

  /** 타입 + 거리 */
  const badgeContainer = document.createElement('div');
  badgeContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  `;

  const badge = document.createElement('span');
  badge.innerHTML = `${emoji} ${destination.typeName || '여행지'}`;
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

  container.appendChild(badgeContainer);

  /** 제목 */
  const title = document.createElement('h3');
  title.textContent = destination.title;
  title.style.cssText = `
    margin: 0 0 6px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    padding-right: 50px;
  `;
  container.appendChild(title);

  /** 주소 */
  const addr = document.createElement('p');
  addr.textContent = destination.addr1 || '주소 정보 없음';
  addr.style.cssText = `
    margin: 0 0 10px 0;
    font-size: 13px;
    color: #6b7280;
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
    
    return new kakao.maps.Marker({
      position,
      image: new kakao.maps.MarkerImage(src, size, option),
      title: `${place.dayNumber}일차 ${place.orderNumber}번: ${place.title}`,
      map,
    });
  }, []);

  /** ★ 플래너 경로 선 그리기 */
  const drawPlannerRoutes = useCallback((places: PlannerPlace[], map: kakao.maps.Map) => {
    // 기존 경로 선 제거
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];
    
    if (places.length < 2) return;
    
    // 일차별로 그룹화
    const dayGroups: Map<number, PlannerPlace[]> = new Map();
    places.forEach(place => {
      const dayPlaces = dayGroups.get(place.dayNumber) || [];
      dayPlaces.push(place);
      dayGroups.set(place.dayNumber, dayPlaces);
    });
    
    // 각 일차별로 경로 선 그리기
    dayGroups.forEach((dayPlaces, dayNumber) => {
      // 순서대로 정렬
      dayPlaces.sort((a, b) => a.orderNumber - b.orderNumber);
      
      if (dayPlaces.length < 2) return;
      
      // 경로 좌표 배열 생성
      const path = dayPlaces.map(place => 
        new kakao.maps.LatLng(place.mapy, place.mapx)
      );
      
      // 일차별 색상
      const color = getPlannerDayColor(dayNumber);
      
      // Polyline 생성
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
    
    // 현재 열린 인포윈도우 정보 저장
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
        
        // 이전에 선택된 마커면 인포윈도우 다시 표시
        if (currentSelectedId && dest.contentid === currentSelectedId) {
          setTimeout(() => {
            if (mapRef.current) {
              showInfoWindow(marker, dest, mapRef.current);
            }
          }, 10);
        }
      }
    });
  }, [destinations, createMarker, showInfoWindow]);

  /** ★ 플래너 마커 + 경로 선 업데이트 (실시간) */
  useEffect(() => {
    if (!mapRef.current) return;
    
    // 기존 플래너 마커 제거
    plannerMarkersRef.current.forEach(m => m.setMap(null));
    plannerMarkersRef.current = [];
    
    // 기존 경로 선 제거
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];
    
    if (!plannerPlaces.length) return;
    
    // 새 플래너 마커 생성
    plannerPlaces.forEach(place => {
      if (place.mapx && place.mapy) {
        const marker = createPlannerMarker(place, mapRef.current!);
        plannerMarkersRef.current.push(marker);
      }
    });
    
    // 경로 선 그리기
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
  }), [destinations, showInfoWindow, closeInfoWindow]);

  return <div ref={mapContainerRef} className={className} style={{ width: '100%', height, position: 'relative' }} />;
});

KakaoMap.displayName = 'KakaoMap';
export default KakaoMap;
