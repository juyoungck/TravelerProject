/**
 * EventPage.tsx - 이벤트 목록 페이지
 * 
 * 데이터 출처:
 * - 축제/공연/행사: 한국관광공사 OpenAPI (실시간)
 * - 여행코스: DB (contenttypeid=25)
 * 
 * 탭: #전체 / #축제 / #공연 / #행사 / #여행코스
 * 레이아웃: 4열 그리드
 * 페이징: 8개씩, 이전/다음 버튼
 * 캐시: 6시간
 * 정렬: 종료일 가까운 순
 * 필터: 진행중인 이벤트만 보기
 */

import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, ChevronLeft, ChevronRight, Loader2, Route } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventDetailPage } from './EventDetailPage';
import { CourseDetailPage } from './CourseDetailPage';
import { getFestivalList } from '../../api/festivalApi';
import type { FestivalItem, FestivalType } from '../../api/festivalApi';
import api from '../../api/api';

type EventTab = '전체' | '축제' | '공연' | '행사' | '여행코스';

interface EventPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

/** 여행코스 아이템 인터페이스 (DB) */
interface CourseItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2: string;
  tel: string;
  firstimage: string;
  firstimage2: string;
  mapx: number;
  mapy: number;
  category: '여행코스';
}

/** 탭 → API 타입 변환 */
const tabToType = (tab: EventTab): FestivalType => {
  switch (tab) {
    case '축제': return 'festival';
    case '공연': return 'performance';
    case '행사': return 'event';
    default: return 'all';
  }
};

/** 날짜 포맷 함수 (YYYYMMDD → YYYY.MM.DD) */
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return dateStr || '';
  return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
};

/** 오늘 날짜 (YYYYMMDD) */
const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/** 카테고리 이모지 */
const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case '축제': return '🎉';
    case '공연': return '🎭';
    case '행사': return '📅';
    case '여행코스': return '🗺️';
    default: return '🎪';
  }
};

