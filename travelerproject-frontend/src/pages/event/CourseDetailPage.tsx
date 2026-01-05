/**
 * CourseDetailPage.tsx - 여행코스 상세 페이지
 * 
 * 기능:
 * - 코스 기본 정보 표시
 * - 경유지 목록 표시 (순서대로)
 * - 경유지 클릭 시 TravelDetailPage로 이동
 * - 지도에 경유지 순서대로 마커 표시
 * - 이미지 슬라이더 (코스 메인 + 경유지 이미지들)
 */

import { useState, useEffect } from 'react';
import { MapPin, X, ArrowUp, ChevronLeft, ChevronRight, Loader2, Navigation, ExternalLink } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { CourseSpot, getCourseDetail } from '../../api/festivalApi';

/** 여행코스 아이템 인터페이스 (DB) */
interface CourseItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2: string;
  tel: string;
  firstimage: string;
  firstimage2: string;
  mapx: number;
  mapy: number;
  category: '여행코스';
}

interface CourseDetailPageProps {
  course: CourseItem;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

export function CourseDetailPage({ 
  course, 
  onClose, 
  onNavigate, 
  isLoggedIn, 
  onOpenSearch 
}: CourseDetailPageProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<'course' | 'info' | 'map'>('course');
  
  // 이미지 슬라이더 상태
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 경유지 상태
  const [spots, setSpots] = useState<CourseSpot[]>([]);
  const [isSpotsLoading, setIsSpotsLoading] = useState(true);

  // 경유지 목록 로드
  useEffect(() => {
    const fetchSpots = async () => {
      setIsSpotsLoading(true);
      try {
        const response = await getCourseDetail(course.contentid);
        if (response.status === 'success' && response.spots) {
          setSpots(response.spots);
          
          // 이미지 수집: 코스 메인 + 경유지 이미지들
          const allImages: string[] = [];
          if (course.firstimage) allImages.push(course.firstimage);
          
          response.spots.forEach((spot: CourseSpot) => {
            if (spot.subdetailimg && !allImages.includes(spot.subdetailimg)) {
              allImages.push(spot.subdetailimg);
            }
          });
          
          setImages(allImages);
        }
      } catch (err) {
        console.error('경유지 로드 실패:', err);
        // 실패 시 메인 이미지만
        if (course.firstimage) setImages([course.firstimage]);
      } finally {
        setIsSpotsLoading(false);
      }
    };

    fetchSpots();
  }, [course.contentid, course.firstimage]);

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
    const container = document.querySelector('.course-detail-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 섹션으로 스크롤
  const scrollToSection = (tab: 'course' | 'info' | 'map') => {
    const element = document.getElementById(`course-section-${tab}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 경유지 클릭 핸들러 - TravelDetailPage로 이동
  const handleSpotClick = (spot: CourseSpot) => {
    if (spot.subcontentid && onNavigate) {
      // 여행지 상세 페이지로 이동
      onNavigate(`travelDetail/${spot.subcontentid}`);
    }
  };

  // 지도 중심점
  const getMapCenter = () => {
    if (spots.length > 0 && spots[0].mapx && spots[0].mapy) {
      return { lat: parseFloat(spots[0].mapy), lng: parseFloat(spots[0].mapx) };
    }
    if (course.mapx && course.mapy) {
      const lat = typeof course.mapy === 'number' ? course.mapy : parseFloat(String(course.mapy));
      const lng = typeof course.mapx === 'number' ? course.mapx : parseFloat(String(course.mapx));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return { lat: 37.5665, lng: 126.978 };
  };

  const mapCenter = getMapCenter();

  // 카카오맵 스크립트 로드 및 지도 생성
  useEffect(() => {
    if (isSpotsLoading) return;
    
    const mapContainer = document.getElementById('course-kakao-map');
    if (!mapContainer) return;

    // 경유지 좌표가 있는지 확인
    const validSpots = spots.filter(spot => spot.mapx && spot.mapy);
    if (validSpots.length === 0 && !course.mapx && !course.mapy) return;

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      const options = {
        center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
        level: 7
      };

      const map = new window.kakao.maps.Map(mapContainer, options);

      // Polyline 좌표 배열
      const linePath: any[] = [];

      // 경유지 마커 추가
      validSpots.forEach((spot, index) => {
        const position = new window.kakao.maps.LatLng(
          parseFloat(spot.mapy),
          parseFloat(spot.mapx)
        );

        // Polyline 경로에 추가
        linePath.push(position);

        // 번호가 있는 커스텀 마커
        const content = `
          <div style="
            background: #3B82F6;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">${index + 1}</div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: content,
          yAnchor: 0.5,
          xAnchor: 0.5
        });

        customOverlay.setMap(map);
      });

