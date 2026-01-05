/**
 * TravelListPage.tsx
 * * 수정: 상세 지역(시군구) 다중 선택 기능 적용
 * * 상태: selectedSigngu string -> string[] (배열)로 변경
 */

import { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, RefreshCw, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { 
  getDestinationList, 
  getRegions, 
  getSignguList,
  CONTENT_TYPES
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

interface TravelListPageProps {
  onSelectDestination: (id: string) => void;
  isLoggedIn?: boolean;
  favoriteDestinations?: any[];
  onToggleFavorite?: (destination: any) => void;
  currentUserId?: number; 
}

export function TravelListPage({ 
  onSelectDestination,
  isLoggedIn,
  favoriteDestinations = [],
  onToggleFavorite,
  currentUserId, 
}: TravelListPageProps) {
  
  // ============================================
  // 상태 관리
  // ============================================
  const [regions, setRegions] = useState<Region[]>([]);
  const [signguList, setSignguList] = useState<Signgu[]>([]);
  
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  
  // ✅ [수정] 다중 선택을 위해 문자열('') 대신 배열([])로 초기화
  const [selectedSigngu, setSelectedSigngu] = useState<string[]>([]);
  
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegionsLoading, setIsRegionsLoading] = useState(true);

  const itemsPerPage = 10;

  // 지역명 단축 헬퍼 함수
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

  // ============================================
  // 데이터 로드
  // ============================================
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

  useEffect(() => {
    if (selectedRegion) {
      const fetchSigngu = async () => {
        try {
          const data = await getSignguList(selectedRegion);
          setSignguList(data);
        } catch (error) {
          console.error('시군구 목록 조회 오류:', error);
          setSignguList([]);
        }
      };
      fetchSigngu();
    } else {
      setSignguList([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchDestinations();
  }, [selectedRegion, selectedSigngu, selectedContentType, sortBy, currentPage]);

  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      // ✅ [수정] 배열을 콤마(,)로 구분된 문자열로 변환하여 API 전달 (예: "11110,11120")
      // 만약 선택된 게 없으면(빈배열) undefined 처리
      const signguParam = selectedSigngu.length > 0 ? selectedSigngu.join(',') : undefined;

      const response = await getDestinationList(
        selectedContentType || undefined,
        currentPage,
        itemsPerPage,
        sortBy,
        selectedRegion || undefined,
        signguParam // 변환된 값 전달
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
    // 지역 바뀌면 상세지역 선택 초기화
    setSelectedSigngu([]); 
    setCurrentPage(1);
  };

  // ✅ [수정] 상세지역 다중 선택 로직
  const handleSignguClick = (signguCd: string) => {
    // 1. "전체" 버튼 클릭 시 (빈 문자열)
    if (signguCd === '') {
      setSelectedSigngu([]); // 선택 초기화
      setCurrentPage(1);
      return;
    }

    // 2. 일반 지역 버튼 클릭 시 (토글)
    setSelectedSigngu((prev) => {
      if (prev.includes(signguCd)) {
        // 이미 선택되어 있으면 제거
        return prev.filter((code) => code !== signguCd);
      } else {
        // 선택 안 되어 있으면 추가
        return [...prev, signguCd];
      }
    });
    setCurrentPage(1);
  };

  const handleContentTypeClick = (typeId: string) => {
    if (selectedContentType === typeId) { setSelectedContentType(''); } else { setSelectedContentType(typeId); }
    setCurrentPage(1);
  };
  const handleToggleFavorite = (destination: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { alert('로그인이 필요한 기능입니다.'); return; }
    if (onToggleFavorite) { onToggleFavorite(destination); }
  };
  const isFavorite = (contentid: string) => {
    return favoriteDestinations.some((fav) => fav.contentid === contentid);
  };
  const getContentTypeName = (typeId: string): string => {
    return CONTENT_TYPES[typeId] || '기타';
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

          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => handleContentTypeClick('')} className={`px-4 py-2 rounded-full border transition-colors ${selectedContentType === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'}`}>#전체</button>
              {Object.entries(CONTENT_TYPES).map(([typeId, typeName]) => (
                <button key={typeId} onClick={() => handleContentTypeClick(typeId)} className={`px-4 py-2 rounded-full border transition-colors ${selectedContentType === typeId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'}`}>#{typeName}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600">총 <span className="text-blue-600 font-semibold">{totalCount.toLocaleString()}</span>개</div>
            <div className="flex gap-2">
              <button onClick={() => { setSortBy('latest'); setCurrentPage(1); }} className={`px-4 py-2 text-sm ${sortBy === 'latest' ? 'text-blue-600 font-semibold underline' : 'text-gray-600 hover:text-blue-600'}`}>최신순</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => { setSortBy('popular'); setCurrentPage(1); }} className={`px-4 py-2 text-sm ${sortBy === 'popular' ? 'text-blue-600 font-semibold underline' : 'text-gray-600 hover:text-blue-600'}`}>인기순</button>
            </div>
          </div>

          {isLoading && <div className="flex justify-center items-center py-20"><RefreshCw className="h-8 w-8 animate-spin text-blue-600" /></div>}

          {!isLoading && (
            <div className="space-y-4">
              {destinations.map((destination) => (
                <div key={destination.contentid} className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="flex p-4">
                    <button onClick={() => onSelectDestination(destination.contentid)} className="flex flex-1 gap-4 text-left">
                      <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {destination.firstimage ? (
                          <img src={destination.firstimage} alt={destination.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">이미지 없음</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{destination.title}</h3>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded flex-shrink-0">{getContentTypeName(destination.contenttypeid)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 truncate">{destination.regionName || destination.addr1}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{destination.averageRating ? Number(destination.averageRating).toFixed(1) : "0.0"}</span>
                            <span className="text-gray-400 font-normal">({destination.reviewCount || 0})</span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <span>조회 {destination.viewCount?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </button>
                    <div className="flex flex-col items-center justify-center gap-2 ml-4 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={(e) => handleToggleFavorite(destination, e)}>
                        <Heart className={`h-6 w-6 ${isFavorite(destination.contentid) ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {destinations.length === 0 && <div className="text-center py-20 text-gray-500">여행지가 없습니다.</div>}
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
                  <div className="flex justify-center py-4"><RefreshCw className="h-5 w-5 animate-spin text-gray-400" /></div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleRegionClick('')} className={`py-2 text-sm rounded-full border transition-all ${selectedRegion === '' ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>#전체</button>
                    {regions.map((region) => (
                      <button key={region.lDongRegnCd} onClick={() => handleRegionClick(region.lDongRegnCd)} className={`py-2 text-sm rounded-full border transition-all ${selectedRegion === region.lDongRegnCd ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>#{formatRegionName(region.regnName)}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* 시군구 목록 (다중 선택 적용) */}
              {selectedRegion && signguList.length > 0 && (
                <div className="pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">상세 지역</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleSignguClick('')} 
                      // ✅ '전체'는 배열 길이가 0일 때 선택된 것으로 표시
                      className={`py-2 text-sm rounded-full border transition-colors ${selectedSigngu.length === 0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      전체
                    </button>
                    {signguList.map((signgu) => (
                      <button 
                        key={signgu.lDongSignguCd} 
                        onClick={() => handleSignguClick(signgu.lDongSignguCd)} 
                        // ✅ 배열에 포함(.includes)되어 있으면 선택된 스타일 적용
                        className={`py-2 text-sm rounded-full border transition-colors ${selectedSigngu.includes(signgu.lDongSignguCd) ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {signgu.signguName}
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