/** 카테고리 색상 */
const getCategoryColor = (category: string): string => {
  switch (category) {
    case '축제': return 'bg-orange-100 text-orange-600';
    case '공연': return 'bg-purple-100 text-purple-600';
    case '행사': return 'bg-green-100 text-green-600';
    case '여행코스': return 'bg-blue-100 text-blue-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

/** 캐시 유효 시간: 6시간 */
const CACHE_DURATION = 6 * 60 * 60 * 1000;

interface CacheData {
  data: (FestivalItem | CourseItem)[];
  timestamp: number;
}

export function EventPage({ onNavigate, isLoggedIn, onOpenSearch }: EventPageProps) {
  const [events, setEvents] = useState<(FestivalItem | CourseItem)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FestivalItem | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [activeTab, setActiveTab] = useState<EventTab>('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyOngoing, setShowOnlyOngoing] = useState(false); // 진행중만 보기
  const pageSize = 8;

  // 캐시 저장소 (탭별)
  const cacheRef = useRef<Map<string, CacheData>>(new Map());

  /** 캐시 유효성 검사 */
  const isCacheValid = (key: string): boolean => {
    const cached = cacheRef.current.get(key);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < CACHE_DURATION;
  };

  /** 종료일 가까운 순 정렬 */
  const sortByEndDate = (items: FestivalItem[]): FestivalItem[] => {
    return [...items].sort((a, b) => {
      const endA = a.eventenddate || a.eventstartdate || '99999999';
      const endB = b.eventenddate || b.eventstartdate || '99999999';
      return endA.localeCompare(endB);
    });
  };

  /** 진행중인 이벤트 필터 */
  const filterOngoing = (items: FestivalItem[]): FestivalItem[] => {
    const today = getTodayString();
    return items.filter(item => {
      const start = item.eventstartdate || '00000000';
      const end = item.eventenddate || item.eventstartdate || '99999999';
      return start <= today && today <= end;
    });
  };

  /** 데이터 로드 */
  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = activeTab;

      // 캐시 확인
      if (isCacheValid(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          console.log('캐시 사용:', cacheKey);
          setEvents(cached.data);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      
      try {
        let data: (FestivalItem | CourseItem)[] = [];
        
        if (activeTab === '여행코스') {
          // 여행코스: DB에서 조회 (contenttypeid=25)
          console.log('여행코스 DB 조회');
          const response = await api.get('/destination/list/25', {
            params: { 
              page: 1,
              size: 100
            }
          });
          
          if (response.data && response.data.data) {
            data = response.data.data.map((item: any) => ({
              ...item,
              category: '여행코스'
            }));
          }
        } else {
          // 축제/공연/행사: OpenAPI
          const type = tabToType(activeTab);
          console.log('축제/공연/행사 API 호출:', type);
          const response = await getFestivalList(type, 1, 100);
          
          if (response.status === 'success' && response.data) {
            // 종료일 가까운 순 정렬
            data = sortByEndDate(response.data);
          }
        }
        
        setEvents(data);
        // 캐시 저장
        cacheRef.current.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
      } catch (err) {
        console.error('데이터 조회 실패:', err);
        setError('서버 연결에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  /** 탭 변경 */
  const handleTabChange = (tab: EventTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setShowOnlyOngoing(false); // 탭 변경 시 필터 초기화
  };

  /** 카드 클릭 */
  const handleCardClick = (item: FestivalItem | CourseItem) => {
    if (item.category === '여행코스') {
      setSelectedCourse(item as CourseItem);
    } else {
      setSelectedEvent(item as FestivalItem);
    }
  };

  // 필터링된 이벤트 (진행중만 보기)
  const filteredEvents = showOnlyOngoing && activeTab !== '여행코스'
    ? filterOngoing(events as FestivalItem[])
    : events;

  // 현재 페이지 데이터
  const startIndex = (currentPage - 1) * pageSize;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  /** 상세 페이지 표시 - 축제/공연/행사 */
  if (selectedEvent) {
    return (
      <EventDetailPage
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  /** 상세 페이지 표시 - 여행코스 */
  if (selectedCourse) {
    return (
      <CourseDetailPage
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 제목 + 탭 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">이벤트</h1>
          <div className="flex gap-2 flex-wrap">
            {(['전체', '축제', '공연', '행사', '여행코스'] as EventTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                #{tab}
              </button>
            ))}
          </div>
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">로딩 중...</span>
          </div>
        )}

        {/* 에러 */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        )}

        {/* 콘텐츠 */}
        {!isLoading && !error && (
          <>
            {/* 결과 개수 + 필터 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold text-blue-600">{filteredEvents.length}</span>개
              </p>
              
              {/* 진행중만 보기 체크박스 (여행코스 탭에서는 숨김) */}
              {activeTab !== '여행코스' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyOngoing}
                    onChange={(e) => {
                      setShowOnlyOngoing(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">진행중인 이벤트만 보기</span>
                </label>
              )}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>
                  {showOnlyOngoing 
                    ? '현재 진행중인 이벤트가 없습니다.' 
                    : `등록된 ${activeTab === '전체' ? '이벤트' : activeTab}가 없습니다.`
                  }
                </p>
              </div>
            ) : (
              <>
                {/* 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentEvents.map((item) => (
                    <EventCard
                      key={item.contentid}
                      item={item}
                      onClick={() => handleCardClick(item)}
                    />
                  ))}
                </div>

                {/* 페이징 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전
                    </Button>
                    <span className="text-sm text-gray-600">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** 이벤트/코스 카드 컴포넌트 */
function EventCard({ item, onClick }: { item: FestivalItem | CourseItem; onClick: () => void }) {
  const isCourse = item.category === '여행코스';
  const festivalItem = item as FestivalItem;

  // 진행중 여부 표시
  const isOngoing = () => {
    if (isCourse) return false;
    const today = getTodayString();
    const start = festivalItem.eventstartdate || '00000000';
    const end = festivalItem.eventenddate || festivalItem.eventstartdate || '99999999';
    return start <= today && today <= end;
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow text-left"
    >
      {/* 이미지 */}
      <div className="relative h-48 bg-gray-200">
        {item.firstimage ? (
          <img
            src={item.firstimage}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getCategoryEmoji(item.category)}
          </div>
        )}
        {/* 카테고리 뱃지 */}
        <span
          className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}
        >
          {getCategoryEmoji(item.category)} {item.category}
        </span>
        {/* 진행중 뱃지 */}
        {!isCourse && isOngoing() && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-green-500 text-white">
            진행중
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.title}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          {/* 위치 */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{item.addr1 || '위치 정보 없음'}</span>
          </div>
          {/* 날짜 (축제/공연/행사만) */}
          {!isCourse && festivalItem.eventstartdate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {formatDate(festivalItem.eventstartdate)}
                {festivalItem.eventenddate && festivalItem.eventenddate !== festivalItem.eventstartdate && (
                  <> ~ {formatDate(festivalItem.eventenddate)}</>
                )}
              </span>
            </div>
          )}
          {/* 여행코스 표시 */}
          {isCourse && (
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 flex-shrink-0" />
              <span>여행코스</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default EventPage;