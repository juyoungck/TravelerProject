/**
 * TravelDetailPage.tsx - 여행지 상세 페이지
 * 여행지 정보, 리뷰 작성/목록, 찜 기능, 조회수 증가, 고정 미니탭, 위로가기 버튼 포함
 * 수정: 지도 로딩, 1인1리뷰, 내 리뷰 최상단, 수정/삭제 기능
 * 수정: 페이지 진입 시 스크롤 맨 위로 이동
 */

import { useState, useEffect } from 'react';
import { Heart, Eye, MapPin, X, Star, ArrowUp, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Header } from '../../components/layout/Header';
import KakaoMap from '../../components/map/KakaoMap';
import { 
  getDestinationDetail, 
  increaseViewCount,
  getReviewsByDestination,
  createReview,
  updateReview,
  deleteReview,
  toggleFavorite,
  checkFavorite,
  getFavoriteCount,
  getDestinationImages
} from '../../api/destinationApi';

declare global {
  interface Window {
    kakao: any;
  }
}

/** 리뷰 타입 정의 */
interface Review {
  rvId: number;
  mId: number;
  contentid: string;
  rvContent: string;
  rvRating: number;
  createdAt: string;
  memberNickname: string;
}

/** 여행지 타입 정의 */
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
  mapx: number;
  mapy: number;
  viewCount: number;
  lDongRegnCd: string;
  lDongSignguCd: string;
}

/** Props 타입 정의 */
interface TravelDetailPageProps {
  destinationId: string;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onOpenSearch?: () => void;
}

