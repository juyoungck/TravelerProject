/**
 * TravelListPage.tsx
 * ★ 수정: 찜 기능 API 직접 호출, 리뷰 통계 표시
 * ★ 수정: 시군구를 "시" 단위로 그룹핑
 */

import { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, RefreshCw, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getContentTypeStyle, FILTER_CONTENT_TYPES } from '../../utils/contentTypeUtils';
import { 
  getDestinationList, 
  getRegions, 
  getSignguList,
  toggleFavorite,
  getFavoritesByMember
} from '../../api/destinationApi';

interface Region {
  lDongRegnCd: string;
  regnName: string;
}

interface Signgu {
  lDongRegnCd: string;
  lDongSignguCd: string;
  signguName: string;
}

/** 그룹핑된 시군구 타입 */
interface GroupedCity {
  name: string;
  codes: string[];
}

interface TravelListPageProps {
  onSelectDestination: (id: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
}

export function TravelListPage({ 
  onSelectDestination,
  isLoggedIn,
  currentUserId,
}: TravelListPageProps) {
  
  // ============================================
  // 상태 관리
  // ============================================
  const [regions, setRegions] = useState<Region[]>([]);
  const [_signguList, setSignguList] = useState<Signgu[]>([]);
  const [groupedCities, setGroupedCities] = useState<GroupedCity[]>([]); // ★ 그룹핑된 시 목록
  
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSigngu, setSelectedSigngu] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegionsLoading, setIsRegionsLoading] = useState(true);

  // ★ 찜 목록 상태
  const [favoriteContentIds, setFavoriteContentIds] = useState<Set<string>>(new Set());
  const [isFavoriteLoading, setIsFavoriteLoading] = useState<string | null>(null);

  const itemsPerPage = 10;

  // ============================================
  // 헬퍼 함수
  // ============================================

  /** 지역명 단축 */
  const formatRegionName = (fullName: string) => {
    const shortNames: { [key: string]: string } = {
      '서울특별시': '서울',
      '부산광역시': '부산',
      '대구광역시': '대구',
      '인천광역시': '인천',
      '광주광역시': '광주', 
      '대전광역시': '대전',
      '울산광역시': '울산', 
      '세종특별자치시': '세종', 
      '경기도': '경기',
      '강원특별자치도': '강원', 
      '충청북도': '충북', 
      '충청남도': '충남',
      '전북특별자치도': '전북', 
      '전라남도': '전남', 
      '경상북도': '경북',
      '경상남도': '경남', 
      '제주특별자치도': '제주'
    };
    return shortNames[fullName] || fullName;
  };

  /** 
   * ★ 시군구를 "시" 단위로 그룹핑
   * 예: "전주시", "전주시 완산구", "전주시 덕진구" → "전주시" (3개 코드 포함)
   */
  const groupSignguByCity = (signguList: Signgu[]): GroupedCity[] => {
    const grouped: { [cityName: string]: string[] } = {};
    
    signguList.forEach((signgu) => {
      const name = signgu.signguName.trim();
      let cityName = name;
      
      // "ㅇㅇ시 ㅇㅇ구" 또는 "ㅇㅇ시 ㅇㅇ군" 패턴 → "ㅇㅇ시"로 추출
      if (name.includes('세종특별자치시')) {
        cityName = '세종시';
      }
      else if (name.includes('시 ')) {
        cityName = name.split(' ')[0]; // "전주시 완산구" → "전주시"    
      }
      // "ㅇㅇ시" 단독 (예: "청주시", "수원시") → 그대로
      else if (name.endsWith('시')) {
        cityName = name;
      }
      // "ㅇㅇ군" 또는 "ㅇㅇ구" (시 없이 단독) → 그대로
      // 예: "보은군", "중구" 등
      
      if (!grouped[cityName]) {
        grouped[cityName] = [];
      }
      grouped[cityName].push(signgu.lDongSignguCd);
    });
    
    // 객체를 배열로 변환하고 이름순 정렬
    return Object.entries(grouped)
      .map(([name, codes]) => ({ name, codes }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  };

  // ============================================
  // 데이터 로드
  // ============================================
  
  // 시도 목록 로드
  useEffect(() => {
    const fetchRegions = async () => {
      setIsRegionsLoading(true);
      try {
        const data = await getRegions();
        setRegions(data);
      } catch (error) {
        console.error('시도 목록 조회 오류:', error);
      } finally {
        setIsRegionsLoading(false);
      }
    };
    fetchRegions();
  }, []);

  // ★ 시군구 목록 로드 + 그룹핑
  useEffect(() => {
    if (selectedRegion) {
      const fetchSigngu = async () => {
        try {
          const data = await getSignguList(selectedRegion);
          setSignguList(data);
          
          // ★ 그룹핑 적용
          const grouped = groupSignguByCity(data);
          setGroupedCities(grouped);
        } catch (error) {
          console.error('시군구 목록 조회 오류:', error);
          setSignguList([]);
          setGroupedCities([]);
        }
      };
      fetchSigngu();
    } else {
      setSignguList([]);
      setGroupedCities([]);
    }
  }, [selectedRegion]);

  // ★ 찜 목록 로드
  useEffect(() => {
    const loadFavorites = async () => {
      if (isLoggedIn && currentUserId) {
        try {
          const response = await getFavoritesByMember(currentUserId);
          if (response.status === 'success' && response.data) {
            const ids = new Set<string>(response.data.map((fav: any) => fav.contentid));
            setFavoriteContentIds(ids);
          }
        } catch (error) {
          console.error('찜 목록 조회 실패:', error);
        }
      } else {
        setFavoriteContentIds(new Set());
      }
    };
    loadFavorites();
  }, [isLoggedIn, currentUserId]);

  // 여행지 목록 로드
  useEffect(() => {
    fetchDestinations();
  }, [selectedRegion, selectedSigngu, selectedContentType, sortBy, currentPage]);

  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const signguParam = selectedSigngu.length > 0 ? selectedSigngu.join(',') : undefined;

      const response = await getDestinationList(
        selectedContentType || undefined,
        currentPage,
        itemsPerPage,
        sortBy,
        selectedRegion || undefined,
        signguParam
      );
      setDestinations(response.data || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('여행지 목록 조회 오류:', error);
      setDestinations([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 이벤트 핸들러
  // ============================================
  
  const handleRegionClick = (regionCd: string) => {
    if (selectedRegion === regionCd) { 
      setSelectedRegion(''); 
    } else { 
      setSelectedRegion(regionCd); 
    }
    setSelectedSigngu([]); 
    setCurrentPage(1);
  };

  /** ★ 시 단위 클릭 핸들러 (해당 시의 모든 구/군 코드 토글) */
  const handleCityClick = (city: GroupedCity) => {
    const allSelected = city.codes.every(code => selectedSigngu.includes(code));
    
    if (allSelected) {
      // 전부 선택됨 → 전부 해제
      setSelectedSigngu(prev => prev.filter(code => !city.codes.includes(code)));
    } else {
      // 일부/미선택 → 전부 선택
      setSelectedSigngu(prev => {
        const newSet = new Set([...prev, ...city.codes]);
        return Array.from(newSet);
      });
    }
    setCurrentPage(1);
  };

  /** 상세지역 전체 선택 해제 */
  const handleSignguReset = () => {
    setSelectedSigngu([]);
    setCurrentPage(1);
  };

  const handleContentTypeClick = (typeId: string) => {
    if (selectedContentType === typeId) { 
      setSelectedContentType(''); 
    } else { 
      setSelectedContentType(typeId); 
    }
    setCurrentPage(1);
  };

  // ★ 찜 토글 핸들러 (API 직접 호출)
  const handleToggleFavorite = async (destination: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn || !currentUserId) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    // 중복 클릭 방지
    if (isFavoriteLoading === destination.contentid) return;
    
    setIsFavoriteLoading(destination.contentid);
    
    try {
      const response = await toggleFavorite(currentUserId, destination.contentid);
      
      if (response.status === 'success') {
        setFavoriteContentIds(prev => {
          const newSet = new Set(prev);
          if (response.isFavorite) {
            newSet.add(destination.contentid);
          } else {
            newSet.delete(destination.contentid);
          }
          return newSet;
        });
      } else {
        alert(response.message || '찜 처리에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('찜 토글 실패:', error);
      alert(error.response?.data?.message || '찜 처리 중 오류가 발생했습니다.');
    } finally {
      setIsFavoriteLoading(null);
    }
  };

  // ★ 찜 여부 확인
  const isFavorite = (contentid: string) => {
    return favoriteContentIds.has(contentid);
  };

  /** ★ 시가 선택되었는지 확인 (모든 코드가 선택된 경우) */
  const isCitySelected = (city: GroupedCity) => {
    return city.codes.every(code => selectedSigngu.includes(code));
  };

  const getSelectedRegionName = (): string => {
    if (!selectedRegion) return '전체';
    const region = regions.find(r => r.lDongRegnCd === selectedRegion);
    return region?.regnName || '전체';
  };

  // ============================================
  // 페이지네이션 렌더링
  // ============================================
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>처음</Button>
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        {pageNumbers.map((page) => (
          <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="min-w-[40px]">{page}</Button>
        ))}
        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>마지막</Button>
        <span className="ml-4 text-sm text-gray-600">({currentPage} / {totalPages} 페이지)</span>
      </div>
    );
  };

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        
        {/* 왼쪽: 여행지 리스트 */}
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">여행지</p>
            <h1 className="text-3xl font-bold">#{getSelectedRegionName()}</h1>
          </div>

          {/* 콘텐츠 타입 필터 */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => handleContentTypeClick('')} 
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedContentType === '' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }`}
              >
                #전체
              </button>
              {Object.entries(FILTER_CONTENT_TYPES).map(([typeId, typeName]) => (
                <button 
                  key={typeId} 
                  onClick={() => handleContentTypeClick(typeId)} 
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedContentType === typeId 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                  }`}
                >
                  #{typeName}
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 및 개수 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600">
              총 <span className="text-blue-600 font-semibold">{totalCount.toLocaleString()}</span>개
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setSortBy('latest'); setCurrentPage(1); }} 
                className={`px-4 py-2 text-sm ${
                  sortBy === 'latest' 
                    ? 'text-blue-600 font-semibold underline' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                최신순
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => { setSortBy('popular'); setCurrentPage(1); }} 
                className={`px-4 py-2 text-sm ${
                  sortBy === 'popular' 
                    ? 'text-blue-600 font-semibold underline' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                인기순
              </button>
            </div>
          </div>

          {/* 로딩 */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* 여행지 목록 */}
          {!isLoading && (
            <div className="space-y-4">
              {destinations.map((destination) => (
                <div 
                  key={destination.contentid} 
                  className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex p-4">
                    <button 
                      onClick={() => onSelectDestination(destination.contentid)} 
                      className="flex flex-1 gap-4 text-left"
                    >
                      {/* 이미지 */}
                      <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {destination.firstimage ? (
                          <img 
                            src={destination.firstimage} 
                            alt={destination.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            이미지 없음
                          </div>
                        )}
                      </div>
                      
                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{destination.title}</h3>
                          {(() => {
                            const style = getContentTypeStyle(destination.contenttypeid);
                            return (
                              <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${style.bgColor} ${style.textColor}`}>
                                {style.name}
                              </span>
                            );
                          })()}
                        </div>
                        
                        {/* ★ 지역명 표시 (SQL에서 JOIN으로 가져옴) */}
                        <p className="text-sm text-gray-600 mb-2 truncate">
                          {destination.regnName && destination.signguName 
                            ? `${destination.regnName} ${destination.signguName}`
                            : destination.addr1
                          }
                        </p>
                        
                        {/* ★ 리뷰 통계 + 조회수 */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Star className="h-4 w-4 fill-current" />
                            <span>
                              {destination.averageRating 
                                ? Number(destination.averageRating).toFixed(1) 
                                : "0.0"
                              }
                            </span>
                            <span className="text-gray-400 font-normal">
                              ({destination.reviewCount || 0})
                            </span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <span>조회 {destination.viewCount?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </button>
                    
                    {/* ★ 찜 버튼 */}
                    <div className="flex flex-col items-center justify-center gap-2 ml-4 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleToggleFavorite(destination, e)}
                        disabled={isFavoriteLoading === destination.contentid}
                      >
                        {isFavoriteLoading === destination.contentid ? (
                          <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                        ) : (
                          <Heart 
                            className={`h-6 w-6 transition-colors ${
                              isFavorite(destination.contentid) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-300 hover:text-red-400'
                            }`} 
                          />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {destinations.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  여행지가 없습니다.
                </div>
              )}
            </div>
          )}
          
          {!isLoading && renderPagination()}
        </div>

        {/* 오른쪽: 지역 필터 사이드바 */}
        <div className="w-72 flex-shrink-0">
          <div className="mt-[168px]">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">지역 (시/도)</h3>
              </div>

              {/* 시도 목록 */}
              <div className="mb-6">
                {isRegionsLoading ? (
                  <div className="flex justify-center py-4">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleRegionClick('')} 
                      className={`py-2 text-sm rounded-full border transition-all ${
                        selectedRegion === '' 
                          ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      #전체
                    </button>
                    {regions.map((region) => (
                      <button 
                        key={region.lDongRegnCd} 
                        onClick={() => handleRegionClick(region.lDongRegnCd)} 
                        className={`py-2 text-sm rounded-full border transition-all ${
                          selectedRegion === region.lDongRegnCd 
                            ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        #{formatRegionName(region.regnName)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ★ 시군구 목록 (그룹핑된 버전) */}
              {selectedRegion && groupedCities.length > 0 && (
                <div className="pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">상세 지역</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={handleSignguReset} 
                      className={`py-2 text-sm rounded-full border transition-colors ${
                        selectedSigngu.length === 0 
                          ? 'bg-gray-800 text-white border-gray-800' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      전체
                    </button>
                    {groupedCities.map((city) => (
                      <button 
                        key={city.name} 
                        onClick={() => handleCityClick(city)} 
                        className={`py-2 text-sm rounded-full border transition-colors ${
                          isCitySelected(city) 
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}