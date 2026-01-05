/**
 * PlannerMainPage.tsx - 플래너 메인 홈 페이지
 * 나만의 플래너 목록 + 전체 플래너 (찜 많은 순 정렬)
 * 
 * 수정: 더미데이터 삭제, 전체 플래너 API 연동
 * 수정: 찜 기능 추가 (하트 클릭)
 * 수정: 공개/비공개 뱃지 추가
 */

import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, User, ChevronRight, ChevronLeft, Loader2, Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
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
  isOwn?: boolean;
  isPublic?: number;
  isFavorite?: boolean;
  startDate?: string;
  endDate?: string;
}

interface PlannerMainPageProps {
  onCreatePlanner: () => void;
  onViewMore: () => void;
  onSelectPlanner: (planner: Planner) => void;
}

export function PlannerMainPage({ onCreatePlanner, onViewMore, onSelectPlanner }: PlannerMainPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [myPlanners, setMyPlanners] = useState<Planner[]>([]);
  const [allPlanners, setAllPlanners] = useState<Planner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  
  const pageSize = 8;

  /** 현재 로그인한 사용자 ID 가져오기 */
  const getCurrentUserId = (): number | null => {
    const memberInfo = localStorage.getItem('memberInfo');
    if (memberInfo) {
      try {
        const member = JSON.parse(memberInfo);
        return member.mId || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  /** 나의 플래너 목록 불러오기 */
  const fetchMyPlanners = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/planner/my`, {
        params: { mId: userId, page: 1, size: 20 }
      });
      
      if (response.data.status === 'success' && response.data.planners) {
        const planners = response.data.planners.map((p: any) => ({
          id: p.plnId,
          title: p.plnTitle,
          author: p.authorNickname || '나',
          region: p.regionName || '전국',
          days: p.totalDays || calculateDays(p.startDate, p.endDate),
          image: p.thumbnailImage || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
          likes: p.favoriteCount || 0,
          isOwn: true,
          isPublic: p.isPublic,
          startDate: p.startDate,
          endDate: p.endDate,
        }));
        setMyPlanners(planners);
      }
    } catch (error) {
      console.error('나의 플래너 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /** 전체 플래너 목록 불러오기 (찜 많은 순) */
  const fetchAllPlanners = async (page: number = 1) => {
    const userId = getCurrentUserId();
    
    try {
      setIsLoadingAll(true);
      const response = await axios.get(`${API_BASE_URL}/planner/popular`, {
        params: { page, size: pageSize }
      });
      
      if (response.data.status === 'success' && response.data.planners) {
        // 각 플래너의 찜 여부 확인 (로그인 시)
        const plannersWithFavorite = await Promise.all(
          response.data.planners.map(async (p: any) => {
            let isFavorite = false;
            if (userId) {
              try {
                const favResponse = await axios.get(`${API_BASE_URL}/planner/${p.plnId}/favorite`, {
                  params: { mId: userId }
                });
                isFavorite = favResponse.data.isFavorite || false;
              } catch (e) {
                // 찜 확인 실패 시 false
              }
            }
            
            return {
              id: p.plnId,
              title: p.plnTitle,
              author: p.authorNickname || '익명',
              region: p.regionName || '전국',
              days: p.totalDays || calculateDays(p.startDate, p.endDate),
              image: p.thumbnailImage || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
              likes: p.favoriteCount || 0,
              isPublic: p.isPublic,
              isFavorite,
              startDate: p.startDate,
              endDate: p.endDate,
            };
          })
        );
        
        setAllPlanners(plannersWithFavorite);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || page);
      }
    } catch (error) {
      console.error('전체 플래너 목록 로드 실패:', error);
    } finally {
      setIsLoadingAll(false);
    }
  };

  /** 날짜 차이 계산 */
  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  /** 찜 토글 */
  const handleToggleFavorite = async (e: React.MouseEvent, planner: Planner) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    const userId = getCurrentUserId();
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/planner/${planner.id}/favorite`, null, {
        params: { mId: userId }
      });
      
      console.log('찜 토글 응답:', response.data);
      
      if (response.data.status === 'success') {
        const newFavoriteCount = response.data.favoriteCount;
        const newIsFavorite = response.data.isFavorite;
        
        // 전체 플래너 목록 업데이트
        setAllPlanners(prev => prev.map(p => 
          p.id === planner.id 
            ? { ...p, isFavorite: newIsFavorite, likes: newFavoriteCount }
            : p
        ));
        
        // 내 플래너 목록도 업데이트
        setMyPlanners(prev => prev.map(p => 
          p.id === planner.id 
            ? { ...p, likes: newFavoriteCount }
            : p
        ));
      }
    } catch (error) {
      console.error('찜 토글 실패:', error);
      alert('찜 기능 처리 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMyPlanners();
    fetchAllPlanners(1);
  }, []);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchAllPlanners(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchAllPlanners(currentPage + 1);
    }
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
        <h2 className="mb-6 text-xl font-bold">나의 작성한 플래너</h2>
        
        {isLoading ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-500 mt-2">플래너를 불러오는 중...</p>
          </div>
        ) : !getCurrentUserId() ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">로그인이 필요합니다</p>
            <p className="text-gray-400 text-sm mt-2">로그인 후 나만의 플래너를 만들어보세요!</p>
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
                  />
                  {/* 본인 플래너 표시 */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    내 플래너
                  </div>
                  {/* 찜 개수 */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold text-red-500">❤️ {planner.likes}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-3 line-clamp-2 font-semibold group-hover:text-blue-600 transition-colors">
                    {planner.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{planner.region}</span>
                      </div>
                      {/* 공개/비공개 뱃지 */}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        planner.isPublic === 1 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {planner.isPublic === 1 ? '공개' : '비공개'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{planner.days}일</span>
                      {planner.startDate && (
                        <span className="text-gray-400 text-xs">
                          ({planner.startDate} ~ {planner.endDate})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 전체 플래너 (찜 많은 순) */}
      <section>
        <h2 className="mb-6 text-xl font-bold">전체 플래너</h2>
        
        {isLoadingAll ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-500 mt-2">플래너를 불러오는 중...</p>
          </div>
        ) : allPlanners.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">공개된 플래너가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {allPlanners.map((planner) => (
              <div
                key={planner.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
              >
                <button
                  onClick={() => onSelectPlanner(planner)}
                  className="w-full text-left"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={planner.image}
                      alt={planner.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="mb-2 text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
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
                {/* 찜 버튼 */}
                <div className="px-3 pb-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">❤️ {planner.likes}</span>
                  <button
                    onClick={(e) => handleToggleFavorite(e, planner)}
                    className={`p-1.5 rounded-full transition-colors ${
                      planner.isFavorite 
                        ? 'bg-red-100 text-red-500' 
                        : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                    }`}
                    title={planner.isFavorite ? '찜 취소' : '찜하기'}
                  >
                    <Heart className={`h-4 w-4 ${planner.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {allPlanners.length > 0 && (
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`flex items-center gap-1 ${
                currentPage <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>이전</span>
            </button>
            <span className="mx-4 text-gray-500">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className={`flex items-center gap-1 ${
                currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
              }`}
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
