/**
 * SearchModal.tsx - 통합 검색 모달 (개선 버전)
 * - contenttypeid 기반 타입 구분
 * - title만 검색
 * - 아이콘 + 타입 + 제목 한 줄 정렬
 * - 총 검색 결과 개수 표시
 * - 정확한 페이징
 */

import { useState, useEffect } from 'react';
import { X, Search, MapPin, Calendar, ChevronLeft, ChevronRight, UtensilsCrossed, Building2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import api from '../../api/api';

// contenttypeid 매핑
const CONTENT_TYPE_MAP: Record<string, string> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/공연',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점'
};

interface SearchResult {
  id: string;
  type: '관광지' | '문화시설' | '축제/공연' | '여행코스' | '레포츠' | '숙박' | '쇼핑' | '음식점' | '플래너';
  iconType: 'place' | 'planner';
  title: string;
  subtitle: string;
  image?: string;
  contenttypeid?: string;
}

type SearchTab = '전체' | '여행지' | '플래너';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination?: (id: number) => void;
  onSelectPlanner?: (planner: any) => void;
}

export function SearchModal({ isOpen, onClose, onSelectDestination, onSelectPlanner }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState<SearchTab>('전체');
  const pageSize = 10;

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery.trim()) {
      setResults([]);
      setCurrentPage(1);
      setTotalCount(0);
      setTotalPages(0);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      handleSearch(searchQuery, 1, activeTab);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, activeTab]);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setResults([]);
      setCurrentPage(1);
      setTotalCount(0);
      setTotalPages(0);
      setActiveTab('전체');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (query: string, page: number, tab: SearchTab) => {
    if (query.trim() === '') {
      setResults([]);
      setTotalCount(0);
      setTotalPages(0);
      return;
    }

    setIsLoading(true);

    try {
      let items: SearchResult[] = [];
      let totalCnt = 0;
      let totalPgs = 0;

      if (tab === '전체') {
        // 통합 검색 API 호출
        const response = await api.get('/search', {
          params: { keyword: query, page, size: pageSize }
        });
        const result = response.data;

        if (result.status === 'success') {
          totalCnt = result.totalCount || 0;
          totalPgs = result.totalPages || 0;

          items = (result.data || []).map((item: any) => {
            const searchType = item.SEARCHTYPE || item.searchType;
            
            if (searchType === 'destination') {
              // 여행지
              const contentTypeId = String(item.CONTENTTYPEID || item.contenttypeid || '12');
              const typeName = CONTENT_TYPE_MAP[contentTypeId] || '관광지';

              return {
                id: String(item.ID || item.id),
                type: typeName as SearchResult['type'],
                iconType: 'place' as const,
                title: item.TITLE || item.title,
                subtitle: item.REGIONNAME || item.regionName || item.ADDR1 || item.addr1 || '',
                image: item.FIRSTIMAGE2 || item.firstimage2,
                contenttypeid: contentTypeId,
              };
            } else {
              // 플래너
              let regionText = '';
              const sidoName = item.SIDONAME || item.sidoName || '';
              const signguName = item.SIGNGUNAME || item.signguName || '';
              
              if (sidoName) {
                regionText = sidoName;
                if (signguName) {
                  regionText += ' ' + signguName;
                }
              }

              const startDate = item.STARTDATE || item.startDate;
              const endDate = item.ENDDATE || item.endDate;
              let dateText = '';
              if (startDate) {
                const start = new Date(startDate).toLocaleDateString('ko-KR');
                const end = endDate ? new Date(endDate).toLocaleDateString('ko-KR') : '';
                dateText = end ? `${start} ~ ${end}` : start;
              }

              const author = item.MEMBERNICKNAME || item.memberNickname || '';

              const subtitleParts = [];
              if (author) subtitleParts.push(author);
              if (dateText) subtitleParts.push(dateText);
              if (regionText) subtitleParts.push(regionText);

              return {
                id: String(item.ID || item.id),
                type: '플래너' as const,
                iconType: 'planner' as const,
                title: item.TITLE || item.title,
                subtitle: subtitleParts.join(' | ') || '정보 없음',
              };
            }
          });
        }
      } else if (tab === '여행지') {
        // 여행지만 검색
        const response = await api.get('/search/destination', {
          params: { keyword: query, page, size: pageSize }
        });
        const result = response.data;

        if (result.status === 'success') {
          totalCnt = result.totalCount || 0;
          totalPgs = result.totalPages || 0;

          items = (result.data || []).map((item: any) => {
            const contentTypeId = String(item.CONTENTTYPEID || item.contenttypeid || '12');
            const typeName = CONTENT_TYPE_MAP[contentTypeId] || '관광지';

            return {
              id: String(item.CONTENTID || item.contentid),
              type: typeName as SearchResult['type'],
              iconType: 'place' as const,
              title: item.TITLE || item.title,
              subtitle: item.REGIONNAME || item.regionName || item.ADDR1 || item.addr1 || '',
              image: item.FIRSTIMAGE2 || item.firstimage2,
              contenttypeid: contentTypeId,
            };
          });
        }
      } else {
        // 플래너만 검색
        const response = await api.get('/search/planner', {
          params: { keyword: query, page, size: pageSize }
        });
        const result = response.data;

        if (result.status === 'success') {
          totalCnt = result.totalCount || 0;
          totalPgs = result.totalPages || 0;

          items = (result.data || []).map((item: any) => {
            let regionText = '';
            const sidoName = item.SIDONAME || item.sidoName || '';
            const signguName = item.SIGNGUNAME || item.signguName || '';
            
            if (sidoName) {
              regionText = sidoName;
              if (signguName) {
                regionText += ' ' + signguName;
              }
            }

            const startDate = item.STARTDATE || item.startDate;
            const endDate = item.ENDDATE || item.endDate;
            let dateText = '';
            if (startDate) {
              const start = new Date(startDate).toLocaleDateString('ko-KR');
              const end = endDate ? new Date(endDate).toLocaleDateString('ko-KR') : '';
              dateText = end ? `${start} ~ ${end}` : start;
            }

            const author = item.MEMBERNICKNAME || item.memberNickname || '';

            const subtitleParts = [];
            if (author) subtitleParts.push(author);
            if (dateText) subtitleParts.push(dateText);
            if (regionText) subtitleParts.push(regionText);

            return {
              id: String(item.PLNID || item.plnId),
              type: '플래너' as const,
              iconType: 'planner' as const,
              title: item.PLNTITLE || item.plnTitle,
              subtitle: subtitleParts.join(' | ') || '정보 없음',
            };
          });
        }
      }

      setResults(items);
      setTotalCount(totalCnt);
      setTotalPages(totalPgs);

    } catch (error) {
      console.error('검색 실패:', error);
      setResults([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    if (searchQuery.trim()) {
      handleSearch(searchQuery, 1, tab);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    handleSearch(searchQuery, newPage, activeTab);
  };

  const getIcon = (result: SearchResult) => {
    if (result.iconType === 'planner') {
      return <Calendar className="h-4 w-4" />;
    }

    // 여행지 타입별 아이콘
    switch (result.type) {
      case '음식점':
        return <UtensilsCrossed className="h-4 w-4" />;
      case '문화시설':
      case '숙박':
        return <Building2 className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (result: SearchResult) => {
    if (result.iconType === 'planner') {
      return 'bg-green-100 text-green-600';
    }

    // 여행지 타입별 색상
    switch (result.type) {
      case '관광지':
        return 'bg-blue-100 text-blue-600';
      case '문화시설':
        return 'bg-purple-100 text-purple-600';
      case '음식점':
        return 'bg-orange-100 text-orange-600';
      case '숙박':
        return 'bg-pink-100 text-pink-600';
      case '쇼핑':
        return 'bg-yellow-100 text-yellow-600';
      case '레포츠':
        return 'bg-teal-100 text-teal-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.iconType === 'place' && onSelectDestination) {
      onSelectDestination(Number(result.id));
    } else if (result.iconType === 'planner' && onSelectPlanner) {
      onSelectPlanner({ id: Number(result.id), title: result.title });
    }
    onClose();
  };

  // 페이징 버튼 표시 여부
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          {/* 헤더 + 탭 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">통합 검색</h3>
              <div className="flex gap-1">
                {(['전체', '여행지', '플래너'] as SearchTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 검색 입력 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="여행지, 플래너를 검색하세요... (예: 경복궁, 부산)"
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 로딩 중 */}
          {isLoading && (
            <div className="text-center py-12 text-gray-500">
              검색 중...
            </div>
          )}

          {/* 검색 결과 없음 */}
          {!isLoading && searchQuery && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}

          {/* 검색 결과 목록 */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-4">
                총 <span className="font-semibold text-blue-600">{totalCount}</span>개 결과 | {currentPage} / {totalPages} 페이지
              </p>
              {results.map((result) => (
                <button
                  key={`${result.iconType}-${result.id}`}
                  className="w-full p-4 hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center gap-4"
                  onClick={() => handleResultClick(result)}
                >
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  {!result.image && (
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      {getIcon(result)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {/* 아이콘 + 타입 + 제목 한 줄 정렬 */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded flex-shrink-0 ${getTypeColor(result)}`}>
                        {getIcon(result)}
                        <span>{result.type}</span>
                      </span>
                      <h4 className="text-sm font-semibold truncate">{result.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 페이징 버튼 */}
        {!isLoading && results.length > 0 && totalPages > 1 && (
          <div className="p-4 border-t flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="flex items-center gap-1"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}