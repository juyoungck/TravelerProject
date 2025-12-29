/**
 * PlannerPreviewPage.tsx - 플래너 미리보기 페이지
 * 플래너 내용을 읽기 전용으로 보여주고 찜 기능 제공
 */

import { useState } from 'react';
import {
  ArrowLeft,
  MapPin as MapPinIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  Sun,
  Edit,
  Globe,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

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

interface PlannerPreviewPageProps {
  planner: {
    id: number;
    title: string;
    author: string;
    region: string;
    days: number;
    image: string;
    likes: number;
  };
  onBack: () => void;
  onEdit?: (plannerData: {
    id: number;
    title: string;
    author: string;
    region: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    dayPlans: DayPlan[];
  }) => void;
  isLoggedIn?: boolean;
  favoritePlanners?: any[];
  onToggleFavoritePlanner?: (planner: any) => void;
}

// Mock 장소 데이터
const mockPlaces: Place[] = [
  {
    id: '1',
    name: '경복궁',
    category: '관광',
    region: '서울',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
  },
  {
    id: '2',
    name: '북촌한옥마을',
    category: '문화',
    region: '서울',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
  },
  {
    id: '3',
    name: '명동',
    category: '쇼핑',
    region: '서울',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
  },
  {
    id: '4',
    name: '남산타워',
    category: '관광',
    region: '서울',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
  },
  {
    id: '5',
    name: '광안리해수욕장',
    category: '레저',
    region: '부산',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400',
  },
  {
    id: '6',
    name: '해운대',
    category: '레저',
    region: '부산',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400',
  },
  {
    id: '7',
    name: '감천문화마을',
    category: '문화',
    region: '부산',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400',
  },
  {
    id: '8',
    name: '성산일출봉',
    category: '관광',
    region: '제주',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
  },
];

export function PlannerPreviewPage({ planner, onBack, onEdit, isLoggedIn, favoritePlanners, onToggleFavoritePlanner }: PlannerPreviewPageProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  // favoritePlanners 배열에서 현재 플래너가 찜되어 있는지 확인
  const isLiked = favoritePlanners?.some((fav) => fav.id === planner.id) || false;
  const likes = planner.likes + (isLiked ? 1 : 0); // 찜 상태면 +1

  // Mock 일정 데이터 생성 (planner.days 만큼 생성)
  const mockDayPlans: DayPlan[] = Array.from({ length: planner.days }, (_, i) => ({
    id: `day-${i + 1}`,
    day: i + 1,
    places: mockPlaces.slice(i * 2, i * 2 + 3),
    memo: i === 0 ? '첫날은 여유롭게 시작하기' : i === planner.days - 1 ? '마지막 날 기념품 구매' : '',
  }));

  const isPublic = true; // Mock 데이터로 공개 플래너로 설정
  const startDate = '2025-12-25';
  const endDate = '2025-12-27';

  const getDaysDifference = () => {
    return planner.days;
  };

  const handleLike = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (onToggleFavoritePlanner) {
      onToggleFavoritePlanner(planner);
    }
  };

  const handleShare = () => {
    const shareLink = `https://간단여행.com/planner/${planner.id}`;
    navigator.clipboard.writeText(shareLink);
    alert(`공유 링크가 복사되었습니다!\n${shareLink}`);
  };

  const handleEdit = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (onEdit) {
      onEdit({
        id: planner.id,
        title: planner.title,
        author: planner.author,
        region: planner.region,
        startDate,
        endDate,
        isPublic,
        dayPlans: mockDayPlans,
      });
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavoritePlanner && isLoggedIn) {
      onToggleFavoritePlanner(planner);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{planner.title}</h1>
        <div className="w-10" /> {/* 균형 맞추기 */}
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 - 플래너 미리보기 */}
        {isLeftSidebarOpen && (
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              {/* 플래너 미리보기 제목 & 편집하기, 좋아요 버튼 */}
              <div className="flex items-center gap-2 mb-4">
                <h3 className="whitespace-nowrap text-sm">플래너 미리보기</h3>
                <div className="flex gap-1 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={`flex-1 text-xs px-2 py-1 h-7 ${
                      isLiked ? 'text-red-500 border-red-500' : ''
                    }`}
                  >
                    <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                    {likes}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    className="flex-1 text-xs px-2 py-1 h-7"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    편집
                  </Button>
                </div>
              </div>

              {/* 제목 & 작성자 통합 */}
              <div className="mb-3">
                <div className="px-3 py-2 border rounded bg-gray-50 text-gray-700">
                  <span className="font-semibold text-blue-600">{planner.author}</span>의 {planner.title}
                </div>
              </div>

              {/* 날짜 (읽기 전용) */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-gray-600 px-3 py-2 border rounded bg-gray-50">
                    {startDate} ~ {endDate} ({getDaysDifference()}일)
                  </div>
                </div>

                {/* 지역 & 날씨 */}
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPinIcon className="h-4 w-4 text-blue-600" />
                    <span>{planner.region}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">15°C</span>
                  </div>
                </div>
              </div>

              {/* DAY 리스트 (읽기 전용) */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">일정</h4>
                <div className="space-y-3">
                  {mockDayPlans.map((dayPlan) => (
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
                        {/* 장소 목록 */}
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

        {/* 토글 버튼 (왼쪽) */}
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
