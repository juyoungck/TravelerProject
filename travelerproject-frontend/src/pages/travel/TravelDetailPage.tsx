/**
 * TravelDetailPage.tsx - 여행지 상세 페이지
 * 여행지 정보, 리뷰 작성/목록, 찜 기능(API 연동), 고정 미니탭, 위로가기 버튼 포함
 * 
 * @author TravelerProject
 */

import { useState, useEffect } from 'react';
import { Heart, Eye, MapPin, X, Star, ArrowUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Header } from '../../components/layout/Header';
import { getDestinationDetail } from '../../api/destinationApi';
import { favoriteApi } from '../../api/favoriteApi';

interface Review {
  id: number;
  destinationId?: string;
  destinationName?: string;
  destinationImage?: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

interface Destination {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2: string;
  tel: string;
  homepage: string;
  overview: string;
  firstimage: string;
  firstimage2: string;
  mapx: string;
  mapy: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
}

interface TravelDetailPageProps {
  destinationId: string;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
  reviews?: Review[];
  onAddReview?: (review: Review) => void;
}

export function TravelDetailPage({ 
  destinationId, 
  onClose, 
  onNavigate, 
  isLoggedIn, 
  onOpenSearch, 
  reviews = [], 
  onAddReview 
}: TravelDetailPageProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'info' | 'reviews' | 'notice'>('photos');

  // ============================================
  // 찜 상태 관리 (API 연동)
  // ============================================
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  /** 여행지 상세 정보 조회 */
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getDestinationDetail(destinationId);
        setDestination(data);
      } catch (err) {
        console.error('여행지 상세 조회 실패:', err);
        setError('여행지 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (destinationId) {
      fetchDetail();
    }
  }, [destinationId]);

  /** 페이지 로드 시 찜 여부 확인 (API) */
  useEffect(() => {
    const checkFavorite = async () => {
      // 로그인 안 했거나, destination 없으면 스킵
      if (!isLoggedIn || !destination?.contentid) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await favoriteApi.checkFavoriteDestination(destination.contentid);
        if (response.status === 'success') {
          setIsFavorite(response.isFavorite);
        }
      } catch (error) {
        console.error('찜 여부 확인 오류:', error);
        setIsFavorite(false);
      }
    };

    checkFavorite();
  }, [isLoggedIn, destination?.contentid]);

  /** 로딩 중 */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  /** 에러 또는 데이터 없음 */
  if (error || !destination) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '여행지 정보를 찾을 수 없습니다.'}</p>
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    );
  }

  // ============================================
  // 찜 토글 핸들러 (API 연동)
  // ============================================
  const handleToggleFavorite = async () => {
    // 로그인 체크
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    // contentid 체크
    if (!destination?.contentid) {
      alert('여행지 정보가 없습니다.');
      return;
    }

    // 중복 클릭 방지
    if (isLoadingFavorite) return;

    setIsLoadingFavorite(true);
    try {
      const response = await favoriteApi.toggleFavoriteDestination(destination.contentid);
      if (response.status === 'success') {
        setIsFavorite(response.isFavorite);
        // 성공 메시지 (선택사항 - 너무 자주 뜨면 주석처리)
        // alert(response.message);
      } else {
        alert(response.message || '찜 처리에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('찜 처리 오류:', error);
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        alert('찜 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 평균 별점 계산 - destinationId로 필터링
  const destinationReviews = reviews.filter((review) => review.destinationId === destinationId);
  const averageRating = destinationReviews.length > 0
    ? destinationReviews.reduce((sum, review) => sum + review.rating, 0) / destinationReviews.length
    : 0;

  const scrollToSection = (tab: 'photos' | 'info' | 'reviews' | 'notice') => {
    const element = document.getElementById(`section-${tab}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmitReview = () => {
    if (newReviewRating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    if (!newReviewContent.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      destinationId: destination.contentid,
      destinationName: destination.title,
      destinationImage: destination.firstimage,
      author: '사용자',
      rating: newReviewRating,
      content: newReviewContent,
      date: new Date().toISOString().split('T')[0],
    };

    setNewReviewRating(0);
    setNewReviewContent('');
    setIsWritingReview(false);

    if (onAddReview) {
      onAddReview(newReview);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  /** 콘텐츠 타입 이름 변환 */
  const getContentTypeName = (typeId: string) => {
    const types: { [key: string]: string } = {
      '12': '관광지',
      '14': '문화시설',
      '15': '축제/공연/행사',
      '25': '여행코스',
      '28': '레포츠',
      '32': '숙박',
      '38': '쇼핑',
      '39': '음식점',
    };
    return types[typeId] || '기타';
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto" onScroll={handleScroll}>
      {/* 헤더 - 네비게이션 포함 */}
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          onOpenSearch={onOpenSearch || (() => {})}
          isLoggedIn={isLoggedIn || false}
        />
      )}

      {/* Sticky 미니탭 */}
      <div className="sticky top-16 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setActiveTab('photos');
                scrollToSection('photos');
              }}
              className={`px-4 py-3 transition-colors border-b-2 ${
                activeTab === 'photos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              사진보기
            </button>
            <button
              onClick={() => {
                setActiveTab('info');
                scrollToSection('info');
              }}
              className={`px-4 py-3 transition-colors border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              상세정보
            </button>
            <button
              onClick={() => {
                setActiveTab('reviews');
                scrollToSection('reviews');
              }}
              className={`px-4 py-3 transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              후기
            </button>
            <button
              onClick={() => {
                setActiveTab('notice');
                scrollToSection('notice');
              }}
              className={`px-4 py-3 transition-colors border-b-2 ${
                activeTab === 'notice'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              안내사항
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 제목 및 기본 정보 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{destination.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{destination.addr1} {destination.addr2}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-y">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded">
                {getContentTypeName(destination.contenttypeid)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* 찜하기 버튼 (API 연동) */}
              <button 
                onClick={handleToggleFavorite}
                disabled={isLoadingFavorite}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  isLoadingFavorite 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : isFavorite 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isLoadingFavorite ? '처리중...' : '찜하기'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 사진보기 */}
        <section id="section-photos" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">사진보기</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destination.firstimage ? (
              <img
                src={destination.firstimage}
                alt={destination.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">이미지 없음</span>
              </div>
            )}
            {destination.firstimage2 && destination.firstimage2 !== destination.firstimage && (
              <img
                src={destination.firstimage2}
                alt={`${destination.title} 썸네일`}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </section>

        {/* 상세정보 */}
        <section id="section-info" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">상세정보</h3>
          {destination.overview ? (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {destination.overview}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-500">상세 설명이 없습니다.</p>
            </div>
          )}

          {/* 지도 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">위치</h4>
            {destination.mapx && destination.mapy ? (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>위도: {destination.mapy}</p>
                  <p>경도: {destination.mapx}</p>
                  <p className="text-sm mt-2">(카카오맵 연동 예정)</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">위치 정보가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 주소 */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex gap-2">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold mb-1">주소</h5>
                <p className="text-gray-600">{destination.addr1} {destination.addr2}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 후기 */}
        <section id="section-reviews" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">후기</h3>
              {destinationReviews.length > 0 && (
                <div className="flex items-center gap-2">
                  {renderStars(averageRating, 'md')}
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)}/5 ({destinationReviews.length}개)
                  </span>
                </div>
              )}
            </div>
            <Button 
              onClick={() => {
                if (!isLoggedIn) {
                  alert('로그인이 필요한 서비스입니다.');
                  return;
                }
                setIsWritingReview(!isWritingReview);
              }}
            >
              후기 작성
            </Button>
          </div>

          {/* 후기 작성 폼 */}
          {isWritingReview && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold mb-3">후기 작성</h4>
              
              {/* 별점 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">별점</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl transition-all"
                    >
                      {star <= (hoverRating || newReviewRating) ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {newReviewRating > 0 ? `${newReviewRating}/5` : '별점을 선택하세요'}
                  </span>
                </div>
              </div>

              {/* 후기 내용 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">후기 내용</label>
                <textarea
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  placeholder="방문 후기를 작성해주세요..."
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-vertical"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitReview}>등록</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsWritingReview(false);
                    setNewReviewRating(0);
                    setNewReviewContent('');
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          )}

          {/* 후기 목록 */}
          <div className="space-y-4">
            {destinationReviews.length > 0 ? (
              destinationReviews.map((review) => (
                <div key={review.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold">{review.author}</span>
                      <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                    </div>
                    {renderStars(review.rating, 'sm')}
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>아직 후기가 없습니다.</p>
                <p className="text-sm">첫 번째 후기를 작성해보세요!</p>
              </div>
            )}
          </div>
        </section>

        {/* 안내사항 */}
        <section id="section-notice" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">안내사항</h3>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            {destination.homepage && (
              <div>
                <h5 className="font-semibold mb-2">홈페이지</h5>
                <div 
                  className="text-blue-600 hover:underline"
                  dangerouslySetInnerHTML={{ __html: destination.homepage }}
                />
              </div>
            )}
            {destination.tel && (
              <div>
                <h5 className="font-semibold mb-2">문의전화</h5>
                <p className="text-gray-700">{destination.tel}</p>
              </div>
            )}
            {!destination.homepage && !destination.tel && (
              <p className="text-gray-500">안내 정보가 없습니다.</p>
            )}
          </div>
        </section>
      </div>

      {/* 닫기 버튼 (우측 하단) */}
      <button
        onClick={onClose}
        className="fixed bottom-8 right-8 bg-white shadow-lg rounded-full p-4 hover:bg-gray-100 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* 맨 위로 스크롤 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-8 bg-white shadow-lg rounded-full p-4 hover:bg-gray-100 transition-colors"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

export default TravelDetailPage;
