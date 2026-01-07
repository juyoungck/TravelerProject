/**
 * SharedPlannerPage.tsx - 공유 링크로 접근하는 플래너 페이지
 * URL에서 shareLink를 읽어서 해당 플래너를 표시
 */

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin as MapPinIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  Sun,
  Share2,
  Copy,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getPlannerByShareLink } from '../../api/plannerApi';
import type { PlannerDetail, DayPlanDetail } from '../../api/plannerApi';

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
}

interface DayPlan {
  id: string;
  day: number;
  places: Place[];
  memo: string;
}

interface SharedPlannerPageProps {
  shareLink: string;
  onBack: () => void;
}

// 기본 이미지
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400';

// 콘텐츠 타입 ID -> 카테고리명 변환
const contentTypeToCategory: { [key: string]: string } = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};

/**
 * API 응답의 DayPlanDetail을 프론트엔드 DayPlan 형식으로 변환
 */
const convertToDayPlan = (dayPlanDetail: DayPlanDetail): DayPlan => ({
  id: `day-${dayPlanDetail.dayNumber}`,
  day: dayPlanDetail.dayNumber,
  memo: dayPlanDetail.memo || '',
  places: dayPlanDetail.places.map((place) => ({
    id: `${place.contentid}-${place.placeId}`,
    name: place.title,
    category: contentTypeToCategory[place.contenttypeid] || '기타',
    region: place.addr1?.split(' ')[0] || '',
    image: place.firstimage || DEFAULT_IMAGE,
  })),
});

export function SharedPlannerPage({ shareLink, onBack }: SharedPlannerPageProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API에서 가져온 상세 데이터
  const [plannerDetail, setPlannerDetail] = useState<PlannerDetail | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);

  /**
   * 공유 링크로 플래너 조회
   */
  const fetchSharedPlanner = async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getPlannerByShareLink(shareLink);
      setPlannerDetail(detail);
      
      // 일차별 계획 변환
      if (detail.dayPlans && detail.dayPlans.length > 0) {
        const converted = detail.dayPlans.map(convertToDayPlan);
        setDayPlans(converted);
      } else {
        // 일차 정보가 없으면 빈 일차 생성
        const emptyDays: DayPlan[] = Array.from({ length: detail.totalDays }, (_, i) => ({
          id: `day-${i + 1}`,
          day: i + 1,
          places: [],
          memo: '',
        }));
        setDayPlans(emptyDays);
      }
    } catch (err: any) {
      console.error('공유 플래너 조회 실패:', err);
      if (err.response?.status === 404) {
        setError('존재하지 않거나 만료된 공유 링크입니다.');
      } else {
        setError('플래너 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    if (shareLink) {
      fetchSharedPlanner();
    }
  }, [shareLink]);

  /**
   * 현재 페이지 링크 복사
   */
  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert('링크가 복사되었습니다!');
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('링크가 복사되었습니다!');
    }
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">공유된 플래너를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error || !plannerDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">플래너를 찾을 수 없습니다</h2>
          <p className="text-gray-500 mb-6">{error || '잘못된 공유 링크입니다.'}</p>
          <Button onClick={onBack}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  // 데이터 표시용 변수
  const title = plannerDetail.plnTitle;
  const author = plannerDetail.authorNickname || '익명';
  const region = plannerDetail.regionName || '미정';
  const startDate = plannerDetail.startDate;
  const endDate = plannerDetail.endDate;
  const totalDays = plannerDetail.totalDays;
  const favoriteCount = plannerDetail.favoriteCount || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">공유된 플래너</h1>
        <Button variant="ghost" size="icon" onClick={handleCopyLink} title="링크 복사">
          <Copy className="h-5 w-5" />
        </Button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 - 플래너 내용 */}
        {isLeftSidebarOpen && (
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              {/* 플래너 정보 헤더 */}
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold">공유된 플래너</h3>
                <div className="flex items-center gap-1 ml-auto text-red-500">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{favoriteCount}</span>
                </div>
              </div>

              {/* 제목 & 작성자 */}
              <div className="mb-3">
                <div className="px-3 py-2 border rounded bg-gray-50 text-gray-700">
                  <span className="font-semibold text-blue-600">{author}</span>의 {title}
                </div>
              </div>

              {/* 날짜 */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-gray-600 px-3 py-2 border rounded bg-gray-50">
                    {startDate} ~ {endDate} ({totalDays}일)
                  </div>
                </div>

                {/* 지역 & 날씨 */}
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPinIcon className="h-4 w-4 text-blue-600" />
                    <span>{region}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">15°C</span>
                  </div>
                </div>
              </div>

              {/* DAY 리스트 */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">일정</h4>
                <div className="space-y-3">
                  {dayPlans.map((dayPlan) => (
                    <div key={dayPlan.id} className="border rounded-lg overflow-hidden bg-white">
                      {/* Day 헤더 */}
                      <div className="bg-blue-600 text-white p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">DAY {dayPlan.day}</span>
                            {dayPlan.memo && (
                              <span className="text-xs opacity-90">- {dayPlan.memo}</span>
                            )}
                          </div>
                          <span className="text-xs opacity-90">
                            {dayPlan.places.length}개 장소
                          </span>
                        </div>
                      </div>

                      {/* Day 내용 */}
                      <div className="p-3">
                        <div className="space-y-2">
                          {dayPlan.places.length > 0 ? (
                            dayPlan.places.map((place, index) => (
                              <div
                                key={place.id}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                              >
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <img
                                  src={place.image}
                                  alt={place.name}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm truncate">
                                    {place.name}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <span className="px-1.5 py-0.5 bg-white rounded border">
                                      {place.category}
                                    </span>
                                    <MapPinIcon className="h-3 w-3" />
                                    <span>{place.region}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 text-sm py-4">
                              등록된 장소가 없습니다
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 토글 버튼 */}
        <button
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          className="w-6 bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
        >
          {isLeftSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* 중앙 지도 */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="mb-2">지도 영역</h3>
              <p className="text-gray-600">
                실제 서비스에서는 지도 API가 표시됩니다.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                일정의 장소들이 선으로 연결되어 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
