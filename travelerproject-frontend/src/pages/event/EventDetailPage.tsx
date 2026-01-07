/**
 * EventDetailPage.tsx - 축제/공연/행사 상세 페이지
 * TravelDetailPage 스타일로 구성
 * 탭: 사진보기, 상세정보, 안내사항
 * 
 * 수정: 이미지 슬라이더 추가 (좌우 넘김)
 */

import { useState, useEffect } from 'react';
import { MapPin, Calendar, Phone, X, ArrowUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import KakaoMap from '../../components/map/KakaoMap';
import { getFestivalImages } from '../../api/festivalApi';
import type { FestivalItem } from '../../api/festivalApi';

interface EventDetailPageProps {
  event: FestivalItem;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

/** 날짜 포맷 함수 (YYYYMMDD → YYYY.MM.DD) */
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return dateStr || '';
  return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
};

/** 카테고리 이모지 */
const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case '축제': return '🎉';
    case '공연': return '🎭';
    case '행사': return '📅';
    default: return '🎪';
  }
};

/** 카테고리 색상 */
const getCategoryColor = (category: string): string => {
  switch (category) {
    case '축제': return 'bg-orange-100 text-orange-600';
    case '공연': return 'bg-purple-100 text-purple-600';
    case '행사': return 'bg-green-100 text-green-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export function EventDetailPage({ 
  event, 
  onClose, 
  onNavigate, 
  isLoggedIn, 
  onOpenSearch 
}: EventDetailPageProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'info' | 'notice'>('photos');
  
  // 이미지 슬라이더 상태
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImagesLoading, setIsImagesLoading] = useState(true);

  // 이미지 목록 로드
  useEffect(() => {
    const fetchImages = async () => {
      setIsImagesLoading(true);
      try {
        const response = await getFestivalImages(event.contentid);
        if (response.status === 'success' && response.images) {
          // 메인 이미지 + API 이미지 합치기 (중복 제거)
          const allImages: string[] = [];
          if (event.firstimage) allImages.push(event.firstimage);
          response.images.forEach((img: string) => {
            if (!allImages.includes(img)) allImages.push(img);
          });
          setImages(allImages);
        } else {
          // API 실패 시 기본 이미지만
          if (event.firstimage) setImages([event.firstimage]);
        }
      } catch (err) {
        console.error('이미지 로드 실패:', err);
        if (event.firstimage) setImages([event.firstimage]);
      } finally {
        setIsImagesLoading(false);
      }
    };

    fetchImages();
  }, [event.contentid, event.firstimage]);

  // 이전 이미지
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // 다음 이미지
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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

  // 섹션으로 스크롤
  const scrollToSection = (tab: 'photos' | 'info' | 'notice') => {
    const element = document.getElementById(`event-section-${tab}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 지도용 마커 데이터
  const mapDestination = event.mapx && event.mapy ? [{
    contentid: event.contentid,
    contenttypeid: '15',
    title: event.title,
    addr1: event.addr1,
    addr2: null,
    tel: null,
    mapx: parseFloat(event.mapx),
    mapy: parseFloat(event.mapy),
    firstimage: event.firstimage,
    firstimage2: event.firstimage2,
    distance: null,
    typeName: event.category,
    regnName: null,
    signguName: null,
  }] : [];

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto" onScroll={handleScroll}>
      {/* 헤더 */}
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
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{event.addr1 || '위치 정보 없음'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-y">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded text-sm ${getCategoryColor(event.category)}`}>
                {getCategoryEmoji(event.category)} {event.category}
              </span>
              {/* 날짜 */}
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(event.eventstartdate)}
                  {event.eventenddate && event.eventenddate !== event.eventstartdate && (
                    <> ~ {formatDate(event.eventenddate)}</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 사진보기 - 이미지 슬라이더 */}
        <section id="event-section-photos" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">
            사진보기 {images.length > 0 && <span className="text-sm text-gray-500 font-normal">({images.length}장)</span>}
          </h3>
          
          {isImagesLoading ? (
            <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : images.length > 0 ? (
            <div className="relative">
              {/* 메인 이미지 */}
              <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={`${event.title} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                />
                
                {/* 이미지 카운터 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* 좌우 버튼 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* 썸네일 목록 */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`썸네일 ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-6xl">{getCategoryEmoji(event.category)}</span>
            </div>
          )}
        </section>

        {/* 상세정보 */}
        <section id="event-section-info" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">상세정보</h3>

          {/* 행사 정보 */}
          <div className="bg-white border rounded-lg p-4 mb-6 space-y-3">
            {/* 기간 */}
            <div className="flex gap-2">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold mb-1">행사 기간</h5>
                <p className="text-gray-600">
                  {formatDate(event.eventstartdate)}
                  {event.eventenddate && event.eventenddate !== event.eventstartdate && (
                    <> ~ {formatDate(event.eventenddate)}</>
                  )}
                </p>
              </div>
            </div>

            {/* 장소 */}
            <div className="flex gap-2">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold mb-1">장소</h5>
                <p className="text-gray-600">
                  {event.addr1 || '위치 정보 없음'}
                  {event.addr2 && ` ${event.addr2}`}
                </p>
              </div>
            </div>
          </div>

          {/* 지도 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">위치</h4>
            {event.mapx && event.mapy ? (
              <div className="w-full h-64 rounded-lg overflow-hidden border">
                <KakaoMap
                  centerLat={parseFloat(event.mapy)}
                  centerLng={parseFloat(event.mapx)}
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
        </section>

        {/* 안내사항 */}
        <section id="event-section-notice" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">안내사항</h3>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            {event.tel && (
              <div className="flex gap-2">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold mb-1">문의전화</h5>
                  <p className="text-gray-700">{event.tel}</p>
                </div>
              </div>
            )}
            {event.zipcode && (
              <div>
                <h5 className="font-semibold mb-1">우편번호</h5>
                <p className="text-gray-700">{event.zipcode}</p>
              </div>
            )}
            {!event.tel && !event.zipcode && (
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

export default EventDetailPage;