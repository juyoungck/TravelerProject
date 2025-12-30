/**
 * MapPage.tsx - 지도 페이지
 * 지도 API 통합 영역 (Mock)
 */

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Mock 데이터
const mockLocations = [
  {
    id: 1,
    name: '경복궁',
    region: '서울',
    category: '관광지',
    lat: 37.579617,
    lng: 126.977041,
  },
  {
    id: 2,
    name: 'N서울타워',
    region: '서울',
    category: '관광지',
    lat: 37.551169,
    lng: 126.988227,
  },
  {
    id: 3,
    name: '명동',
    region: '서울',
    category: '쇼핑',
    lat: 37.563692,
    lng: 126.982574,
  },
  {
    id: 4,
    name: '광화문',
    region: '서울',
    category: '관광지',
    lat: 37.572889,
    lng: 126.976894,
  },
];

const categories = [
  { id: 'all', name: '전체', icon: '🏠' },
  { id: 'food', name: '음식', icon: '🍽️' },
  { id: 'festival', name: '축제', icon: '🎉' },
  { id: 'tour', name: '관광지', icon: '🏛️' },
  { id: 'shopping', name: '쇼핑', icon: '🛍️' },
  { id: 'culture', name: '문화', icon: '🎭' },
];

export function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation] = useState({
    name: '서울시청',
    lat: 37.5665,
    lng: 126.9780,
  });


  const handleResearch = () => {
    alert('현재 위치에서 재검색합니다.');
    // 실제로는 지도의 현재 중심 좌표로 검색
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* 왼쪽 사이드바 */}
      <div className="w-96 bg-white border-r overflow-y-auto">
        {/* 현재 위치 정보 */}
        <div className="p-6 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg">{currentLocation.name}</h3>
              </div>
            </div>
            
          </div>
        </div>

        {/* 카테고리 */}
        <div className="p-6 border-b">
          <h4 className="mb-4 text-lg">카테고리</h4>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-xs">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 장소 목록 */}
        <div className="p-4">
          <h4 className="mb-3">주변 장소 ({mockLocations.length})</h4>
          <div className="space-y-2">
            {mockLocations.map((location) => (
              <button
                key={location.id}
                className="w-full p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-1">
                  <h5 className="flex-1">{location.name}</h5>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {location.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{location.region}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 지도 */}
      <div className="flex-1 relative">
        {/* 지도 위 지역 재검색 버튼 */}
        <div className="absolute top-4 left-4 z-10">
          <Button onClick={handleResearch} size="sm">
            지역 재검색
          </Button>
        </div>

        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          {/* 실제 지도 API 적용 시 여기에 지도 컴포넌트가 들어갑니다 */}
          <div className="text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="mb-2">지도 영역</h3>
            <p className="text-gray-600">
              실제 서비스에서는 카카오맵 또는 네이버 지도 API가 표시됩니다.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              현재 위치: {currentLocation.name} ({currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)})
            </p>
          </div>
        </div>

        {/* 지도 위 컨트롤 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded">
            +
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded">
            -
          </button>
        </div>
      </div>
    </div>
  );
}