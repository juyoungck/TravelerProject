/**
 * PlannerEditPage.tsx - 플래너 편집 페이지
 * 3단 레이아웃(왼쪽 편집 사이드바, 중앙 지도, 오른쪽 검색) + React DnD 드래그 앤 드롭 기능
 * 백엔드 API 연동 완료 + 지역 선택 기능
 * 
 * 수정: 중앙 지도 영역에 카카오맵 컴포넌트 추가
 * 수정: 일차 추가 버튼 삭제 (날짜에 따라 자동 생성)
 * 수정: 저장 버튼에 outline 스타일 추가
 * 수정: handleMovePlace, handleRemovePlace 함수 시그니처 수정 (드래그앤드롭 정상 작동)
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ArrowLeft,
  Save,
  Trash2,
  Share2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Globe,
  Lock,
  Loader2,
  Heart,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PlannerDayList } from '../../components/planner/PlannerDayList';
import { PlannerSearchResults } from '../../components/planner/PlannerSearchResults';
import { createPlanner, updatePlanner, deletePlanner, createShareLink } from '../../api/plannerApi';
import type { PlannerRequest, DayPlanRequest } from '../../api/plannerApi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + ":8080/api";
import KakaoMap from '../../components/map/KakaoMap';
import type { KakaoMapRef, PlannerPlace } from '../../components/map/KakaoMap';

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

interface RegnCode {
  lDongRegnCd: string;
  regnName: string;
}

interface SignguCode {
  lDongRegnCd: string;
  lDongSignguCd: string;
  signguName: string;
}

interface PlannerEditPageProps {
  onBack: () => void;
  initialData?: {
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
  } | null;
}

/** 시도 이름 간략화 */
const shortenRegnName = (name: string): string => {
  return name
    .replace('특별시', '')
    .replace('광역시', '')
    .replace('특별자치시', '')
    .replace('특별자치도', '')
    .replace('충청남도', '충남')
    .replace('충청북도', '충북')
    .replace('경상북도', '경북')
    .replace('경상남도', '경남')
    .replace('전라남도', '전남')
    .replace('경기도', '경기');
};

export function PlannerEditPage({ onBack, initialData }: PlannerEditPageProps) {
  const [plannerId, setPlannerId] = useState<number | null>(initialData?.id || null);
  const mapRef = useRef<KakaoMapRef>(null);
  
  const [title, setTitle] = useState(initialData?.title || '나의 여행 플랜');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [startDate, setStartDate] = useState(initialData?.startDate || '2025-12-25');
  const [endDate, setEndDate] = useState(initialData?.endDate || '2025-12-27');
  const [selectedRegion, setSelectedRegion] = useState(initialData?.region || '전체');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['전체']);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(
    initialData?.dayPlans || [{ id: 'day-1', day: 1, places: [], memo: '' }]
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  // 지역 관련 상태
  const [regnCodes, setRegnCodes] = useState<RegnCode[]>([]);
  const [signguCodes, setSignguCodes] = useState<SignguCode[]>([]);
  const [selectedLDongRegnCd, setSelectedLDongRegnCd] = useState<string>(initialData?.lDongRegnCd || '');
  const [selectedLDongSignguCd, setSelectedLDongSignguCd] = useState<string>(initialData?.lDongSignguCd || '');
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(true);
  
  // 로딩 상태
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 찜 상태
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 현재 로그인한 사용자 ID 가져오기
  const getCurrentUserId = (): number => {
    const memberInfo = localStorage.getItem('memberInfo');
    if (memberInfo) {
      const member = JSON.parse(memberInfo);
      return member.mId || 1;
    }
    return 1;
  };

  const currentUserId = getCurrentUserId();

  // 시도 목록 로드
  useEffect(() => {
    fetchRegnCodes();
  }, []);

  // 시도 목록 로드 완료 후 초기 지역 이름 설정
  useEffect(() => {
    if (regnCodes.length > 0 && initialData?.lDongRegnCd) {
      const regn = regnCodes.find(r => r.lDongRegnCd === initialData.lDongRegnCd);
      if (regn) {
        setSelectedRegion(shortenRegnName(regn.regnName));
      }
    }
  }, [regnCodes, initialData?.lDongRegnCd]);

  // 시군구 목록 로드 완료 후 초기 시군구 이름 설정
  useEffect(() => {
    if (signguCodes.length > 0 && initialData?.lDongSignguCd) {
      const signgu = signguCodes.find(s => s.lDongSignguCd === initialData.lDongSignguCd);
      if (signgu) {
        setSelectedCity(signgu.signguName);
      }
    }
  }, [signguCodes, initialData?.lDongSignguCd]);

  // 플래너 찜 여부 확인 (수정 모드일 때)
  useEffect(() => {
    if (plannerId) {
      checkFavoriteStatus();
    }
  }, [plannerId]);

  // 시도 선택 시 시군구 목록 로드
  useEffect(() => {
    if (selectedLDongRegnCd) {
      fetchSignguCodes(selectedLDongRegnCd);
    } else {
      setSignguCodes([]);
      setSelectedLDongSignguCd('');
    }
  }, [selectedLDongRegnCd]);

  // 날짜 변경 시 DAY 자동 생성
  useEffect(() => {
    const days = getDaysDifference();
    if (days > 0 && days !== dayPlans.length) {
      const newDayPlans: DayPlan[] = [];
      for (let i = 1; i <= days; i++) {
        const existingDay = dayPlans.find(d => d.day === i);
        if (existingDay) {
          newDayPlans.push(existingDay);
        } else {
          newDayPlans.push({
            id: `day-${i}-${Date.now()}`,
            day: i,
            places: [],
            memo: '',
          });
        }
      }
      setDayPlans(newDayPlans);
    }
  }, [startDate, endDate]);

  const fetchRegnCodes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ldong/regn`);
      if (response.data.status === 'success') {
        setRegnCodes(response.data.data || []);
      }
    } catch (error) {
      console.error('시도 목록 로드 실패:', error);
    }
  };

  /**
   * 찜 여부 확인 API
   */
  const checkFavoriteStatus = async () => {
    if (!plannerId) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/planner/${plannerId}/favorite`, {
        params: { mId: currentUserId }
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
   * 찜 토글 핸들러
   */
  const handleToggleFavorite = async () => {
    if (!plannerId) {
      alert('먼저 플래너를 저장해주세요.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/planner/${plannerId}/favorite`, null, {
        params: { mId: currentUserId }
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

  const fetchSignguCodes = async (regnCd: string) => {
    setIsLoadingRegions(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ldong/signgu/${regnCd}`);
      if (response.data.status === 'success') {
        setSignguCodes(response.data.data || []);
      }
    } catch (error) {
      console.error('시군구 목록 로드 실패:', error);
    } finally {
      setIsLoadingRegions(false);
    }
  };

  const handleRegnSelect = (regnCd: string, regnName: string) => {
    if (selectedLDongRegnCd === regnCd) {
      setSelectedLDongRegnCd('');
      setSelectedLDongSignguCd('');
      setSelectedRegion('전체');
    } else {
      setSelectedLDongRegnCd(regnCd);
      setSelectedLDongSignguCd('');
      setSelectedRegion(regnName);
    }
  };

  const handleSignguSelect = (signguCd: string, signguName: string) => {
    if (selectedLDongSignguCd === signguCd) {
      setSelectedLDongSignguCd('');
      setSelectedCity('');
    } else {
      setSelectedLDongSignguCd(signguCd);
      setSelectedCity(signguName);
    }
  };

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

  const toggleCategory = (category: string) => {
    if (category === '전체') {
      setSelectedCategories(['전체']);
    } else {
      let newCategories = selectedCategories.filter(c => c !== '전체');
      if (newCategories.includes(category)) {
        newCategories = newCategories.filter(c => c !== category);
      } else {
        newCategories.push(category);
      }
      if (newCategories.length === 0) {
        newCategories = ['전체'];
      }
      setSelectedCategories(newCategories);
    }
  };

  const buildPlannerRequest = (): PlannerRequest => {
    const dayPlanRequests: DayPlanRequest[] = dayPlans.map((dayPlan, index) => {
      const tripDate = new Date(startDate);
      tripDate.setDate(tripDate.getDate() + index);
      const tripDateStr = tripDate.toISOString().split('T')[0];

      return {
        dayNumber: dayPlan.day,
        tripDate: tripDateStr,
        memo: dayPlan.memo || '',
        places: dayPlan.places.map((place, placeIndex) => ({
          contentid: place.contentid || place.id.split('-')[0],
          sortOrder: placeIndex + 1,
        })),
      };
    });

    return {
      mId: currentUserId,
      plnTitle: title,
      startDate: startDate,
      endDate: endDate,
      lDongRegnCd: selectedLDongRegnCd || undefined,
      lDongSignguCd: selectedLDongSignguCd || undefined,
      isPublic: isPublic ? 1 : 0,
      dayPlans: dayPlanRequests,
    };
  };

  const validatePlanner = (): string | null => {
    if (!title.trim()) {
      return '플래너 제목을 입력해주세요.';
    }
    if (title.trim().length > 100) {
      return '플래너 제목은 100자 이내로 입력해주세요.';
    }
    if (!startDate || !endDate) {
      return '여행 시작일과 종료일을 선택해주세요.';
    }
    if (new Date(startDate) > new Date(endDate)) {
      return '종료일이 시작일보다 빠를 수 없습니다.';
    }
    const totalPlaces = dayPlans.reduce((sum, day) => sum + day.places.length, 0);
    if (totalPlaces === 0) {
      return '최소 1개 이상의 장소를 추가해주세요.\n오른쪽 검색 패널에서 장소를 드래그하여 일정에 추가할 수 있습니다.';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validatePlanner();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const requestData = buildPlannerRequest();

      if (plannerId) {
        await updatePlanner(plannerId, requestData);
        alert('플래너가 저장되었습니다.');
      } else {
        const result = await createPlanner(requestData);
        setPlannerId(result.plnId);
        alert('플래너가 생성되었습니다.');
      }
      onBack();
    } catch (error: any) {
      console.error('플래너 저장 실패:', error);
      alert(`저장 실패: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!plannerId) return;
    
    if (!window.confirm('정말 이 플래너를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePlanner(plannerId);
      alert('플래너가 삭제되었습니다.');
      onBack();
    } catch (error: any) {
      console.error('플래너 삭제 실패:', error);
      alert(`삭제 실패: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!plannerId) {
      alert('먼저 플래너를 저장해주세요.');
      return;
    }

    try {
      const shareLink = await createShareLink(plannerId);
      const shareUrl = `${window.location.origin}/planner/share/${shareLink}`;
      
      await navigator.clipboard.writeText(shareUrl);
      alert(`공유 링크가 복사되었습니다!\n\n${shareUrl}`);
    } catch (error: any) {
      console.error('공유 링크 생성 실패:', error);
      alert(`공유 실패: ${error.response?.data?.message || error.message}`);
    }
  };

  const getDaysDifference = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  /**
   * 장소 이동 (Day 간 이동 + 같은 Day 내 순서 변경)
   * @param placeId 이동할 장소 ID
   * @param fromDayId 출발 Day ID
   * @param toDayId 도착 Day ID
   * @param toIndex 도착 위치 인덱스
   */
  const handleMovePlace = (
    placeId: string,
    fromDayId: string,
    toDayId: string,
    toIndex: number
  ) => {
    setDayPlans((prevDayPlans) => {
      const newDayPlans = [...prevDayPlans];

      // 출발 Day 찾기
      const fromDayIndex = newDayPlans.findIndex((d) => d.id === fromDayId);
      // 도착 Day 찾기
      const toDayIndex = newDayPlans.findIndex((d) => d.id === toDayId);

      if (fromDayIndex === -1 || toDayIndex === -1) return prevDayPlans;

      // 출발 Day에서 장소 찾기
      const fromDay = { ...newDayPlans[fromDayIndex] };
      fromDay.places = [...fromDay.places];
      
      const placeIndex = fromDay.places.findIndex((p) => p.id === placeId);
      if (placeIndex === -1) return prevDayPlans;

      // 장소 제거
      const [movedPlace] = fromDay.places.splice(placeIndex, 1);

      if (fromDayId === toDayId) {
        // 같은 Day 내 이동 - 인덱스 조정
        let adjustedIndex = toIndex;
        if (placeIndex < toIndex) {
          adjustedIndex = toIndex - 1;
        }
        fromDay.places.splice(adjustedIndex, 0, movedPlace);
        newDayPlans[fromDayIndex] = fromDay;
      } else {
        // 다른 Day로 이동
        const toDay = { ...newDayPlans[toDayIndex] };
        toDay.places = [...toDay.places];
        toDay.places.splice(toIndex, 0, movedPlace);
        
        newDayPlans[fromDayIndex] = fromDay;
        newDayPlans[toDayIndex] = toDay;
      }

      return newDayPlans;
    });
  };

  /**
   * 새 장소 추가 (검색 결과에서 드래그)
   */
  const handleAddPlaceAtIndex = (place: Place, dayId: string, index?: number) => {
  
    console.log('🟢 handleAddPlaceAtIndex 호출');
    console.log('place:', place);
    console.log('place.contenttypeid:', place.contenttypeid);

    setDayPlans((prevDayPlans) => {
      const newDayPlans = [...prevDayPlans];
      const dayIndex = newDayPlans.findIndex((d) => d.id === dayId);
      
      if (dayIndex === -1) return prevDayPlans;

      const day = { ...newDayPlans[dayIndex] };
      day.places = [...day.places];
      
      const newPlace = {
        ...place,
        id: `${place.id}-${Date.now()}`,
        contentid: place.contentid || place.id,
        contenttypeid: place.contenttypeid || place.category,
      };

      if (index !== undefined && index >= 0) {
        day.places.splice(index, 0, newPlace);
      } else {
        day.places.push(newPlace);
      }
      
      newDayPlans[dayIndex] = day;
      return newDayPlans;
    });
  };

  /**
   * 장소 삭제
   * @param dayId Day ID
   * @param placeId 삭제할 장소 ID
   */
  const handleRemovePlace = (dayId: string, placeId: string) => {
    setDayPlans((prevDayPlans) => {
      const newDayPlans = [...prevDayPlans];
      const dayIndex = newDayPlans.findIndex((d) => d.id === dayId);
      
      if (dayIndex === -1) return prevDayPlans;

      const day = { ...newDayPlans[dayIndex] };
      day.places = day.places.filter((p) => p.id !== placeId);
      
      newDayPlans[dayIndex] = day;
      return newDayPlans;
    });
  };

  const handleUpdateMemo = (dayId: string, memo: string) => {
    setDayPlans((prevDayPlans) => {
      const newDayPlans = [...prevDayPlans];
      const dayIndex = newDayPlans.findIndex((d) => d.id === dayId);
      
      if (dayIndex === -1) return prevDayPlans;

      newDayPlans[dayIndex] = { ...newDayPlans[dayIndex], memo };
      return newDayPlans;
    });
  };

  const handleDeleteDay = (dayId: string) => {
    if (dayPlans.length <= 1) {
      alert('최소 1일 이상의 일정이 필요합니다.');
      return;
    }
    
    setDayPlans((prevDayPlans) => {
      const filtered = prevDayPlans.filter((d) => d.id !== dayId);
      return filtered.map((day, index) => ({
        ...day,
        day: index + 1,
      }));
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* 상단 헤더 */}
        <header className="bg-white border-b px-4 py-2 flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold ml-2">
            {plannerId ? '플래너 수정' : '새 플래너 만들기'}
          </h1>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 왼쪽 사이드바 */}
          {isLeftSidebarOpen && (
            <div className="w-80 bg-white border-r overflow-y-auto">
              <div className="p-4">
                {/* 찜/삭제/공유/저장 버튼 */}
                {/* 1. 삭제/공유/저장 버튼 맨 위 */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {plannerId ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        삭제
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-1" />
                        공유
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        저장
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="col-span-3"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      저장
                    </Button>
                  )}
                </div>

                {/* 플래너 제목 */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="font-semibold"
                      placeholder="플래너 제목"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setIsPublic(true)}
                        className={`p-2 rounded border transition-colors ${
                          isPublic
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300'
                        }`}
                        title="공개"
                      >
                        <Globe className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setIsPublic(false)}
                        className={`p-2 rounded border transition-colors ${
                          !isPublic
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-gray-600 border-gray-300'
                        }`}
                        title="비공개"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 날짜 선택 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {startDate} ~ {endDate} ({getDaysDifference()}일)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">시작일</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onKeyDown={(e) => e.preventDefault()}
                        className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">종료일</label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onKeyDown={(e) => e.preventDefault()}
                        className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 지역 선택 (시도) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">지역 (시/도)</h4>
                      {selectedLDongRegnCd && (
                        <span className="text-sm text-blue-600">
                          {selectedRegion} {selectedCity}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsRegionOpen(!isRegionOpen)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      {isRegionOpen ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          접기
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          열기
                        </>
                      )}
                    </button>
                  </div>

                  {isRegionOpen && (
                    <>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        <button
                          onClick={() => {
                            setSelectedLDongRegnCd('');
                            setSelectedLDongSignguCd('');
                            setSelectedRegion('전체');
                            setSelectedCity('');
                          }}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            !selectedLDongRegnCd
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                          }`}
                        >
                          전체
                        </button>
                        {regnCodes.map((regn) => (
                          <button
                            key={regn.lDongRegnCd}
                            onClick={() => handleRegnSelect(regn.lDongRegnCd, shortenRegnName(regn.regnName))}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              selectedLDongRegnCd === regn.lDongRegnCd
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                            }`}
                          >
                            {shortenRegnName(regn.regnName)}
                          </button>
                        ))}
                      </div>

                      {/* 시군구 선택 */}
                      {selectedLDongRegnCd && (
                        <div className="mt-3">
                          <h5 className="mb-2 text-xs text-gray-600 flex items-center gap-1">
                            시/군/구
                            {isLoadingRegions && <Loader2 className="h-3 w-3 animate-spin" />}
                          </h5>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            <button
                              onClick={() => {
                                setSelectedLDongSignguCd('');
                                setSelectedCity('');
                              }}
                              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                !selectedLDongSignguCd
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                              }`}
                            >
                              전체
                            </button>
                            {signguCodes.map((signgu) => (
                              <button
                                key={signgu.lDongSignguCd}
                                onClick={() => handleSignguSelect(signgu.lDongSignguCd, signgu.signguName)}
                                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                  selectedLDongSignguCd === signgu.lDongSignguCd
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                                }`}
                              >
                                {signgu.signguName}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* DAY 리스트 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">일정</h4>
                    {plannerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleFavorite}
                        className={`${
                          isLiked ? 'text-red-500 border-red-500' : ''
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                        {likeCount}
                      </Button>
                    )}
                  </div>
                  <PlannerDayList
                    dayPlans={dayPlans}
                    onMovePlace={handleMovePlace}
                    onAddPlaceAtIndex={handleAddPlaceAtIndex}
                    onUpdateMemo={handleUpdateMemo}
                    onDeleteDay={handleDeleteDay}
                    onRemovePlace={handleRemovePlace}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 토글 버튼 (왼쪽) */}
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="w-6 bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            {isLeftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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

          {/* 토글 버튼 (오른쪽) */}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="w-6 bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            {isRightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* 오른쪽 사이드바 - 검색 결과 */}
          {isRightSidebarOpen && (
            <div className="w-80 bg-white border-l overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-4">플래너 검색</h3>
                <Input
                  type="search"
                  placeholder="장소를 검색하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />

                {/* 카테고리 선택 */}
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold">카테고리</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['전체', '관광', '문화', '레저', '숙박', '쇼핑', '음식'].map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-2 py-2 text-xs rounded border transition-colors ${
                          selectedCategories.includes(category)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <PlannerSearchResults
                  category={selectedCategories}
                  region={selectedRegion}
                  searchQuery={searchQuery}
                  dayPlans={dayPlans}
                  onAddPlace={handleAddPlaceAtIndex}
                  lDongRegnCd={selectedLDongRegnCd}
                  lDongSignguCd={selectedLDongSignguCd}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
