/**
 * PlannerListPage.tsx - 플래너 전체 목록 페이지
 * 모든 플래너를 그리드 형태로 표시
 */

import { Calendar, MapPin, User } from 'lucide-react';

interface Planner {
  id: number;
  title: string;
  author: string;
  region: string;
  days: number;
  image: string;
  likes: number;
}

const allPlanners: Planner[] = [
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
    title: '강원도 겨울 여행',
    author: '스노우맨',
    region: '강원',
    days: 3,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    likes: 201,
  },
  {
    id: 6,
    title: '전주 한옥마을 투어',
    author: '맛집헌터',
    region: '전주',
    days: 1,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    likes: 178,
  },
];

interface PlannerListPageProps {
  onSelectPlanner: (planner: Planner) => void;
}

export function PlannerListPage({ onSelectPlanner }: PlannerListPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">인기 플래너 전체보기</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlanners.map((planner) => (
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
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-red-500">❤️ {planner.likes}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {planner.title}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{planner.author}</span>
                </div>
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
    </div>
  );
}
