/**
 * PlannerSearchResults.tsx - 플래너 검색 결과 리스트
 * 백엔드 API에서 destination 데이터를 가져와 표시
 * 다중 카테고리 + 지역 필터 지원
 * 
 * ★ 수정: contentTypeUtils 적용, 주소 간략화
 */

import { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getContentTypeStyle } from '../../utils/contentTypeUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + ":8080/api";

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
  contentid?: string;
  contenttypeid?: string;
  mapx?: number;
  mapy?: number;
}

interface DayPlan {
  id: string;
  day: number;
  places: Place[];
  memo?: string;
}

interface PlannerSearchResultsProps {
  category: string[];
  region: string;
  searchQuery: string;
  dayPlans: DayPlan[];
  onAddPlace: (place: Place, dayId: string) => void;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
}

/** 카테고리 -> contenttypeid 매핑 */
const categoryToContentType: { [key: string]: string } = {
  '관광': '12',
  '문화': '14',
  '축제': '15',
  '레저': '28',
  '숙박': '32',
  '쇼핑': '38',
  '음식': '39',
};

/** 모든 카테고리 contenttypeid 목록 */
const allContentTypes = ['12', '14', '15', '28', '32', '38', '39'];

/**
 * ★ 주소 간략화 함수
 * 서울특별시 종로구 → 서울 종로구
 * 경상북도 경주시 → 경북 경주시
 * 전라북도 전주시 완산구 → 전북 전주시
 */
const shortenAddress = (addr: string): string => {
  if (!addr) return '';
  
  const parts = addr.split(' ');
  if (parts.length === 0) return addr;
  
  // 1. 시/도 간략화
  let sido = parts[0]
    .replace('특별시', '')
    .replace('광역시', '')
    .replace('특별자치시', '')
    .replace('특별자치도', '')
    .replace('충청남도', '충남')
    .replace('충청북도', '충북')
    .replace('경상북도', '경북')
    .replace('경상남도', '경남')
    .replace('전라남도', '전남')
    .replace('전라북도', '전북')
    .replace('경기도', '경기')
    .replace('강원도', '강원')
    .replace('제주도', '제주');
  
  if (parts.length < 2) return sido;
  
  const second = parts[1];
  
  // 2. 특별시/광역시는 시도 + 구
  if (['서울', '부산', '대구', '인천', '광주', '대전', '울산'].includes(sido)) {
    return `${sido} ${second}`;
  }
  
  // 3. 세종은 그냥 세종
  if (sido === '세종') {
    return '세종';
  }
  
  // 4. 도 지역은 시도 + 시/군
  if (second.endsWith('시') || second.endsWith('군')) {
    return `${sido} ${second}`;
  }
  
  return `${sido} ${second}`;
};

