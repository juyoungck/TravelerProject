/**
 * SearchModal.tsx - 통합 검색 모달 (개선 버전)
 * - contenttypeid 기반 타입 구분
 * - title만 검색
 * - 아이콘 + 타입 + 제목 한 줄 정렬
 * - 총 검색 결과 개수 표시
 * - 정확한 페이징
 * 
 * ★ 색상은 contentTypeUtils.ts에서 통합 관리
 * ★ 페이지 이동 시 검색 재실행 방지
 */

import { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Calendar, ChevronLeft, ChevronRight, UtensilsCrossed, Building2, ShoppingBag, Mountain, Landmark } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { getContentTypeStyle, getContentTypeName } from '../../utils/contentTypeUtils';
import api from '../../api/api';

interface SearchResult {
  id: string;
  type: string;
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

  // ★ 마지막 검색어 저장 (페이지 이동 시 검색 재실행 방지)
  const lastSearchQueryRef = useRef('');

  // ★ 검색어 변경 시 디바운스 적용 (검색어가 실제로 변경된 경우에만)
  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery.trim()) {
      setResults([]);
      setCurrentPage(1);
      setTotalCount(0);
      setTotalPages(0);
      lastSearchQueryRef.current = '';
      return;
    }

    // ★ 검색어가 실제로 변경된 경우에만 검색 실행
    if (searchQuery === lastSearchQueryRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      lastSearchQueryRef.current = searchQuery;
      setCurrentPage(1);
      handleSearch(searchQuery, 1, activeTab);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // ★ 탭 변경 시 검색 (별도 useEffect)
  useEffect(() => {
    if (!isOpen) return;
    if (!searchQuery.trim()) return;

    // 탭 변경 시에만 검색 실행
    setCurrentPage(1);
    handleSearch(searchQuery, 1, activeTab);
  }, [activeTab]);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setResults([]);
      setCurrentPage(1);
      setTotalCount(0);
      setTotalPages(0);
      setActiveTab('전체');
      lastSearchQueryRef.current = '';
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
              const contentTypeId = String(item.CONTENTTYPEID || item.contenttypeid || '12');
              const typeName = getContentTypeName(contentTypeId);

              return {
                id: String(item.ID || item.id),
                type: typeName,
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
                type: '플래너',
                iconType: 'planner' as const,
                title: item.TITLE || item.title,
                subtitle: subtitleParts.join(' | ') || '정보 없음',
                // ★ 플래너 대표 이미지 추가
                image: item.THUMBNAIL || item.thumbnail,
              };
            }
          });
        }
      } else if (tab === '여행지') {
        const response = await api.get('/search/destination', {
          params: { keyword: query, page, size: pageSize }
        });
        const result = response.data;

        if (result.status === 'success') {
          totalCnt = result.totalCount || 0;
          totalPgs = result.totalPages || 0;

          items = (result.data || []).map((item: any) => {
            const contentTypeId = String(item.CONTENTTYPEID || item.contenttypeid || '12');
            const typeName = getContentTypeName(contentTypeId);

            return {
              id: String(item.CONTENTID || item.contentid),
              type: typeName,
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
              type: '플래너',
              iconType: 'planner' as const,
              title: item.PLNTITLE || item.plnTitle,
              subtitle: subtitleParts.join(' | ') || '정보 없음',
              // ★ 플래너 대표 이미지 추가
              image: item.THUMBNAIL || item.thumbnail,
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

  // ★ 탭 변경 핸들러 (검색 로직 제거 - useEffect에서 처리)
  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
  };

  // ★ 페이지 변경 핸들러 (검색어 변경 없이 페이지만 변경)
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    handleSearch(searchQuery, newPage, activeTab);
  };

  /** 아이콘 가져오기 (contenttypeid 기반) */
  const getIcon = (result: SearchResult) => {
    if (result.iconType === 'planner') {
      return <Calendar className="h-4 w-4" />;
    }

    switch (result.contenttypeid) {
      case '12': return <Landmark className="h-4 w-4" />;
      case '14': return <Building2 className="h-4 w-4" />;
      case '15': 
      case '25': return <Calendar className="h-4 w-4" />;
      case '28': return <Mountain className="h-4 w-4" />;
      case '32': return <Building2 className="h-4 w-4" />;
      case '38': return <ShoppingBag className="h-4 w-4" />;
      case '39': return <UtensilsCrossed className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  /** 타입별 색상 - contentTypeUtils 사용 */
  const getTypeColor = (result: SearchResult) => {
    if (result.iconType === 'planner') {
      return 'bg-green-100 text-green-600';
    }

    const style = getContentTypeStyle(result.contenttypeid);
    return `${style.bgColor} ${style.textColor}`;
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.iconType === 'place' && onSelectDestination) {
      onSelectDestination(Number(result.id));
    } else if (result.iconType === 'planner' && onSelectPlanner) {
      onSelectPlanner({ id: Number(result.id), title: result.title });
    }
    onClose();
  };

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
          {isLoading && (
            <div className="text-center py-12 text-gray-500">
              검색 중...
            </div>
          )}

          {!isLoading && searchQuery && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}

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
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded flex-shrink-0 ${getTypeColor(result)}`}>
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