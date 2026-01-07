/**
 * PlannerSearchResults.tsx - 플래너 검색 결과 리스트
 * 백엔드 API에서 destination 데이터를 가져와 표시
 * 다중 카테고리 + 지역 필터 지원
 * 
 * ★ 수정: mapx, mapy 좌표 추가 (지도 실시간 업데이트용)
 */

import { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
  contentid?: string;
  mapx?: number;  // ★ 추가
  mapy?: number;  // ★ 추가
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

/** contenttypeid -> 카테고리 매핑 */
const contentTypeToCategory: { [key: string]: string } = {
  '12': '관광',
  '14': '문화',
  '15': '축제',
  '25': '코스',
  '28': '레저',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식',
};

/** 모든 카테고리 contenttypeid 목록 */
const allContentTypes = ['12', '14', '15', '28', '32', '38', '39'];

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

  // 카테고리를 문자열로 변환 (배열 비교 문제 해결)
  const categoryKey = category.sort().join(',');

  // 카테고리, 검색어, 지역이 변경되면 데이터 다시 로드
  useEffect(() => {
    setPage(1);
    fetchPlaces(1, true);
  }, [categoryKey, searchQuery, lDongRegnCd, lDongSignguCd]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (page > 1) {
      fetchPlaces(page, false);  // false = 추가 로드 (기존 결과에 추가)
    }
  }, [page]);

  const fetchPlaces = async (pageNum: number, isNewSearch: boolean = false) => {
    setIsLoading(true);
    try {
      // 검색어가 있으면 검색 API 사용
      if (searchQuery.trim()) {
        const params: any = { 
          keyword: searchQuery.trim(), 
          page: pageNum, 
          size: pageSize 
        };
        
        // 지역 필터 추가
        if (lDongRegnCd) {
          params.lDongRegnCd = lDongRegnCd;
          if (lDongSignguCd) {
            params.lDongSignguCd = lDongSignguCd;
          }
        }

        const response = await axios.get(`${API_BASE_URL}/destination/search`, { params });
        
        if (response.data.status === 'success') {
          const newPlaces = mapResponseToPlaces(response.data.data || []);
          if (isNewSearch) {
            setPlaces(newPlaces);  // 새 검색이면 교체
          } else {
            setPlaces(prev => [...prev, ...newPlaces]);  // 추가 로드면 추가
          }
          setTotalCount(response.data.totalCount || 0);
        }
      } 
      // 카테고리 선택 시
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

        // 여러 카테고리 동시 조회
        const promises = contentTypeIds.map(typeId => {
          const params: any = { 
            page: pageNum, 
            size: Math.ceil(pageSize / contentTypeIds.length) 
          };
          
          // 지역 필터 추가
          if (lDongRegnCd) {
            params.lDongRegnCd = lDongRegnCd;
            if (lDongSignguCd) {
              params.lDongSignguCd = lDongSignguCd;
            }
          }

          return axios.get(`${API_BASE_URL}/destination/list/${typeId}`, { params });
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

        // 중복 제거
        const uniquePlaces = allPlaces.filter((place, index, self) =>
          index === self.findIndex(p => p.id === place.id)
        );

        if (isNewSearch) {
          setPlaces(uniquePlaces);  // 새 검색이면 교체
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
   * ★ API 응답을 Place 객체로 변환 (좌표 포함)
   */
  const mapResponseToPlaces = (data: any[]): Place[] => {
    return data.map((item: any) => ({
      id: item.contentid,
      contentid: item.contentid,
      name: item.title,
      category: contentTypeToCategory[item.contenttypeid] || '기타',
      region: item.regionName || item.addr1?.split(' ').slice(0, 2).join(' ') || '',
      image: item.firstimage2 || item.firstimage || 'https://via.placeholder.com/200x200?text=No+Image',
      // ★ 좌표 추가 (지도 실시간 업데이트용)
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
      place: place,  // ★ 좌표 포함된 place 객체 전달
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex-shrink-0">
          {place.category}
        </span>
      </div>
    </div>
  );
}
