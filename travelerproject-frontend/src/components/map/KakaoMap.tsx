/**
 * KakaoMap.tsx
 * 카카오맵 공통 컴포넌트
 * 
 * 수정: 상세정보 보기 버튼 클릭 시 onNavigateToDetail 콜백 호출
 */

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { NearbyDestination } from '../../api/mapApi';
import { 
  createMarkerSvg, 
  createSelectedMarkerSvg, 
  createCurrentLocationMarkerSvg,
  createPlannerMarkerSvg,
  MARKER_COLORS,
  MARKER_EMOJI
} from '../../utils/markerIcons';

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
  onNavigateToDetail?: (contentid: string) => void;  // ★ 상세페이지 이동 콜백
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
  onNavigateToDetail,  // ★ 추가
  className = '',
  height = '100%',
}, ref) => {
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const infoWindowRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const currentLocationMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const destinationsMapRef = useRef<Map<string, NearbyDestination>>(new Map());
  const markerDestMapRef = useRef<Map<kakao.maps.Marker, NearbyDestination>>(new Map());
  const selectedMarkerRef = useRef<kakao.maps.Marker | null>(null);
  
  // ★ 콜백을 ref로 저장 (클로저 문제 해결)
  const onNavigateToDetailRef = useRef(onNavigateToDetail);
  useEffect(() => {
    onNavigateToDetailRef.current = onNavigateToDetail;
  }, [onNavigateToDetail]);

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

  /** 인포윈도우 DOM 요소 생성 */
  const createInfoWindowElement = useCallback((destination: NearbyDestination): HTMLElement => {
    const emoji = MARKER_EMOJI[destination.contenttypeid] || '📍';
    const color = MARKER_COLORS[destination.contenttypeid] || '#6B7280';
    const imageUrl = destination.firstimage2 || destination.firstimage;
    
    let distanceText = '';
    if (destination.distance !== null && destination.distance !== undefined) {
      distanceText = destination.distance < 1 
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
    `;

    // 닫기 버튼
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute; top: 8px; right: 8px; width: 24px; height: 24px;
      border: none; background: #f3f4f6; border-radius: 50%; cursor: pointer;
      font-size: 14px; color: #6b7280; z-index: 10;
    `;
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeInfoWindow();
    });
    container.appendChild(closeBtn);

    // 이미지
    if (imageUrl) {
      const imgContainer = document.createElement('div');
      imgContainer.style.cssText = `width: 100%; height: 120px; border-radius: 8px; overflow: hidden; margin-bottom: 10px;`;
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = destination.title;
      img.style.cssText = `width: 100%; height: 100%; object-fit: cover;`;
      img.onerror = () => { imgContainer.style.display = 'none'; };
      imgContainer.appendChild(img);
      container.appendChild(imgContainer);
    }

    // 타입 배지 + 거리
    const badgeContainer = document.createElement('div');
    badgeContainer.style.cssText = `display: flex; align-items: center; gap: 8px; margin-bottom: 6px;`;
    
    const badge = document.createElement('span');
    badge.innerHTML = `${emoji} ${destination.typeName || '여행지'}`;
    badge.style.cssText = `background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;`;
    badgeContainer.appendChild(badge);
    
    if (distanceText) {
      const distance = document.createElement('span');
      distance.textContent = distanceText;
      distance.style.cssText = `color: #9ca3af; font-size: 11px;`;
      badgeContainer.appendChild(distance);
    }
    container.appendChild(badgeContainer);

    // 제목
    const title = document.createElement('h3');
    title.textContent = destination.title;
    title.style.cssText = `margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3; padding-right: 20px;`;
    container.appendChild(title);

    // 주소
    const addr = document.createElement('p');
    addr.textContent = destination.addr1 || '주소 정보 없음';
    addr.style.cssText = `margin: 0 0 10px 0; font-size: 13px; color: #6b7280; line-height: 1.4;`;
    container.appendChild(addr);

    // ★ 상세정보 보기 버튼 - mousedown으로 새 탭 열기
    const detailBtn = document.createElement('button');
    detailBtn.textContent = '상세정보 보기 ↗';
    detailBtn.style.cssText = `
      display: block; width: 100%; padding: 10px; background: ${color}; color: white; border: none;
      border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-align: center;
    `;
    
    detailBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const url = window.location.origin + '/?page=travel-detail&contentid=' + destination.contentid;
      window.open(url, '_blank');
      
      // 인포윈도우 닫기 (마우스 포인터 고정 문제 해결)
      closeInfoWindow();
    });
    
    container.appendChild(detailBtn);

    // 말풍선 꼬리
    const tail = document.createElement('div');
    tail.style.cssText = `
      position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
      width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent;
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
    
    // ★ 마커 클릭 → 리스트 선택만 호출 (인포윈도우는 MapPage에서 selectMarker 호출)
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

  /** 지도 초기화 */
  useEffect(() => {
    if (!mapContainerRef.current || !window.kakao?.maps) return;
    
    kakao.maps.load(() => {
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

  /** 마커 업데이트 */
  useEffect(() => {
    if (!mapRef.current) return;
    
    // ★ 현재 열린 인포윈도우 정보 저장
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
        
        // ★ 이전에 선택된 마커면 인포윈도우 다시 표시
        if (currentSelectedId && dest.contentid === currentSelectedId) {
          setTimeout(() => {
            showInfoWindow(marker, dest, mapRef.current!);
          }, 10);
        }
      }
    });
  }, [destinations, createMarker, showInfoWindow]);

  /** 플래너 마커 */
  useEffect(() => {
    if (!mapRef.current || !plannerPlaces.length) return;
    plannerPlaces.forEach(place => {
      if (place.mapx && place.mapy) {
        markersRef.current.push(createPlannerMarker(place, mapRef.current!));
      }
    });
  }, [plannerPlaces, createPlannerMarker]);

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