      // 경유지 순서대로 선(Polyline) 연결
      if (linePath.length > 1) {
        const polyline = new window.kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 4,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeStyle: 'solid'
        });

        polyline.setMap(map);
      }

      // 모든 마커가 보이도록 bounds 설정
      if (validSpots.length > 1) {
        const bounds = new window.kakao.maps.LatLngBounds();
        validSpots.forEach(spot => {
          bounds.extend(new window.kakao.maps.LatLng(
            parseFloat(spot.mapy),
            parseFloat(spot.mapx)
          ));
        });
        map.setBounds(bounds);
      }
    };

    // 카카오맵이 로드되어 있으면 바로 실행
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    }
  }, [isSpotsLoading, spots, course.mapx, course.mapy, mapCenter.lat, mapCenter.lng]);

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto course-detail-container" onScroll={handleScroll}>
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
                setActiveTab('course');
                scrollToSection('course');
              }}
              className={`px-4 py-3 transition-colors border-b-2 ${
                activeTab === 'course'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              코스안내
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
              사진보기
            </button>
            <button
              onClick={() => {
                setActiveTab('map');
                scrollToSection('map');
              }}
              className={`px-4 py-3 transition-colors border-b-2 ${
                activeTab === 'map'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              지도보기
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 제목 및 기본 정보 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{course.addr1 || '위치 정보 없음'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-y">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-600">
                🗺️ 여행코스
              </span>
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Navigation className="h-4 w-4" />
                <span>{spots.length}개 경유지</span>
              </div>
            </div>
          </div>
        </div>

        {/* 코스안내 - 경유지 목록 */}
        <section id="course-section-course" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">코스안내</h3>
          
          {isSpotsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">경유지 로딩 중...</span>
            </div>
          ) : spots.length > 0 ? (
            <div className="space-y-4">
              {spots.map((spot, index) => (
                <div
                  key={`${spot.subnum}-${index}`}
                  className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                    spot.subcontentid ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleSpotClick(spot)}
                >
                  <div className="flex">
                    {/* 순서 번호 */}
                    <div className="flex-shrink-0 w-16 bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
                      {index + 1}
                    </div>
                    
                    {/* 이미지 */}
                    {spot.subdetailimg && (
                      <div className="flex-shrink-0 w-32 h-24">
                        <img
                          src={spot.subdetailimg}
                          alt={spot.subname}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* 정보 */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{spot.subname}</h4>
                        {spot.subcontentid && (
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      {spot.subdetailoverview && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {spot.subdetailoverview}
                        </p>
                      )}
                      {spot.subcontentid && (
                        <p className="text-xs text-blue-500 mt-2">
                          클릭하여 상세 정보 보기
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>경유지 정보가 없습니다.</p>
            </div>
          )}
        </section>

        {/* 사진보기 - 이미지 슬라이더 (코스 메인 + 경유지 이미지들) */}
        <section id="course-section-info" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">
            사진보기 {images.length > 0 && <span className="text-sm text-gray-500 font-normal">({images.length}장)</span>}
          </h3>
          
          {isSpotsLoading ? (
            <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : images.length > 0 ? (
            <div className="relative">
              {/* 메인 이미지 */}
              <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={`${course.title} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
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
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-6xl">🗺️</span>
            </div>
          )}
        </section>

        {/* 지도보기 */}
        <section id="course-section-map" className="mb-12">
          <h3 className="text-xl font-semibold mb-4">지도보기</h3>
          
          <div 
            id="course-kakao-map" 
            className="w-full h-96 rounded-lg overflow-hidden border bg-gray-100"
          >
            {isSpotsLoading && (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          
          {/* 경유지 범례 */}
          {spots.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">경유지 순서</h4>
              <div className="flex flex-wrap gap-2">
                {spots.map((spot, index) => (
                  <span
                    key={`legend-${index}`}
                    className="px-3 py-1 bg-white border rounded-full text-sm"
                  >
                    <span className="font-semibold text-blue-600">{index + 1}</span>
                    <span className="mx-1">·</span>
                    <span>{spot.subname}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
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

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

export default CourseDetailPage;