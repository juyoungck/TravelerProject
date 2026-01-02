/**
 * MapPage.tsx - 지도 페이지
 * 카카오맵 API를 활용한 여행지 지도 페이지
 * 
 * 수정: 검색 위치 날씨 표시 추가
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Navigation, RefreshCw, Loader2, ChevronRight, ChevronLeft, 
  ChevronDown, ChevronUp, Search, X 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import KakaoMap, { KakaoMapRef } from '../components/map/KakaoMap';
import { 
  getNearbyDestinations, 
  searchDestinationsForMap,
  NearbyDestination, 
  CONTENT_TYPE_NAME 
} from '../api/mapApi';
import { getWeather } from '../api/weatherApi';
import { MARKER_COLORS, MARKER_EMOJI } from '../utils/markerIcons';

/** 카테고리 목록 */
const categories = [
  { id: 'all', name: '전체', icon: '🗺️', contenttypeid: null },
  { id: '12', name: '관광지', icon: '🏛️', contenttypeid: '12' },
  { id: '14', name: '문화시설', icon: '🎭', contenttypeid: '14' },
  { id: '15', name: '축제/공연', icon: '🎉', contenttypeid: '15' },
  { id: '28', name: '레포츠', icon: '⛷️', contenttypeid: '28' },
  { id: '32', name: '숙박', icon: '🏨', contenttypeid: '32' },
  { id: '38', name: '쇼핑', icon: '🛍️', contenttypeid: '38' },
  { id: '39', name: '음식점', icon: '🍽️', contenttypeid: '39' },
];

/** 검색 반경 옵션 */
const radiusOptions = [
  { value: 0.5, label: '500m', limit: 300 },
  { value: 1, label: '1km', limit: 300 },
  { value: 3, label: '3km', limit: 100 },
  { value: 10, label: '10km', limit: 100 },
];

/** 날씨 아이콘 매핑 */
const weatherEmoji: { [key: string]: string } = {
  '맑음': '☀️',
  '구름많음': '⛅',
  '흐림': '☁️',
  '비': '🌧️',
  '비/눈': '🌨️',
  '눈': '❄️',
};

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };

export function MapPage() {
  const mapRef = useRef<KakaoMapRef>(null);
  
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [destinations, setDestinations] = useState<NearbyDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<NearbyDestination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [lastSearchKeyword, setLastSearchKeyword] = useState('');
  
  // 날씨 상태
  const [weather, setWeather] = useState<{ temperature: string; sky: string } | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  /**
   * 날씨 조회
   */
  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setIsWeatherLoading(true);
    try {
      const result = await getWeather(lat, lng);
      if (result.status === 'success' && result.weather) {
        setWeather(result.weather);
      } else {
        setWeather(null);
      }
    } catch (err) {
      console.error('날씨 조회 실패:', err);
      setWeather(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  /**
   * 현재 위치 가져오기 (타임아웃 2초)
   */
  const getCurrentLocation = useCallback(() => {
    setIsLocationLoading(true);
    
    if (!navigator.geolocation) {
      setMapCenter(DEFAULT_CENTER);
      setIsLocationLoading(false);
      fetchWeather(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setIsLocationLoading(false);
        fetchWeather(latitude, longitude);
      },
      () => {
        setMapCenter(DEFAULT_CENTER);
        setIsLocationLoading(false);
        fetchWeather(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      },
      {
        enableHighAccuracy: false,
        timeout: 2000,
        maximumAge: 600000,
      }
    );
  }, [fetchWeather]);

  /**
   * 주변 여행지 조회
   */
  const fetchNearbyDestinations = useCallback(async (
    lat: number, 
    lng: number, 
    contenttypeid?: string | null
  ) => {
    setIsLoading(true);
    setError(null);
    
    const radiusOption = radiusOptions.find(r => r.value === searchRadius);
    const limit = radiusOption?.limit || 100;
    
    try {
      const response = await getNearbyDestinations(lat, lng, searchRadius, contenttypeid || undefined, limit);
      
      if (response.status === 'success') {
        setDestinations(response.data);
      } else {
        setError(response.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [searchRadius]);

  /**
   * 키워드 검색
   */
  const performSearch = useCallback(async (keyword: string, contenttypeid?: string) => {
    if (!keyword.trim() || keyword.trim().length < 2) {
      alert('검색어를 2글자 이상 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsSearchMode(true);
    setLastSearchKeyword(keyword.trim());
    
    try {
      const response = await searchDestinationsForMap(keyword.trim(), contenttypeid, 100);
      
      if (response.status === 'success') {
        setDestinations(response.data);
        
        if (response.data.length > 0) {
          const first = response.data[0];
          if (mapRef.current && first.mapx && first.mapy) {
            mapRef.current.setCenter(first.mapy, first.mapx, 7);
            // 검색 결과 첫 번째 위치로 날씨 조회
            fetchWeather(first.mapy, first.mapx);
          }
        }
      } else {
        setError(response.message || '검색에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeather]);

  /**
   * 검색 버튼 클릭
   */
  const handleSearch = () => {
    const contenttypeid = selectedCategory === 'all' ? undefined : selectedCategory;
    performSearch(searchKeyword, contenttypeid);
  };

  /**
   * 검색 초기화
   */
  const handleClearSearch = () => {
    setSearchKeyword('');
    setLastSearchKeyword('');
    setIsSearchMode(false);
    const contenttypeid = selectedCategory === 'all' ? null : selectedCategory;
    fetchNearbyDestinations(mapCenter.lat, mapCenter.lng, contenttypeid);
    fetchWeather(mapCenter.lat, mapCenter.lng);
  };

  /**
   * 초기 로드
   */
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  /**
   * 위치/카테고리/반경 변경 시 (검색 모드가 아닐 때만)
   */
  useEffect(() => {
    if (!isLocationLoading && !isSearchMode) {
      const contenttypeid = selectedCategory === 'all' ? null : selectedCategory;
      fetchNearbyDestinations(mapCenter.lat, mapCenter.lng, contenttypeid);
    }
  }, [mapCenter, selectedCategory, searchRadius, isLocationLoading, isSearchMode, fetchNearbyDestinations]);

  /**
   * 카테고리 변경 핸들러
   */
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedDestination(null);
    
    if (mapRef.current) {
      mapRef.current.closeInfoWindow();
    }
    
    // 검색 모드일 때는 같은 키워드로 카테고리만 변경해서 재검색
    if (isSearchMode && lastSearchKeyword) {
      const contenttypeid = categoryId === 'all' ? undefined : categoryId;
      performSearch(lastSearchKeyword, contenttypeid);
    }
  };

  /**
   * 지역 재검색
   */
  const handleResearch = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        setMapCenter(center);
        setIsSearchMode(false);
        setSearchKeyword('');
        setLastSearchKeyword('');
        fetchWeather(center.lat, center.lng);
      }
    }
  };

  /**
   * 현재 위치로 이동
   */
  const handleMoveToCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setCenter(currentLocation.lat, currentLocation.lng, 5);
      setMapCenter(currentLocation);
      setIsSearchMode(false);
      setSearchKeyword('');
      setLastSearchKeyword('');
      fetchWeather(currentLocation.lat, currentLocation.lng);
    } else {
      getCurrentLocation();
    }
  };

  /**
   * 마커 클릭 → 리스트 선택 + 인포윈도우 표시
   */
  const handleMarkerClick = (destination: NearbyDestination) => {
    setSelectedDestination(destination);
    // 리스트 선택 후 인포윈도우 표시
    if (mapRef.current) {
      mapRef.current.selectMarker(destination.contentid);
    }
  };

  /**
   * 리스트에서 장소 클릭 - 지도 이동 + 마커 클릭 상태
   */
  const handlePlaceClick = (destination: NearbyDestination) => {
    setSelectedDestination(destination);
    if (mapRef.current) {
      mapRef.current.selectMarker(destination.contentid);
    }
  };

  /**
   * ★ 상세 페이지로 이동 - 새 탭에서 열기
   */
  const handleNavigateToDetail = (contentid: string) => {
    const url = `${window.location.origin}/?page=travel-detail&contentid=${contentid}`;
    console.log('새 탭에서 상세 페이지 열기:', url);
    window.open(url, '_blank');
  };

  /**
   * 거리 표시 포맷
   */
  const formatDistance = (distance: number | null) => {
    if (distance === null || distance === undefined) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance}km`;
  };

  /**
   * 날씨 아이콘 가져오기
   */
  const getWeatherEmoji = (sky: string) => {
    return weatherEmoji[sky] || '🌤️';
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex relative">
      {/* 왼쪽 사이드바 */}
      <div 
        className={`
          ${isSidebarOpen ? 'w-96' : 'w-0'} 
          bg-white border-r overflow-hidden transition-all duration-300
          flex flex-col
        `}
      >
        {/* 현재 위치 정보 + 날씨 */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {isSearchMode ? '검색 결과' : '현재 검색 위치'}
                </p>
                <p className="font-medium">
                  {isSearchMode 
                    ? `"${lastSearchKeyword}" 검색`
                    : (currentLocation ? '내 위치 주변' : '서울 시청 주변')
                  }
                </p>
              </div>
            </div>
            
            {/* 날씨 + 네비게이션 */}
            <div className="flex items-center gap-2">
              {/* 날씨 표시 */}
              {isWeatherLoading ? (
                <div className="flex items-center gap-1 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : weather ? (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="text-lg">{getWeatherEmoji(weather.sky)}</span>
                  <span className="text-sm font-medium">{weather.temperature}°C</span>
                </div>
              ) : null}
              
              {/* 현재 위치 버튼 */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMoveToCurrentLocation}
                disabled={isLocationLoading}
                title="현재 위치로 이동"
              >
                {isLocationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 검색창 */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="여행지 검색 (2글자 이상)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-8"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {isSearchMode && (
            <button
              onClick={handleClearSearch}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              ← 주변 검색으로 돌아가기
            </button>
          )}
        </div>

        {/* 카테고리 (접기/펼치기) */}
        <div className="border-b">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">
              카테고리 {selectedCategory !== 'all' && (
                <span className="text-blue-600 text-sm ml-2">
                  ({categories.find(c => c.id === selectedCategory)?.name})
                </span>
              )}
            </span>
            {isCategoryOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {isCategoryOpen && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-4 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-xl mb-1">{category.icon}</div>
                    <div className="text-xs truncate">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 검색 반경 (검색 모드가 아닐 때만) */}
        {!isSearchMode && (
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">검색 반경</span>
              <div className="flex items-center gap-1">
                {radiusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSearchRadius(option.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      searchRadius === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 장소 목록 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">검색 중...</span>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="p-4 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={handleClearSearch}>
                다시 시도
              </Button>
            </div>
          )}
          
          {!isLoading && !error && destinations.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>{isSearchMode ? '검색 결과가 없습니다.' : '주변에 여행지가 없습니다.'}</p>
              <p className="text-sm mt-1">{isSearchMode ? '다른 검색어로 시도해보세요.' : '검색 반경을 늘려보세요.'}</p>
            </div>
          )}
          
          {!isLoading && !error && destinations.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b">
                <p className="text-sm text-gray-600">
                  {isSearchMode ? '검색 결과' : '주변 여행지'}{' '}
                  <span className="font-semibold text-blue-600">{destinations.length}</span>개
                </p>
              </div>
              <div className="divide-y">
                {destinations.map((destination) => (
                  <button
                    key={destination.contentid}
                    onClick={() => handlePlaceClick(destination)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedDestination?.contentid === destination.contentid
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {destination.firstimage2 || destination.firstimage ? (
                          <img
                            src={destination.firstimage2 || destination.firstimage || ''}
                            alt={destination.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            {MARKER_EMOJI[destination.contenttypeid] || '📍'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${MARKER_COLORS[destination.contenttypeid]}20`,
                              color: MARKER_COLORS[destination.contenttypeid]
                            }}
                          >
                            {destination.typeName || CONTENT_TYPE_NAME[destination.contenttypeid]}
                          </span>
                          {destination.distance !== null && !isSearchMode && (
                            <span className="text-xs text-gray-400">
                              {formatDistance(destination.distance)}
                            </span>
                          )}
                        </div>
                        <h5 className="font-medium text-gray-900 truncate">
                          {destination.title}
                        </h5>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {destination.addr1 || '주소 정보 없음'}
                        </p>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0 self-center" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 사이드바 토글 버튼 */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`
          absolute top-1/2 -translate-y-1/2 z-20
          ${isSidebarOpen ? 'left-96' : 'left-0'}
          w-6 h-16 bg-white border border-l-0 rounded-r-lg shadow-md
          flex items-center justify-center transition-all duration-300 hover:bg-gray-50
        `}
      >
        {isSidebarOpen ? <ChevronLeft className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
      </button>

      {/* 오른쪽 지도 */}
      <div className="flex-1 relative">
        {!isSearchMode && (
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button 
              onClick={handleResearch} 
              size="sm"
              className="bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              이 지역 재검색
            </Button>
          </div>
        )}

        {!isLocationLoading ? (
          <KakaoMap
            ref={mapRef}
            centerLat={mapCenter.lat}
            centerLng={mapCenter.lng}
            level={5}
            destinations={destinations}
            showCurrentLocation={!!currentLocation}
            currentLocation={currentLocation}
            onMarkerClick={handleMarkerClick}
            onMapClick={() => setSelectedDestination(null)}
            onNavigateToDetail={handleNavigateToDetail}
            height="100%"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">위치 정보를 가져오는 중...</p>
            </div>
          </div>
        )}

        <button
          onClick={handleMoveToCurrentLocation}
          className="absolute bottom-24 right-3 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="현재 위치로 이동"
        >
          <Navigation className="h-5 w-5 text-blue-500" />
        </button>
      </div>
    </div>
  );
}