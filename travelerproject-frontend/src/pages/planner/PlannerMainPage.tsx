/**
 * PlannerMainPage.tsx - 플래너 메인 홈 페이지
 * 인기 플래너 및 나만의 플래너 목록 표시
 * 백엔드 API 연동 완료
 */

import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getMyPlannerList, getPopularPlannerList, PlannerListItem } from '../../api/plannerApi';

interface Planner {
  id: number;
  title: string;
  author: string;
  region: string;
  days: number;
  image: string;
  likes: number;
  isOwn?: boolean;
  startDate?: string;
  endDate?: string;
}

interface PlannerMainPageProps {
  onCreatePlanner: () => void;
  onViewMore: () => void;
  onSelectPlanner: (planner: Planner) => void;
}

// TODO: JWT 구현 후 실제 로그인 사용자 ID로 교체
const CURRENT_USER_ID = 1;

// 기본 이미지 (썸네일이 없을 때 사용)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400';

/**
 * API 응답을 프론트엔드 Planner 형식으로 변환
 */
const convertToPlanner = (item: PlannerListItem, isOwn: boolean = false): Planner => ({
  id: item.plnId,
  title: item.plnTitle,
  author: item.authorNickname || '익명',
  region: item.regionName || '미정',
  days: item.totalDays,
  image: item.thumbnailImage || DEFAULT_IMAGE,
  likes: item.favoriteCount || 0,
  isOwn,
  startDate: item.startDate,
  endDate: item.endDate,
});

export function PlannerMainPage({ onCreatePlanner, onViewMore, onSelectPlanner }: PlannerMainPageProps) {
  // 내 플래너 상태
  const [myPlanners, setMyPlanners] = useState<Planner[]>([]);
  const [myPlannersLoading, setMyPlannersLoading] = useState(true);

  // 인기 플래너 상태
  const [popularPlanners, setPopularPlanners] = useState<Planner[]>([]);
  const [popularPlannersLoading, setPopularPlannersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 8;

  /**
   * 내 플래너 목록 조회
   */
  const fetchMyPlanners = async () => {
    setMyPlannersLoading(true);
    try {
      const response = await getMyPlannerList(CURRENT_USER_ID, 1, 10);
      const planners = response.planners.map((item) => convertToPlanner(item, true));
      setMyPlanners(planners);
    } catch (error) {
      console.error('내 플래너 목록 조회 실패:', error);
      setMyPlanners([]);
    } finally {
      setMyPlannersLoading(false);
    }
  };

  /**
   * 인기 플래너 목록 조회
   */
  const fetchPopularPlanners = async (page: number = 1) => {
    setPopularPlannersLoading(true);
    try {
      const response = await getPopularPlannerList(page, itemsPerPage);
      const planners = response.planners.map((item) => convertToPlanner(item));
      setPopularPlanners(planners);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('인기 플래너 목록 조회 실패:', error);
      setPopularPlanners([]);
    } finally {
      setPopularPlannersLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchMyPlanners();
    fetchPopularPlanners(1);
  }, []);

  const handlePrevPage = () => {
    const newPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
    setCurrentPage(newPage);
    fetchPopularPlanners(newPage + 1);
  };

  const handleNextPage = () => {
    const newPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
    setCurrentPage(newPage);
    fetchPopularPlanners(newPage + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 플래너 계획하기 버튼 */}
      <div className="mb-12">
        <Button
          onClick={onCreatePlanner}
          className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg"
        >
          <Plus className="h-6 w-6 mr-2" />
          플래너 계획하기
        </Button>
      </div>

      {/* 나의 작성한 플래너 */}
      <section className="mb-16">
        <h2 className="mb-6">나의 작성한 플래너</h2>
        
        {myPlannersLoading ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">로딩 중...</p>
          </div>
        ) : myPlanners.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">아직 작성한 플래너가 없습니다</p>
            <Button onClick={onCreatePlanner} className="mt-4">
              첫 플래너 만들기
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPlanners.map((planner) => (
              <button
                key={planner.id}
                onClick={() => onSelectPlanner(planner)}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group text-left"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={planner.image}
                    alt={planner.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {planner.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{planner.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{planner.days}일</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 인기 플래너 */}
      <section>
        <h2 className="mb-6">인기 플래너</h2>
        
        {popularPlannersLoading ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">로딩 중...</p>
          </div>
        ) : popularPlanners.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">아직 공개된 플래너가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {popularPlanners.map((planner) => (
              <button
                key={planner.id}
                onClick={() => onSelectPlanner(planner)}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group text-left"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={planner.image}
                    alt={planner.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-red-500">❤️ {planner.likes}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="mb-2 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {planner.title}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{planner.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{planner.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{planner.days}일</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!popularPlannersLoading && popularPlanners.length > 0 && (
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={handlePrevPage}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>이전</span>
            </button>
            <span className="mx-4 text-gray-500">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <span>다음</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
