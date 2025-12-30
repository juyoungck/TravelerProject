/**
 * PlannerPreviewPage.tsx - 플래너 미리보기 페이지
 * 플래너 내용을 읽기 전용으로 보여주고 찜 기능 제공
 * 백엔드 API 연동 완료
 *
 * 수정: 중앙 지도 영역에 카카오맵 컴포넌트 추가
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  MapPin as MapPinIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  Edit,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getPlannerDetail, PlannerDetail, DayPlanDetail } from '../../api/plannerApi';
import KakaoMap, { KakaoMapRef, PlannerPlace } from '../../components/map/KakaoMap';

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
  mapx?: number;
  mapy?: number;
  contentid?: string;
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
    isOwn?: boolean;
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
    lDongRegnCd?: string;
    lDongSignguCd?: string;
  }) => void;
  isLoggedIn?: boolean;
  favoritePlanners?: any[];
  onToggleFavoritePlanner?: (planner: any) => void;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400';

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
    contentid: place.contentid,
    mapx: place.mapx,
    mapy: place.mapy,
  })),
});

export function PlannerPreviewPage({ 
  planner, 
  onBack, 
  onEdit, 
  isLoggedIn, 
  favoritePlanners, 
  onToggleFavoritePlanner 
}: PlannerPreviewPageProps) {
  const mapRef = useRef<KakaoMapRef>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [plannerDetail, setPlannerDetail] = useState<PlannerDetail | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);

  // ★ isLiked 계산
  const isLiked = favoritePlanners?.some((fav) => fav.id === planner.id) || false;
  const likes = (plannerDetail?.favoriteCount || planner.likes);

  /**
   * dayPlans를 KakaoMap용 PlannerPlace 배열로 변환
   */
  const plannerPlacesForMap = useMemo((): PlannerPlace[] => {
    const places: PlannerPlace[] = [];
    
    dayPlans.forEach((dayPlan) => {  // ★ mockDayPlans → dayPlans
      dayPlan.places.forEach((place, index) => {
        if (place.mapx && place.mapy) {
          places.push({
            contentid: place.contentid || place.id,
            title: place.name,
            mapx: place.mapx,
            mapy: place.mapy,
            dayNumber: dayPlan.day,
            orderNumber: index + 1,
          });
        }
      });
    });
    
    return places;
  }, [dayPlans]);  // ★ mockDayPlans → dayPlans

  /**
   * 지도 중심 좌표 계산
   */
  const mapCenter = useMemo(() => {
    if (plannerPlacesForMap.length > 0) {
      return {
        lat: plannerPlacesForMap[0].mapy,
        lng: plannerPlacesForMap[0].mapx,
      };
    }
    return { lat: 37.5665, lng: 126.9780 };
  }, [plannerPlacesForMap]);

  // ★ 중복 선언 제거됨 (startDate, endDate, isPublic)

  /**
   * 플래너 상세 데이터 조회
   */
  const fetchPlannerDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getPlannerDetail(planner.id);
      setPlannerDetail(detail);
      
      if (detail.dayPlans && detail.dayPlans.length > 0) {
        const converted = detail.dayPlans.map(convertToDayPlan);
        setDayPlans(converted);
      } else {
        const emptyDays: DayPlan[] = Array.from({ length: detail.totalDays }, (_, i) => ({
          id: `day-${i + 1}`,
          day: i + 1,
          places: [],
          memo: '',
        }));
        setDayPlans(emptyDays);
      }
    } catch (err: any) {
      console.error('플래너 상세 조회 실패:', err);
      setError('플래너 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerDetail();
  }, [planner.id]);

  const handleLike = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (onToggleFavoritePlanner) {
      onToggleFavoritePlanner(planner);
    }
  };

  const handleEdit = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (onEdit && plannerDetail) {
      onEdit({
        id: plannerDetail.plnId,
        title: plannerDetail.plnTitle,
        author: plannerDetail.authorNickname || '',
        region: plannerDetail.regionName || '',
        startDate: plannerDetail.startDate,
        endDate: plannerDetail.endDate,
        isPublic: plannerDetail.isPublic === 1,
        dayPlans: dayPlans,
        lDongRegnCd: plannerDetail.lDongRegnCd,
        lDongSignguCd: plannerDetail.lDongSignguCd,
      });
    }
  };

  /**
   * 장소 클릭 시 지도 이동
   */
  const handlePlaceClick = (place: Place) => {
    if (place.mapx && place.mapy && mapRef.current) {
      mapRef.current.setCenter(place.mapy, place.mapx, 5);
    }
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">플래너 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    );
  }

  // 데이터 표시용 변수
  const title = plannerDetail?.plnTitle || planner.title;
  const author = plannerDetail?.authorNickname || planner.author;
  const region = plannerDetail?.regionName || planner.region;
  const startDate = plannerDetail?.startDate || '';
  const endDate = plannerDetail?.endDate || '';
  const totalDays = plannerDetail?.totalDays || planner.days;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="w-10" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 - 플래너 미리보기 */}
        {isLeftSidebarOpen && (
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              {/* 플래너 미리보기 제목 & 편집하기, 좋아요 버튼 */}
              <div className="flex items-center gap-2 mb-4">
                <h3 className="whitespace-nowrap text-sm font-semibold">플래너 미리보기</h3>
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
                  <span className="font-semibold text-blue-600">{author}</span>의 {title}
                </div>
              </div>

              {/* 날짜 (읽기 전용) */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-gray-600 px-3 py-2 border rounded bg-gray-50">
                    {startDate} ~ {endDate} ({totalDays}일)
                  </div>
                </div>
              </div>

              {/* DAY 리스트 (읽기 전용) */}
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
                              <button
                                key={place.id}
                                onClick={() => handlePlaceClick(place)}
                                className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
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
                              </button>
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

        {/* ★ 중앙 지도 - 카카오맵 (항상 표시) */}
        <div className="flex-1 relative">
          <KakaoMap
            ref={mapRef}
            centerLat={mapCenter.lat}
            centerLng={mapCenter.lng}
            level={7}
            plannerPlaces={plannerPlacesForMap}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}