/**
 * PlannerMainPage.tsx - 플래너 메인 홈 페이지
 * 인기 플래너 캐러셀 및 나만의 플래너 목록 표시
 */

import { useState } from 'react';
import { Plus, Calendar, MapPin, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Planner {
  id: number;
  title: string;
  author: string;
  region: string;
  days: number;
  image: string;
  likes: number;
  isOwn?: boolean;
}

const mockMyPlanners: Planner[] = [];

const mockPopularPlanners: Planner[] = [
  {
    id: 1,
    title: '서울 2박 3일 완벽 가이드',
    author: '여행러버',
    region: '서울',
    days: 3,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    likes: 245,
  },
  {
    id: 2,
    title: '부산 해변 투어',
    author: '바다사랑',
    region: '부산',
    days: 2,
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400',
    likes: 189,
  },
  {
    id: 3,
    title: '제주도 일주 코스',
    author: '제주파',
    region: '제주',
    days: 4,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    likes: 312,
  },
  {
    id: 4,
    title: '경주 역사 탐방',
    author: '역사덕후',
    region: '경주',
    days: 2,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    likes: 156,
  },
  {
    id: 5,
    title: '강릉 바다 여행',
    author: '동해바다',
    region: '강릉',
    days: 2,
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400',
    likes: 201,
  },
  {
    id: 6,
    title: '전주 한옥마을 투어',
    author: '전통미',
    region: '전주',
    days: 2,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    likes: 178,
  },
  {
    id: 7,
    title: '여수 낭만 포차 투어',
    author: '야경러버',
    region: '여수',
    days: 3,
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400',
    likes: 234,
  },
  {
    id: 8,
    title: '속초 설악산 힐링',
    author: '등산마니아',
    region: '속초',
    days: 2,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    likes: 167,
  },
];

interface PlannerMainPageProps {
  onCreatePlanner: () => void;
  onViewMore: () => void;
  onSelectPlanner: (planner: Planner) => void;
}

export function PlannerMainPage({ onCreatePlanner, onViewMore, onSelectPlanner }: PlannerMainPageProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(mockPopularPlanners.length / itemsPerPage);
  
  const displayedPlanners = mockPopularPlanners.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
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
        {mockMyPlanners.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">아직 작성한 플래너가 없습니다</p>
            <Button onClick={onCreatePlanner} className="mt-4">
              첫 플래너 만들기
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMyPlanners.map((planner) => (
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
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedPlanners.map((planner) => (
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

        {/* 페이지네이션 */}
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
      </section>
    </div>
  );
}