export function TravelDetailPage({ 
  destinationId, 
  onClose, 
  onNavigate, 
  isLoggedIn = false,
  currentUserId,
  onOpenSearch
}: TravelDetailPageProps) {
  // 여행지 정보 상태
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 이미지 목록 상태
  const [images, setImages] = useState<string[]>([]);

  // 리뷰 관련 상태
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // 수정 모드 상태
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editContent, setEditContent] = useState('');
  const [editHoverRating, setEditHoverRating] = useState(0);

  // 찜 관련 상태
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // UI 관련 상태
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'info' | 'reviews' | 'notice'>('photos');

  /** 페이지 진입 시 스크롤 맨 위로 이동 */
  useEffect(() => {
    // 스크롤 컨테이너를 찾아서 맨 위로
    const container = document.querySelector('.detail-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    }
    // window 스크롤도 맨 위로
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // 탭도 초기화
    setActiveTab('photos');
  }, [destinationId]);

  /** 여행지 상세 정보 조회 */
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getDestinationDetail(destinationId);
        
        // 조회수 증가
        await increaseViewCount(destinationId);
        
        // 조회수 +1 반영
        setDestination({
          ...data,
          viewCount: (data.viewCount || 0) + 1
        });
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

  /** 리뷰 목록 조회 */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getReviewsByDestination(destinationId);
        if (response.status === 'success') {
          let reviewList = response.data || [];
          
          // 내 리뷰를 최상단으로 정렬
          if (currentUserId) {
            reviewList = reviewList.sort((a: Review, b: Review) => {
              if (a.mId === currentUserId && b.mId !== currentUserId) return -1;
              if (a.mId !== currentUserId && b.mId === currentUserId) return 1;
              return 0;
            });
          }
          
          setReviews(reviewList);
          setAverageRating(response.averageRating || 0);
          setReviewCount(response.totalCount || 0);
        }
      } catch (err) {
        console.error('리뷰 조회 실패:', err);
      }
    };

    if (destinationId) {
      fetchReviews();
    }
  }, [destinationId, currentUserId]);

    /** 이미지 목록 조회 */
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await getDestinationImages(destinationId);
        if (response.status === 'success' && response.data) {
          // originimgurl만 추출
          const imageUrls = response.data.map((img: any) => img.originimgurl);
          setImages(imageUrls);
        }
      } catch (err) {
        console.error('이미지 조회 실패:', err);
      }
    };

    if (destinationId) {
      fetchImages();
    }
  }, [destinationId]);

  /** 찜 상태 및 개수 조회 */
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const countResponse = await getFavoriteCount(destinationId);
        if (countResponse.status === 'success') {
          setFavoriteCount(countResponse.favoriteCount || 0);
        }

        if (isLoggedIn && currentUserId) {
          const checkResponse = await checkFavorite(currentUserId, destinationId);
          if (checkResponse.status === 'success') {
            setIsFavorite(checkResponse.isFavorite);
          }
        }
      } catch (err) {
        console.error('찜 상태 조회 실패:', err);
      }
    };

    if (destinationId) {
      fetchFavoriteStatus();
    }
  }, [destinationId, isLoggedIn, currentUserId]);

  // 내가 이미 리뷰를 작성했는지 확인
  const myReview = reviews.find(review => review.mId === currentUserId);
  const hasMyReview = !!myReview;

  /** 로딩 중 화면 */
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

  /** 에러 또는 데이터 없음 화면 */
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

  /** 찜 토글 핸들러 */
  const handleToggleFavorite = async () => {
    if (!isLoggedIn || !currentUserId) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      setFavoriteLoading(true);
      const response = await toggleFavorite(currentUserId, destination.contentid);
      
      if (response.status === 'success') {
        setIsFavorite(response.isFavorite);
        setFavoriteCount(response.favoriteCount);
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
      alert('찜 처리 중 오류가 발생했습니다.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  /** 리뷰 등록 핸들러 */
  const handleSubmitReview = async () => {
    if (!isLoggedIn || !currentUserId) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    // 이미 리뷰 작성했는지 확인
    if (hasMyReview) {
      alert('이미 이 여행지에 후기를 작성하셨습니다.');
      return;
    }

    if (newReviewRating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    if (!newReviewContent.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    try {
      setReviewLoading(true);
      const response = await createReview({
        mId: currentUserId,
        contentid: destination.contentid,
        rvRating: newReviewRating,
        rvContent: newReviewContent
      });

      if (response.status === 'success') {
        // 리뷰 목록 새로고침
        const reviewsResponse = await getReviewsByDestination(destinationId);
        if (reviewsResponse.status === 'success') {
          let reviewList = reviewsResponse.data || [];
          // 내 리뷰 최상단 정렬
          if (currentUserId) {
            reviewList = reviewList.sort((a: Review, b: Review) => {
              if (a.mId === currentUserId && b.mId !== currentUserId) return -1;
              if (a.mId !== currentUserId && b.mId === currentUserId) return 1;
              return 0;
            });
          }
          setReviews(reviewList);
          setAverageRating(reviewsResponse.averageRating || 0);
          setReviewCount(reviewsResponse.totalCount || 0);
        }

        setNewReviewRating(0);
        setNewReviewContent('');
        setIsWritingReview(false);
        alert('후기가 등록되었습니다.');
      }
    } catch (err) {
      console.error('리뷰 등록 실패:', err);
      alert('후기 등록 중 오류가 발생했습니다.');
    } finally {
      setReviewLoading(false);
    }
  };

  /** 리뷰 수정 시작 */
  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review.rvId);
    setEditRating(review.rvRating);
    setEditContent(review.rvContent);
  };

  /** 리뷰 수정 취소 */
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditContent('');
    setEditHoverRating(0);
  };

  /** 리뷰 수정 저장 */
  const handleSaveEdit = async (reviewId: number) => {
    if (editRating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    if (!editContent.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    try {
      setReviewLoading(true);
      const response = await updateReview(reviewId, {
        rvRating: editRating,
        rvContent: editContent
      });

      if (response.status === 'success') {
        // 리뷰 목록 새로고침
        const reviewsResponse = await getReviewsByDestination(destinationId);
        if (reviewsResponse.status === 'success') {
          let reviewList = reviewsResponse.data || [];
          if (currentUserId) {
            reviewList = reviewList.sort((a: Review, b: Review) => {
              if (a.mId === currentUserId && b.mId !== currentUserId) return -1;
              if (a.mId !== currentUserId && b.mId === currentUserId) return 1;
              return 0;
            });
          }
          setReviews(reviewList);
          setAverageRating(reviewsResponse.averageRating || 0);
          setReviewCount(reviewsResponse.totalCount || 0);
        }

        handleCancelEdit();
        alert('후기가 수정되었습니다.');
      }
    } catch (err) {
      console.error('리뷰 수정 실패:', err);
      alert('후기 수정 중 오류가 발생했습니다.');
    } finally {
      setReviewLoading(false);
    }
  };

  /** 리뷰 삭제 */
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('정말 이 후기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setReviewLoading(true);
      const response = await deleteReview(reviewId);

      if (response.status === 'success') {
        // 리뷰 목록 새로고침
        const reviewsResponse = await getReviewsByDestination(destinationId);
        if (reviewsResponse.status === 'success') {
          let reviewList = reviewsResponse.data || [];
          if (currentUserId) {
            reviewList = reviewList.sort((a: Review, b: Review) => {
              if (a.mId === currentUserId && b.mId !== currentUserId) return -1;
              if (a.mId !== currentUserId && b.mId === currentUserId) return 1;
              return 0;
            });
          }
          setReviews(reviewList);
          setAverageRating(reviewsResponse.averageRating || 0);
          setReviewCount(reviewsResponse.totalCount || 0);
        }

        alert('후기가 삭제되었습니다.');
      }
    } catch (err) {
      console.error('리뷰 삭제 실패:', err);
      alert('후기 삭제 중 오류가 발생했습니다.');
    } finally {
      setReviewLoading(false);
    }
  };

  /** 스크롤 이벤트 핸들러 */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };

  /** 맨 위로 스크롤 */
  const scrollToTop = () => {
    const container = document.querySelector('.detail-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /** 섹션으로 스크롤 */
  const scrollToSection = (tab: 'photos' | 'info' | 'reviews' | 'notice') => {
    setActiveTab(tab);
    const element = document.getElementById(`section-${tab}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /** 별점 렌더링 */
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

  /** 날짜 포맷 */
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 지도용 마커 데이터 생성
  const mapDestination = destination.mapx && destination.mapy ? [{
    contentid: destination.contentid,
    contenttypeid: destination.contenttypeid,
    title: destination.title,
    addr1: destination.addr1,
    mapx: parseFloat(String(destination.mapx)),
    mapy: parseFloat(String(destination.mapy)),
    firstimage: destination.firstimage,
    firstimage2: destination.firstimage2,
    distance: null,
    typeName: getContentTypeName(destination.contenttypeid),
  }] : [];

  return (
    <div 
      className="fixed inset-0 z-50 bg-white overflow-y-auto detail-scroll-container" 
      onScroll={handleScroll}
    >
      {/* 헤더 */}
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          onOpenSearch={onOpenSearch || (() => {})}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Sticky 미니탭 */}
      <div className="sticky top-16 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {(['photos', 'info', 'reviews', 'notice'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab)}
                className={`px-4 py-3 transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab === 'photos' && '사진보기'}
                {tab === 'info' && '상세정보'}
                {tab === 'reviews' && '후기'}
                {tab === 'notice' && '안내사항'}
              </button>
            ))}
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
              {/* 찜 버튼 */}
              <button 
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{favoriteCount}</span>
              </button>
              {/* 조회수 */}
              <div className="flex items-center gap-1 text-gray-600">
                <Eye className="h-5 w-5" />
                <span>{destination.viewCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        
        {/* 사진보기 섹션 */}
        <section id="section-photos" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">사진보기</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* 대표 이미지 (firstimage) */}
            {destination.firstimage && (
              <img
                src={destination.firstimage}
                alt={destination.title}
                className="flex-shrink-0 w-80 h-52 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {/* DB 이미지 목록 (destination_image 테이블) */}
            {images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`${destination.title} ${index + 1}`}
                className="flex-shrink-0 w-80 h-52 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
            {/* 이미지 없을 때 */}
            {!destination.firstimage && images.length === 0 && (
              <div className="w-full h-52 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">이미지가 없습니다</span>
              </div>
            )}
          </div>
        </section>

        {/* 상세정보 섹션 */}
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

          {/* 지도 - 카카오맵 연동 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">위치</h4>
            {destination.mapx && destination.mapy ? (
              <div className="w-full h-64 rounded-lg overflow-hidden border">
                <KakaoMap
                  centerLat={parseFloat(String(destination.mapy))}
                  centerLng={parseFloat(String(destination.mapx))}
                  level={3}
                  destinations={mapDestination}
                  height="256px"
                />
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

        {/* 후기 섹션 */}
        <section id="section-reviews" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">후기</h3>
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  {renderStars(averageRating, 'md')}
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)}/5 ({reviewCount}개)
                  </span>
                </div>
              )}
            </div>
            {/* 후기 작성 버튼 - 이미 작성했으면 비활성화 */}
            <Button 
              onClick={() => {
                if (!isLoggedIn) {
                  alert('로그인이 필요한 서비스입니다.');
                  return;
                }
                if (hasMyReview) {
                  alert('이미 이 여행지에 후기를 작성하셨습니다.\n기존 후기를 수정해주세요.');
                  return;
                }
                setIsWritingReview(!isWritingReview);
              }}
              disabled={hasMyReview}
              className={hasMyReview ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {hasMyReview ? '작성 완료' : '후기 작성'}
            </Button>
          </div>

          {/* 후기 작성 폼 */}
          {isWritingReview && !hasMyReview && (
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
                <Button onClick={handleSubmitReview} disabled={reviewLoading}>
                  {reviewLoading ? '등록 중...' : '등록'}
                </Button>
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
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div 
                  key={review.rvId} 
                  className={`bg-white border rounded-lg p-4 ${
                    review.mId === currentUserId ? 'border-blue-300 bg-blue-50/30' : ''
                  }`}
                >
                  {/* 수정 모드 */}
                  {editingReviewId === review.rvId ? (
                    <div>
                      {/* 별점 수정 */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                              onMouseEnter={() => setEditHoverRating(star)}
                              onMouseLeave={() => setEditHoverRating(0)}
                              className="text-2xl transition-all"
                            >
                              {star <= (editHoverRating || editRating) ? '⭐' : '☆'}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* 내용 수정 */}
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-vertical mb-3"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(review.rvId)}
                          disabled={reviewLoading}
                        >
                          저장
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 일반 모드 */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.memberNickname}</span>
                          {review.mId === currentUserId && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                              내 후기
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* 수정/삭제 버튼 - 본인 글만 */}
                          {review.mId === currentUserId && (
                            <>
                              <button
                                onClick={() => handleStartEdit(review)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="수정"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.rvId)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {renderStars(review.rvRating, 'sm')}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.rvContent}</p>
                    </>
                  )}
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

        {/* 안내사항 섹션 */}
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

      {/* 닫기 버튼 */}
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