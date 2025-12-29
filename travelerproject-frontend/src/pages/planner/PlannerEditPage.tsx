/**
 * PlannerEditPage.tsx - 플래너 편집 페이지
 * 3단 레이아웃(왼쪽 편집 사이드바, 중앙 지도, 오른쪽 검색) + React DnD 드래그 앤 드롭 기능
 */

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ArrowLeft,
  Save,
  Trash2,
  Share2,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  Globe,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PlannerDayList } from '../../components/planner/PlannerDayList';
import { PlannerSearchResults } from '../../components/planner/PlannerSearchResults';

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
  } | null;
}

export function PlannerEditPage({ onBack, initialData }: PlannerEditPageProps) {
  const [title, setTitle] = useState(initialData?.title || '나의 여행 플랜');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(initialData?.startDate || '2025-12-25');
  const [endDate, setEndDate] = useState(initialData?.endDate || '2025-12-27');
  const [selectedRegion, setSelectedRegion] = useState(initialData?.region || '전체');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['전체']);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(
    initialData?.dayPlans || [{ id: 'day-1', day: 1, places: [], memo: '' }]
  );
  const [searchQuery, setSearchQuery] = useState('');

  const regions = ['전체', '서울', '경기', '강원', '부산', '제주'];

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

  const handleSave = () => {
    alert('플래너가 저장되었습니다.');
    onBack();
  };

  const handleDelete = () => {
    if (confirm('정말로 삭제하시겠습니까? 삭제된 플래너는 복구할 수 없습니다.')) {
      alert('플래너가 삭제되었습니다.');
      onBack();
    }
  };

  const handleShare = () => {
    const shareLink = `https://example.com/planner/${Date.now()}`;
    navigator.clipboard.writeText(shareLink);
    alert(`공유 링크가 복사되었습니다!\n${shareLink}`);
  };

  const handleAddDay = () => {
    // 현재 최대 day 번호를 찾아서 +1
    const maxDay = dayPlans.length > 0 ? Math.max(...dayPlans.map(d => d.day)) : 0;
    const nextDay = maxDay + 1;
    
    const newDay: DayPlan = {
      id: `day-${nextDay}`,
      day: nextDay,
      places: [],
      memo: '',
    };
    setDayPlans([...dayPlans, newDay]);
  };

  const handleMovePlace = (placeId: string, fromDayId: string, toDayId: string, toIndex: number) => {
    setDayPlans((prevPlans) => {
      const newPlans = [...prevPlans];
      
      // 검색 결과에서 새로 추가하는 경우는 무시 (DraggablePlaceItem에서 처리)
      if (fromDayId === 'search') {
        return prevPlans;
      }
      
      const fromDay = newPlans.find((d) => d.id === fromDayId);
      const toDay = newPlans.find((d) => d.id === toDayId);
      
      if (!fromDay || !toDay) return prevPlans;

      const placeIndex = fromDay.places.findIndex((p) => p.id === placeId);
      if (placeIndex === -1) return prevPlans;

      const [place] = fromDay.places.splice(placeIndex, 1);
      
      // toIndex가 배열 크기보다 크면 맨 끝에 추가
      const insertIndex = Math.min(toIndex, toDay.places.length);
      toDay.places.splice(insertIndex, 0, place);

      return newPlans;
    });
  };

  const handleAddPlaceAtIndex = (place: Place, dayId: string, index: number) => {
    setDayPlans((prevPlans) => {
      const newPlans = [...prevPlans];
      const day = newPlans.find((d) => d.id === dayId);
      if (day) {
        const newPlace = {
          ...place,
          id: `${place.id}-${Date.now()}`,
        };
        const insertIndex = Math.min(index, day.places.length);
        day.places.splice(insertIndex, 0, newPlace);
      }
      return newPlans;
    });
  };

  const handleUpdateMemo = (dayId: string, memo: string) => {
    setDayPlans((prevPlans) => {
      const newPlans = [...prevPlans];
      const day = newPlans.find((d) => d.id === dayId);
      if (day) {
        day.memo = memo;
      }
      return newPlans;
    });
  };

  const handleDeleteDay = (dayId: string) => {
    if (dayPlans.length === 1) {
      alert('최소 1개의 일정이 필요합니다.');
      return;
    }
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      setDayPlans((prevPlans) => {
        // 삭제할 day의 번호 찾기
        const deletedDay = prevPlans.find(d => d.id === dayId);
        if (!deletedDay) return prevPlans;

        // 삭제 후 남은 days
        const remainingPlans = prevPlans.filter((d) => d.id !== dayId);
        
        // 삭제된 day보다 큰 번호를 가진 day들의 번호를 -1
        const reorderedPlans = remainingPlans.map(plan => {
          if (plan.day > deletedDay.day) {
            return {
              ...plan,
              day: plan.day - 1,
              id: `day-${plan.day - 1}`
            };
          }
          return plan;
        });

        return reorderedPlans;
      });
    }
  };

  const handleRemovePlace = (dayId: string, placeId: string) => {
    setDayPlans((prevPlans) => {
      const newPlans = [...prevPlans];
      const day = newPlans.find((d) => d.id === dayId);
      if (day) {
        day.places = day.places.filter((p) => p.id !== placeId);
      }
      return newPlans;
    });
  };

  const getDaysDifference = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  // 날짜 변경 시 자동으로 DAY 박스 생성
  useEffect(() => {
    const totalDays = getDaysDifference();
    
    if (totalDays <= 0) return;
    
    // 현재 DAY 개수와 비교
    const currentDaysCount = dayPlans.length;
    
    if (totalDays > currentDaysCount) {
      // DAY 추가
      const newDays: DayPlan[] = [];
      for (let i = currentDaysCount + 1; i <= totalDays; i++) {
        newDays.push({
          id: `day-${i}`,
          day: i,
          places: [],
          memo: '',
        });
      }
      setDayPlans([...dayPlans, ...newDays]);
    } else if (totalDays < currentDaysCount) {
      // DAY 제거 (뒤에서부터)
      setDayPlans(dayPlans.slice(0, totalDays));
    }
  }, [startDate, endDate]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 왼쪽 사이드바 - 편집 리스트 (3/4 크기로 축소) */}
          {isLeftSidebarOpen && (
            <div className="w-80 bg-white border-r overflow-y-auto">
              <div className="p-4">
                {/* 플래너 편집 제목 & 삭제, 공유, 저장 버튼 */}
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="whitespace-nowrap text-sm">플래너 편집</h3>
                  <div className="flex gap-1 flex-1">
                    <Button variant="outline" size="sm" onClick={handleDelete} className="flex-1 text-xs px-2 py-1 h-7">
                      <Trash2 className="h-3 w-3 mr-1" />
                      삭제
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 text-xs px-2 py-1 h-7">
                      <Share2 className="h-3 w-3 mr-1" />
                      공유
                    </Button>
                    <Button size="sm" onClick={handleSave} className="flex-1 text-xs px-2 py-1 h-7">
                      <Save className="h-3 w-3 mr-1" />
                      저장
                    </Button>
                  </div>
                </div>

                {/* 제목 & 공개/비공개 */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="flex-1"
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-sm text-gray-600">
                      {startDate} ~ {endDate} ({getDaysDifference()}일)
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 날짜 선택 팝업 */}
                  {showDatePicker && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-600">시작일</label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">종료일</label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() => setShowDatePicker(false)}
                          size="sm"
                          className="w-full"
                        >
                          확인
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 지역 & 날씨 */}
                  {selectedCity && (
                    <div className="flex items-center justify-between bg-blue-50 p-2 rounded mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPinIcon className="h-4 w-4 text-blue-600" />
                        <span>{selectedRegion} {selectedCity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">15°C</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 지역 선택 */}
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold">지역</h4>
                  <div className="flex flex-wrap gap-2">
                    {regions.map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setSelectedRegion(region);
                          setSelectedCity('');
                        }}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          selectedRegion === region
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>

                  {/* 시/구 선택 (서울 선택 시) */}
                  {selectedRegion === '서울' && (
                    <div className="mt-3">
                      <h5 className="mb-2 text-xs text-gray-600">구</h5>
                      <div className="flex flex-wrap gap-2">
                        {['강남구', '송파구', '종로구', '용산구'].map((city) => (
                          <button
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                              selectedCity === city
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* DAY 리스트 */}
                <div>
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

          {/* 토글 버튼 (오른쪽) */}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="w-6 bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            {isRightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* 오른쪽 사이드바 - 검색 결과 (3/4 크기로 축소) */}
          {isRightSidebarOpen && (
            <div className="w-80 bg-white border-l overflow-y-auto">
              <div className="p-4">
                <h3 className="mb-4">플래너 검색</h3>
                <Input
                  type="search"
                  placeholder="장소를 검색하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />

                {/* 카테고리 선택 (우측으로 이동) */}
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
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
