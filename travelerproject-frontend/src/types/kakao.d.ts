/**
 * kakao.d.ts
 * 카카오맵 JavaScript SDK 타입 선언
 * 
 * 카카오맵 API 문서: https://apis.map.kakao.com/web/documentation/
 */

declare namespace kakao.maps {
  
  /** 지도 생성 옵션 */
  interface MapOptions {
    center: LatLng;
    level?: number;
    mapTypeId?: MapTypeId;
    draggable?: boolean;
    scrollwheel?: boolean;
    disableDoubleClick?: boolean;
    disableDoubleClickZoom?: boolean;
    projectionId?: string;
    tileAnimation?: boolean;
    keyboardShortcuts?: boolean | object;
  }

  /** 지도 클래스 */
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number, options?: { anchor?: LatLng; animate?: boolean | { duration: number } }): void;
    getLevel(): number;
    setMapTypeId(mapTypeId: MapTypeId): void;
    getMapTypeId(): MapTypeId;
    setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
    getBounds(): LatLngBounds;
    panTo(latlng: LatLng): void;
    panBy(dx: number, dy: number): void;
    addControl(control: MapTypeControl | ZoomControl, position: ControlPosition): void;
    removeControl(control: MapTypeControl | ZoomControl): void;
    setDraggable(draggable: boolean): void;
    getDraggable(): boolean;
    setZoomable(zoomable: boolean): void;
    getZoomable(): boolean;
    relayout(): void;
    addOverlayMapTypeId(mapTypeId: MapTypeId): void;
    removeOverlayMapTypeId(mapTypeId: MapTypeId): void;
    setKeyboardShortcuts(active: boolean): void;
    getKeyboardShortcuts(): boolean;
    setCursor(style: string): void;
    getProjectionId(): string;
    setProjectionId(id: string): void;
  }

  /** 위도/경도 좌표 클래스 */
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
    equals(latlng: LatLng): boolean;
    toString(): string;
  }

  /** 좌표 경계 클래스 */
  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(latlng: LatLng): void;
    contain(latlng: LatLng): boolean;
    isEmpty(): boolean;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
    toString(): string;
  }

  /** 마커 옵션 */
  interface MarkerOptions {
    map?: Map;
    position: LatLng;
    image?: MarkerImage;
    title?: string;
    draggable?: boolean;
    clickable?: boolean;
    zIndex?: number;
    opacity?: number;
    altitude?: number;
    range?: number;
  }

  /** 마커 클래스 */
  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getMap(): Map | null;
    setPosition(position: LatLng): void;
    getPosition(): LatLng;
    setImage(image: MarkerImage): void;
    getImage(): MarkerImage;
    setTitle(title: string): void;
    getTitle(): string;
    setDraggable(draggable: boolean): void;
    getDraggable(): boolean;
    setClickable(clickable: boolean): void;
    getClickable(): boolean;
    setZIndex(zIndex: number): void;
    getZIndex(): number;
    setOpacity(opacity: number): void;
    getOpacity(): number;
    setAltitude(altitude: number): void;
    getAltitude(): number;
    setRange(range: number): void;
    getRange(): number;
  }

  /** 마커 이미지 옵션 */
  interface MarkerImageOptions {
    alt?: string;
    coords?: string;
    offset?: Point;
    shape?: string;
    spriteOrigin?: Point;
    spriteSize?: Size;
  }

  /** 마커 이미지 클래스 */
  class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  /** 사이즈 클래스 */
  class Size {
    constructor(width: number, height: number);
    equals(size: Size): boolean;
    toString(): string;
  }

  /** 포인트 클래스 */
  class Point {
    constructor(x: number, y: number);
    equals(point: Point): boolean;
    toString(): string;
  }

  /** 인포윈도우 옵션 */
  interface InfoWindowOptions {
    content?: string | HTMLElement;
    disableAutoPan?: boolean;
    map?: Map;
    position?: LatLng;
    removable?: boolean;
    zIndex?: number;
    altitude?: number;
    range?: number;
  }

  /** 인포윈도우 클래스 */
  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(map: Map, marker?: Marker): void;
    close(): void;
    getMap(): Map | null;
    setPosition(position: LatLng): void;
    getPosition(): LatLng;
    setContent(content: string | HTMLElement): void;
    getContent(): string | HTMLElement;
    setZIndex(zIndex: number): void;
    getZIndex(): number;
    setAltitude(altitude: number): void;
    getAltitude(): number;
    setRange(range: number): void;
    getRange(): number;
  }

  /** 커스텀 오버레이 옵션 */
  interface CustomOverlayOptions {
    content?: string | HTMLElement;
    clickable?: boolean;
    map?: Map;
    position?: LatLng;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }

  /** 커스텀 오버레이 클래스 */
  class CustomOverlay {
    constructor(options?: CustomOverlayOptions);
    setMap(map: Map | null): void;
    getMap(): Map | null;
    setPosition(position: LatLng): void;
    getPosition(): LatLng;
    setContent(content: string | HTMLElement): void;
    getContent(): string | HTMLElement;
    setZIndex(zIndex: number): void;
    getZIndex(): number;
    setAltitude(altitude: number): void;
    getAltitude(): number;
    setRange(range: number): void;
    getRange(): number;
  }

  /** 지도 타입 컨트롤 */
  class MapTypeControl {
    constructor();
  }

  /** 줌 컨트롤 */
  class ZoomControl {
    constructor();
  }

  /** 컨트롤 위치 */
  enum ControlPosition {
    TOP = 0,
    TOPLEFT = 1,
    TOPRIGHT = 2,
    BOTTOM = 3,
    BOTTOMLEFT = 4,
    BOTTOMRIGHT = 5,
    LEFT = 6,
    RIGHT = 7,
  }

  /** 지도 타입 ID */
  enum MapTypeId {
    ROADMAP = 1,
    SKYVIEW = 2,
    HYBRID = 3,
    OVERLAY = 4,
    ROADVIEW = 5,
    TRAFFIC = 6,
    TERRAIN = 7,
    BICYCLE = 8,
    BICYCLE_HYBRID = 9,
    USE_DISTRICT = 10,
  }

  /** 이벤트 네임스페이스 */
  namespace event {
    function addListener(target: any, type: string, handler: (...args: any[]) => void): void;
    function removeListener(target: any, type: string, handler: (...args: any[]) => void): void;
    function trigger(target: any, type: string, data?: any): void;
    function preventMap(): void;
  }

  /** 서비스 네임스페이스 (장소 검색, 주소-좌표 변환 등) */
  namespace services {
    /** 장소 검색 클래스 */
    class Places {
      constructor(map?: Map);
      keywordSearch(keyword: string, callback: (result: any[], status: Status, pagination: Pagination) => void, options?: PlacesSearchOptions): void;
      categorySearch(code: string, callback: (result: any[], status: Status, pagination: Pagination) => void, options?: PlacesSearchOptions): void;
      setMap(map: Map): void;
    }

    /** 주소-좌표 변환 클래스 */
    class Geocoder {
      constructor();
      addressSearch(addr: string, callback: (result: any[], status: Status) => void): void;
      coord2Address(lng: number, lat: number, callback: (result: any[], status: Status) => void): void;
      coord2RegionCode(lng: number, lat: number, callback: (result: any[], status: Status) => void): void;
    }

    /** 장소 검색 옵션 */
    interface PlacesSearchOptions {
      category_group_code?: string;
      location?: LatLng;
      radius?: number;
      bounds?: LatLngBounds;
      rect?: string;
      size?: number;
      page?: number;
      sort?: SortBy;
      useMapBounds?: boolean;
      useMapCenter?: boolean;
    }

    /** 페이지네이션 */
    interface Pagination {
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      current: number;
      gotoPage(page: number): void;
      gotoFirst(): void;
      gotoLast(): void;
      nextPage(): void;
      prevPage(): void;
    }

    /** 상태 */
    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    /** 정렬 방식 */
    enum SortBy {
      ACCURACY = 'accuracy',
      DISTANCE = 'distance',
    }
  }

  /** load 함수 - 카카오맵 SDK 로드 완료 콜백 */
  function load(callback: () => void): void;
}

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

export {};
