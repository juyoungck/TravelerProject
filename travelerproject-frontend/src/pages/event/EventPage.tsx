/**
 * EventPage.tsx - 축제/공연/행사 목록 페이지
 * 한국관광공사 searchFestival2 API 연동
 * 
 * 탭: #전체 / #축제 / #공연 / #행사
 * 레이아웃: 3열 그리드
 * 페이징: 4개씩, 이전/다음 버튼
 */

import { useState, useEffect } from 'react';
import { Calendar, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventDetailPage } from './EventDetailPage';
import { getFestivalList, FestivalItem, FestivalType } from '../../api/festivalApi';

type EventTab = '전체' | '축제' | '공연' | '행사';

interface EventPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
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

/** 카테고리 이모지 */
const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case '축제': return '🎉';
    case '공연': return '🎭';
    case '행사': return '📅';
    default: return '🎪';
  }
};

/** 카테고리 색상 */
const getCategoryColor = (category: string): string => {
  switch (category) {
    case '축제': return 'bg-orange-100 text-orange-600';
    case '공연': return 'bg-purple-100 text-purple-600';
    case '행사': return 'bg-green-100 text-green-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export function EventPage({ onNavigate, isLoggedIn, onOpenSearch }: EventPageProps) {
  const [events, setEvents] = useState<FestivalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FestivalItem | null>(null);
  const [activeTab, setActiveTab] = useState<EventTab>('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /** 데이터 로드 */
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const type = tabToType(activeTab);
        const response = await getFestivalList(type, 1, 100);
        
        if (response.status === 'success' && response.data) {
          setEvents(response.data);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('축제/공연/행사 조회 실패:', err);
        setError('서버 연결에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  /** 탭 변경 */
  const handleTabChange = (tab: EventTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // 현재 페이지 데이터
  const startIndex = (currentPage - 1) * pageSize;
  const currentEvents = events.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(events.length / pageSize);

  /** 상세 페이지 표시 */
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 제목 + 탭 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">축제, 공연, 행사</h1>
          <div className="flex gap-2 flex-wrap">
            {(['전체', '축제', '공연', '행사'] as EventTab[]).map((tab) => (
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
            {/* 결과 개수 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold text-blue-600">{events.length}</span>개
              </p>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>등록된 {activeTab === '전체' ? '축제/공연/행사' : activeTab}가 없습니다.</p>
              </div>
            ) : (
              <>
                {/* 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentEvents.map((event) => (
                    <EventCard
                      key={event.contentid}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
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

/** 이벤트 카드 컴포넌트 */
function EventCard({ event, onClick }: { event: FestivalItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow text-left"
    >
      {/* 이미지 */}
      <div className="relative h-48 bg-gray-200">
        {event.firstimage ? (
          <img
            src={event.firstimage}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getCategoryEmoji(event.category)}
          </div>
        )}
        {/* 카테고리 뱃지 */}
        <span
          className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(event.category)}`}
        >
          {getCategoryEmoji(event.category)} {event.category}
        </span>
      </div>

      {/* 정보 */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          {/* 위치 */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{event.addr1 || '위치 정보 없음'}</span>
          </div>
          {/* 날짜 */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatDate(event.eventstartdate)}
              {event.eventenddate && event.eventenddate !== event.eventstartdate && (
                <> ~ {formatDate(event.eventenddate)}</>
              )}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default EventPage;