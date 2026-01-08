/**
 * PlannerPreviewPage.tsx - 플래너 미리보기 페이지
 * 
 * 레이아웃:
 * - 나의 작성한 플래너: 버튼(찜/삭제/공유/편집) 맨 위 → 제목 → 날짜 → 일정
 * - 전체 플래너: 제목 → 날짜 → 일정(+찜 버튼 옆)
 * 
 * 수정: 사이드바 스크롤 PlannerEditPage처럼 적용
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  MapPin as MapPinIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getContentTypeStyle, getPlannerDayColor } from '../../utils/contentTypeUtils';
import { getPlannerDetail } from '../../api/plannerApi';
import type { PlannerDetail, DayPlanDetail } from '../../api/plannerApi';
import KakaoMap from '../../components/map/KakaoMap';
import type { KakaoMapRef, PlannerPlace } from '../../components/map/KakaoMap';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
  mapx?: number;
  mapy?: number;
  contentid?: string;
  contenttypeid?: string;
}

interface DayPlan {
  id: string;
  day: number;
  places: Place[];
  memo: string;
}

interface PlannerPreviewPageProps {
  planner: {
    id?: number;      // ★ PlannerMainPage에서 사용
    plnId?: number;   // ★ MyPage, BoardPage에서 사용
    title?: string;
    plnTitle?: string;
    author?: string;
    region?: string;
    days?: number;
    image?: string;
    likes?: number;
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
  // 경북 경주시, 전북 전주시, 경기 성남시 등
  if (second.endsWith('시') || second.endsWith('군')) {
    return `${sido} ${second}`;
  }
  
  return `${sido} ${second}`;
};

const convertToDayPlan = (dayPlanDetail: DayPlanDetail): DayPlan => ({
  id: `day-${dayPlanDetail.dayNumber}`,
  day: dayPlanDetail.dayNumber,
  memo: dayPlanDetail.memo || '',
  places: dayPlanDetail.places.map((place) => ({
    id: `${place.contentid}-${place.placeId}`,
    name: place.title,
    category: place.contenttypeid || '12',
    region: shortenAddress(place.addr1 || ''),
    image: place.firstimage || DEFAULT_IMAGE,
    contentid: place.contentid,
    contenttypeid: place.contenttypeid,
    mapx: Number(place.mapx),
    mapy: Number(place.mapy),
  })),
});

/**
 * 현재 로그인한 사용자 ID 가져오기
 */
const getCurrentUserId = (): number | null => {
  const memberInfo = localStorage.getItem('memberInfo');
  if (memberInfo) {
    try {
      const member = JSON.parse(memberInfo);
      return member.mId || null;
    } catch {
      return null;
    }
  }
  return null;
};