export function PlannerSearchResults({
  category,
  searchQuery,
  dayPlans,
  onAddPlace,
  lDongRegnCd,
  lDongSignguCd,
}: PlannerSearchResultsProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const categoryKey = category.sort().join(',');

  useEffect(() => {
    setPage(1);
    fetchPlaces(1, true);
  }, [categoryKey, searchQuery, lDongRegnCd, lDongSignguCd]);

  useEffect(() => {
    if (page > 1) {
      fetchPlaces(page, false);
    }
  }, [page]);

  const fetchPlaces = async (pageNum: number, isNewSearch: boolean = false) => {
    setIsLoading(true);
    try {
      if (searchQuery.trim()) {
        const params: any = { 
          keyword: searchQuery.trim(), 
          page: pageNum, 
          size: pageSize 
        };
        
        if (lDongRegnCd) {
          params.lDongRegnCd = lDongRegnCd;
          if (lDongSignguCd) {
            params.lDongSignguCd = lDongSignguCd;
          }
        }

        const response = await axios.get(`${API_BASE_URL}/destination/planner/search`, { params });
        
        if (response.data.status === 'success') {
          const newPlaces = mapResponseToPlaces(response.data.data || []);
          if (isNewSearch) {
            setPlaces(newPlaces);
          } else {
            setPlaces(prev => [...prev, ...newPlaces]);
          }
          setTotalCount(response.data.totalCount || 0);
        }
      } 
      else {
        let contentTypeIds: string[] = [];
        
        if (category.includes('전체')) {
          contentTypeIds = allContentTypes;
        } else {
          contentTypeIds = category
            .map(cat => categoryToContentType[cat])
            .filter(id => id !== undefined);
        }

        if (contentTypeIds.length === 0) {
          contentTypeIds = ['12'];
        }

        const promises = contentTypeIds.map(typeId => {
          const params: any = { 
            page: pageNum, 
            size: Math.ceil(pageSize / contentTypeIds.length) 
          };
          
          if (lDongRegnCd) {
            params.lDongRegnCd = lDongRegnCd;
            if (lDongSignguCd) {
              params.lDongSignguCd = lDongSignguCd;
            }
          }

          return axios.get(`${API_BASE_URL}/destination/planner/list/${typeId}`, { params });
        });

        const responses = await Promise.all(promises);
        
        let allPlaces: Place[] = [];
        let total = 0;

        responses.forEach(response => {
          if (response.data.status === 'success') {
            const newPlaces = mapResponseToPlaces(response.data.data || []);
            allPlaces = [...allPlaces, ...newPlaces];
            total += response.data.totalCount || 0;
          }
        });

        const uniquePlaces = allPlaces.filter((place, index, self) =>
          index === self.findIndex(p => p.id === place.id)
        );

        if (isNewSearch) {
          setPlaces(uniquePlaces);
        } else {
          setPlaces(prev => {
            const combined = [...prev, ...uniquePlaces];
            return combined.filter((place, index, self) =>
              index === self.findIndex(p => p.id === place.id)
            );
          });
        }
        
        setTotalCount(total);
      }
    } catch (error) {
      console.error('장소 검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ★ API 응답을 Place 객체로 변환 (주소 간략화 적용)
   */
  const mapResponseToPlaces = (data: any[]): Place[] => {
    return data.map((item: any) => ({
      id: item.contentid,
      contentid: item.contentid,
      contenttypeid: item.contenttypeid,
      name: item.title,
      category: item.contenttypeid,  // ★ contenttypeid 저장 (DraggableSearchItem에서 처리)
      region: shortenAddress(item.regnName 
        ? `${item.regnName} ${item.addr1?.split(' ').slice(1, 2).join(' ') || ''}`.trim()
        : item.addr1 || ''),
      image: item.firstimage2 || item.firstimage || 'https://via.placeholder.com/200x200?text=No+Image',
      mapx: item.mapx ? parseFloat(item.mapx) : undefined,
      mapy: item.mapy ? parseFloat(item.mapy) : undefined,
    }));
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasMore = places.length < totalCount;

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-2">
        검색 결과: {totalCount.toLocaleString()}개
        {category.length > 1 && !category.includes('전체') && (
          <span className="text-blue-500 ml-1">
            ({category.join(', ')})
          </span>
        )}
      </div>
      
      {isLoading && page === 1 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-500">검색 중...</span>
        </div>
      ) : places.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          검색 결과가 없습니다
        </div>
      ) : (
        <>
          {places.map((place) => (
            <DraggableSearchItem
              key={place.id}
              place={place}
              dayPlans={dayPlans}
              onAddPlace={onAddPlace}
            />
          ))}
          
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  로딩 중...
                </span>
              ) : (
                `더 보기 (${places.length} / ${totalCount.toLocaleString()})`
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

interface DraggableSearchItemProps {
  place: Place;
  dayPlans: DayPlan[];
  onAddPlace: (place: Place, dayId: string) => void;
}

function DraggableSearchItem({ place }: DraggableSearchItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'PLACE',
    item: { 
      id: `new-${place.id}-${Date.now()}`,
      dayId: 'search',
      index: -1,
      place: place,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // ★ contentTypeUtils에서 카테고리 스타일 가져오기
  const categoryStyle = getContentTypeStyle(place.contenttypeid || place.category || '12');

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`bg-white border rounded p-2 cursor-move hover:border-blue-400 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <img
          src={place.image}
          alt={place.name}
          className="w-12 h-12 object-cover rounded flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
          }}
        />
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium truncate">{place.name}</h5>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{place.region}</span>
          </div>
        </div>
        {/* ★ 카테고리 색상 적용 */}
        <span 
          className="text-xs px-2 py-1 rounded flex-shrink-0"
          style={{
            backgroundColor: `${categoryStyle.markerColor}20`,
            color: categoryStyle.markerColor
          }}
        >
          {categoryStyle.name}
        </span>
      </div>
    </div>
  );
}