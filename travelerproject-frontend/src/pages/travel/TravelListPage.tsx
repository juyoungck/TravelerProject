/**
 * TravelListPage.tsx - 여행지 목록 페이지
 * 지역/테마별 필터링 및 여행지 카드 리스트 표시
 * 찜 개수, 별점, 사용자 찜 여부 API 연동
 */

import { useState, useEffect } from 'react';
import { 
  getDestinationList, 
  getFavoriteCount, 
  checkFavorite, 
  getReviewsByDestination,
  toggleFavorite 
} from '../../api/destinationApi';
import { MapPin, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Destination {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2: string;
  firstimage: string;
  firstimage2: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  viewCount: number;
  overview: string;
  regionName?: string;
}

/** 여행지별 추가 정보 (찜, 별점) */
interface DestinationStats {
  favoriteCount: number;
  isFavorite: boolean;
  averageRating: number;
  reviewCount: number;
}

interface TravelListPageProps {
  onSelectDestination?: (id: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
}

/** 콘텐츠 타입 코드 → 이름 변환 */
const contentTypeMap: { [key: string]: string } = {
  '12': '관광',
  '14': '문화',
  '15': '축제',
  '25': '여행코스',
  '28': '레저',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식',
};

/** 카테고리 필터 */
const categories = [
  { id: 'all', name: '전체' },
  { id: '12', name: '관광' },
  { id: '14', name: '문화' },
  { id: '28', name: '레저' },
  { id: '32', name: '숙박' },
  { id: '38', name: '쇼핑' },
  { id: '39', name: '음식' },
];

const TravelListPage = ({
  onSelectDestination,
  isLoggedIn = false,
  currentUserId
}: TravelListPageProps) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const pageSize = 10;

  // 여행지별 통계 정보 (찜 개수, 별점 등)
  const [statsMap, setStatsMap] = useState<{ [contentid: string]: DestinationStats }>({});

  /** 여행지 목록 조회 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const contenttypeid = selectedCategory === 'all' ? '12' : selectedCategory;
        const result = await getDestinationList(contenttypeid, currentPage, pageSize);
        
        if (result.data) {
          setDestinations(result.data);
          setTotalPages(result.totalPages || 1);
          
          // 각 여행지별 통계 정보 조회
          fetchDestinationStats(result.data);
        } else {
          setDestinations([]);
        }
      } catch (error) {
        console.error('여행지 조회 실패:', error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory]);

  /** 여행지별 통계 정보 조회 (찜 개수, 별점, 사용자 찜 여부) */
  const fetchDestinationStats = async (destList: Destination[]) => {
    const newStatsMap: { [contentid: string]: DestinationStats } = {};

    // 병렬로 API 호출
    await Promise.all(
      destList.map(async (dest) => {
        try {
          // 찜 개수 조회
          const favoriteRes = await getFavoriteCount(dest.contentid);
          const favoriteCount = favoriteRes.status === 'success' ? favoriteRes.favoriteCount : 0;

          // 리뷰/별점 조회
          const reviewRes = await getReviewsByDestination(dest.contentid);
          const averageRating = reviewRes.status === 'success' ? reviewRes.averageRating : 0;
          const reviewCount = reviewRes.status === 'success' ? reviewRes.totalCount : 0;

          // 로그인한 경우 사용자 찜 여부 확인
          let isFavorite = false;
          if (isLoggedIn && currentUserId) {
            const checkRes = await checkFavorite(currentUserId, dest.contentid);
            isFavorite = checkRes.status === 'success' ? checkRes.isFavorite : false;
          }

          newStatsMap[dest.contentid] = {
            favoriteCount,
            isFavorite,
            averageRating,
            reviewCount
          };
        } catch (error) {
          console.error(`통계 조회 실패 (${dest.contentid}):`, error);
          newStatsMap[dest.contentid] = {
            favoriteCount: 0,
            isFavorite: false,
            averageRating: 0,
            reviewCount: 0
          };
        }
      })
    );

    setStatsMap(newStatsMap);
  };

  /** 찜 토글 */
  const handleToggleFavorite = async (e: React.MouseEvent, destination: Destination) => {
    e.stopPropagation();
    
    if (!isLoggedIn || !currentUserId) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      const response = await toggleFavorite(currentUserId, destination.contentid);
      
      if (response.status === 'success') {
        // 해당 여행지의 통계 정보 업데이트
        setStatsMap(prev => ({
          ...prev,
          [destination.contentid]: {
            ...prev[destination.contentid],
            isFavorite: response.isFavorite,
            favoriteCount: response.favoriteCount
          }
        }));
      }
    } catch (error) {
      console.error('찜 토글 실패:', error);
      alert('찜 처리 중 오류가 발생했습니다.');
    }
  };

  /** 통계 정보 가져오기 */
  const getStats = (contentid: string): DestinationStats => {
    return statsMap[contentid] || {
      favoriteCount: 0,
      isFavorite: false,
      averageRating: 0,
      reviewCount: 0
    };
  };

  /** 지역명 가져오기 */
  const getRegionName = (destination: Destination) => {
    return destination.regionName || '';
  };

  /** 썸네일 URL */
  const getThumbnailUrl = (destination: Destination) => {
    return `http://localhost:8080/thumbnails/${destination.contentid}.jpg`;
  };

  /** 페이지 변경 */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /** 카테고리 변경 */
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  /** 페이지네이션 번호 생성 */
  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">여행지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 카테고리 필터 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">#전체</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              #{category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 개수 및 정렬 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">총 <span className="font-semibold text-blue-600">{destinations.length}개</span></p>
        <div className="flex gap-2 text-sm">
          <button className="text-blue-600 font-medium">최신순</button>
          <span className="text-gray-300">|</span>
          <button className="text-gray-500 hover:text-blue-600">인기순</button>
        </div>
      </div>

      {/* 여행지 리스트 */}
      <div className="space-y-4">
        {destinations.map((destination) => {
          const stats = getStats(destination.contentid);
          
          return (
            <div
              key={destination.contentid}
              onClick={() => onSelectDestination?.(destination.contentid)}
              className="flex gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* 썸네일 이미지 */}
              <div className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={getThumbnailUrl(destination)}
                  alt={destination.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (destination.firstimage2) {
                      target.src = destination.firstimage2;
                    } else if (destination.firstimage) {
                      target.src = destination.firstimage;
                    } else {
                      target.src = '/placeholder-image.jpg';
                    }
                  }}
                />
              </div>

              {/* 여행지 정보 */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* 제목 및 카테고리 */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{destination.title}</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                      {contentTypeMap[destination.contenttypeid] || '기타'}
                    </span>
                  </div>
                  
                  {/* 지역 */}
                  <p className="text-gray-600 text-sm">
                    {getRegionName(destination)}
                  </p>
                </div>

                {/* 하단 정보 - API 연동 */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>조회 {destination.viewCount?.toLocaleString() || 0}</span>
                  <span>좋아요 {stats.favoriteCount}</span>
                  {stats.reviewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {stats.averageRating.toFixed(1)} ({stats.reviewCount})
                    </span>
                  )}
                </div>
              </div>

              {/* 우측 버튼 */}
              <div className="flex flex-col items-end justify-between">
                {/* 별점 표시 */}
                <div className="flex items-center gap-1 text-gray-400">
                  <Star className={`w-4 h-4 ${stats.reviewCount > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  <span className="text-sm">
                    {stats.reviewCount > 0 ? stats.averageRating.toFixed(1) : '-'}
                  </span>
                </div>

                {/* 찜 버튼 */}
                <button
                  onClick={(e) => handleToggleFavorite(e, destination)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      stats.isFavorite
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 데이터 없음 */}
      {destinations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">여행지 정보가 없습니다.</p>
        </div>
      )}

      {/* 페이지네이션 */}
      {destinations.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelListPage;