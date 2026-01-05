/**
 * PopularPlanners.tsx - 인기 플래너 섹션
 * 메인 페이지에 인기 플래너 목록 표시
 * 
 * 수정: API 연동 - 전체 플래너에서 찜 많은 순 4개 가져오기
 */

import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface Planner {
  id: number;
  title: string;
  author: string;
  region: string;
  days: number;
  image: string;
  likes: number;
}

interface PopularPlannersProps {
  onSelectPlanner: (planner: Planner) => void;
}

export function PopularPlanners({ onSelectPlanner }: PopularPlannersProps) {
  const [popularPlanners, setPopularPlanners] = useState<Planner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /** 날짜 차이 계산 */
  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  /** 인기 플래너 4개 가져오기 (찜 많은 순) */
  const fetchPopularPlanners = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/planner/popular`, {
        params: { page: 1, size: 4 }
      });

      if (response.data.status === 'success' && response.data.planners) {
        const planners = response.data.planners.map((p: any) => ({
          id: p.plnId,
          title: p.plnTitle,
          author: p.authorNickname || '익명',
          region: p.regionName || '전국',
          days: p.totalDays || calculateDays(p.startDate, p.endDate),
          image: p.thumbnailImage || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
          likes: p.favoriteCount || 0,
        }));
        setPopularPlanners(planners);
      }
    } catch (error) {
      console.error('인기 플래너 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularPlanners();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center">인기 플래너</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">플래너를 불러오는 중...</span>
          </div>
        ) : popularPlanners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">아직 등록된 플래너가 없습니다</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPlanners.map((planner) => (
              <button
                key={planner.id}
                onClick={() => onSelectPlanner(planner)}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
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
                <div className="p-4 text-left">
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
        )}
      </div>
    </section>
  );
}