export function PlannerPreviewPage({ 
  planner, 
  onBack, 
  onEdit, 
}: PlannerPreviewPageProps) {
  const mapRef = useRef<KakaoMapRef>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [plannerDetail, setPlannerDetail] = useState<PlannerDetail | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  
  // ★ plnId 또는 id 둘 다 지원
  const plannerId = planner.plnId || planner.id;
  
  // 찜 상태 관리
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(planner.likes || 0);

  // 본인 플래너인지 확인
  const currentUserId = getCurrentUserId();
  const isOwner = plannerDetail ? plannerDetail.mId === currentUserId : false;

  /**
   * dayPlans를 KakaoMap용 PlannerPlace 배열로 변환
   */
  const plannerPlacesForMap = useMemo((): PlannerPlace[] => {
    const places: PlannerPlace[] = [];
    
    dayPlans.forEach((dayPlan) => {
      dayPlan.places.forEach((place, index) => {
        if (place.mapx && place.mapy) {
          places.push({
            contentid: place.contentid || place.id,
            contenttypeid: place.contenttypeid,
            title: place.name,
            mapx: place.mapx,
            mapy: place.mapy,
            dayNumber: dayPlan.day,
            orderNumber: index + 1,
            addr1: place.region,
            firstimage: place.image,
            firstimage2: place.image,
          });
        }
      });
    });
    
    return places;
  }, [dayPlans]);

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

  /**
   * 찜 여부 확인 API
   */
  const checkFavoriteStatus = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/planner/${plannerId}/favorite`, {
        params: { mId: userId }
      });
      
      if (response.data.status === 'success') {
        setIsLiked(response.data.isFavorite);
        setLikeCount(response.data.favoriteCount);
      }
    } catch (error) {
      console.error('찜 상태 확인 실패:', error);
    }
  };

  /**
   * 플래너 상세 데이터 조회
   */
  const fetchPlannerDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getPlannerDetail(plannerId);
      setPlannerDetail(detail);
      setLikeCount(detail.favoriteCount || 0);
      
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
      
      // 찜 상태 확인
      await checkFavoriteStatus();
    } catch (err: any) {
      console.error('플래너 상세 조회 실패:', err);
      setError('플래너 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 페이지 진입 시 스크롤 맨 위로 초기화
    window.scrollTo(0, 0);
    fetchPlannerDetail();
  }, [plannerId]);

  /**
   * 찜 토글 핸들러 (API 직접 호출)
   */
  const handleLike = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/planner/${plannerId}/favorite`, null, {
        params: { mId: userId }
      });
      
      if (response.data.status === 'success') {
        setIsLiked(response.data.isFavorite);
        setLikeCount(response.data.favoriteCount);
      }
    } catch (error) {
      console.error('찜 토글 실패:', error);
      alert('찜 기능 처리 중 오류가 발생했습니다.');
    }
  };

  /**
   * 삭제 버튼 클릭 핸들러
   */
  const handleDelete = async () => {
    if (!window.confirm('정말 이 플래너를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/planner/${plannerId}`);
      
      if (response.data.status === 'success') {
        alert('플래너가 삭제되었습니다.');
        onBack();
      }
    } catch (error) {
      console.error('플래너 삭제 실패:', error);
      alert('플래너 삭제 중 오류가 발생했습니다.');
    }
  };

  /**
   * 공유 버튼 클릭 핸들러
   */
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/planner/preview/${plannerId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`공유 링크가 복사되었습니다!\n\n${shareUrl}`);
    } catch (error) {
      console.error('공유 링크 복사 실패:', error);
      alert('공유 링크 복사 중 오류가 발생했습니다.');
    }
  };

  /**
   * 편집 버튼 클릭 핸들러
   */
  const handleEdit = () => {
    const userId = getCurrentUserId();
    if (!userId) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    
    if (!isOwner) {
      alert('본인이 작성한 플래너만 편집할 수 있습니다.');
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
      const contentid = place.contentid || place.id.split('-')[0];
      mapRef.current.selectPlannerMarker(contentid);
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
  const title = plannerDetail?.plnTitle || planner.title || planner.plnTitle || '';
  const author = plannerDetail?.authorNickname || planner.author || '';
  const startDate = plannerDetail?.startDate || '';
  const endDate = plannerDetail?.endDate || '';
  const totalDays = plannerDetail?.totalDays || planner.days || 0;

  /**
   * DAY 리스트 렌더링 (공통)
   */
  const renderDayList = () => (
    <div className="space-y-3">
      {dayPlans.map((dayPlan) => {
        const dayColor = getPlannerDayColor(dayPlan.day);

        return (
          <div key={dayPlan.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* ★ Day 헤더 - 일차별 색상 */}
            <div 
              className="text-white p-3"
              style={{ backgroundColor: dayColor }}
            >
              <div className="flex items-center justify-between">
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
                  dayPlan.places.map((place, index) => {
                    const categoryStyle = getContentTypeStyle(place.contenttypeid || place.category);
                    
                    return (
                      <button
                        key={place.id}
                        onClick={() => handlePlaceClick(place)}
                        className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                      >
                        {/* ★ 번호 아이콘 - 일차별 색상 */}
                        <div 
                          className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: dayColor }}
                        >
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
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPinIcon className="h-3 w-3" />
                            <span>{place.region}</span>
                          </div>
                        </div>
                        {/* ★ 카테고리 배지 - 색상 적용 */}
                        <span 
                          className="text-xs px-2 py-1 rounded flex-shrink-0"
                          style={{
                            backgroundColor: `${categoryStyle.markerColor}20`,
                            color: categoryStyle.markerColor
                          }}
                        >
                          {categoryStyle.name}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">
                    등록된 장소가 없습니다
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 상단 헤더 */}
      <header className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="w-10" /> {/* 중앙 정렬을 위한 빈 공간 */}
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 */}
        {isLeftSidebarOpen && (
          <div className="w-80 bg-white border-r flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              
              {/* ===== 나의 플래너 레이아웃 (isOwner === true) ===== */}
              {isOwner ? (
                <>
                  {/* 1. 삭제/공유/편집 버튼 맨 위 */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      공유
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      편집
                    </Button>
                  </div>

                  {/* 2. 제목 */}
                  <div className="mb-3">
                    <div className="px-3 py-2 border rounded bg-gray-50 text-gray-700">
                      <span className="font-semibold text-blue-600">{author}</span>의 플래너
                    </div>
                  </div>

                  {/* 3. 날짜 */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 px-3 py-2 border rounded bg-gray-50">
                      {startDate} ~ {endDate} ({totalDays}일)
                    </div>
                  </div>

                  {/* 4. 일정 라벨 + 찜 버튼 */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">일정</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={`${isLiked ? 'text-red-500 border-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                      {likeCount}
                    </Button>
                  </div>

                  {/* 5. DAY 리스트 */}
                  {renderDayList()}
                </>
              ) : (
                /* ===== 전체 플래너 레이아웃 (isOwner === false) ===== */
                <>
                  {/* 1. 제목 */}
                  <div className="mb-3">
                    <div className="px-3 py-2 border rounded bg-gray-50 text-gray-700">
                      <span className="font-semibold text-blue-600">{author}</span>의 플래너
                    </div>
                  </div>

                  {/* 2. 날짜 */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 px-3 py-2 border rounded bg-gray-50">
                      {startDate} ~ {endDate} ({totalDays}일)
                    </div>
                  </div>

                  {/* 3. 일정 라벨 + 찜 버튼 */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">일정</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={`${isLiked ? 'text-red-500 border-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                      {likeCount}
                    </Button>
                  </div>

                  {/* 4. DAY 리스트 */}
                  {renderDayList()}
                </>
              )}

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

        {/* 중앙 지도 - 카카오맵 */}
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
