/**
 * SearchModal.tsx - 통합 검색 모달
 * 탭: 전체 / 여행지 / 플래너
 * 페이징: 이전/다음 버튼
 */

import { useState, useEffect } from 'react';
import { X, Search, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { searchDestinations, searchPlanners } from '../../api/searchApi';

interface SearchResult {
  id: string;
  type: '여행지' | '플래너';
  title: string;
  subtitle: string;
  image?: string;
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
  const [activeTab, setActiveTab] = useState<SearchTab>('전체');
  const pageSize = 10;

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery.trim()) {
      setResults([]);
      setCurrentPage(1);
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
      setActiveTab('전체');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (query: string, page: number, tab: SearchTab) => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      let destinationItems: SearchResult[] = [];
      let plannerItems: SearchResult[] = [];

      // 탭에 따라 검색
      if (tab === '전체' || tab === '여행지') {
        const destinationResults = await searchDestinations(query, page, pageSize);
        destinationItems = (destinationResults || []).map((item: any) => ({
          id: item.CONTENTID || item.contentid,
          type: '여행지' as const,
          title: item.TITLE || item.title,
          subtitle: item.REGIONNAME || item.regionName || item.ADDR1 || item.addr1 || '',
          image: item.FIRSTIMAGE2 || item.firstimage2,
        }));
      }

      if (tab === '전체' || tab === '플래너') {
        try {
          const plannerResults = await searchPlanners(query, page, pageSize);
          plannerItems = (plannerResults || []).map((item: any) => ({
            id: String(item.PLNID || item.plnId),
            type: '플래너' as const,
            title: item.PLNTITLE || item.plnTitle,
            subtitle: item.REGIONNAME || item.regionName || '',
          }));
        } catch (err) {
          console.log('플래너 검색 결과 없음');
        }
      }

      // 탭에 따라 결과 설정
      if (tab === '전체') {
        // 전체: 첫 페이지만 플래너 포함
        if (page === 1) {
          setResults([...destinationItems, ...plannerItems.slice(0, 5)]);
        } else {
          setResults(destinationItems);
        }
      } else if (tab === '여행지') {
        setResults(destinationItems);
      } else {
        setResults(plannerItems);
      }
      
    } catch (error) {
      console.error('검색 실패:', error);
      setResults([]);
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
    setCurrentPage(newPage);
    handleSearch(searchQuery, newPage, activeTab);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case '여행지':
        return <MapPin className="h-4 w-4" />;
      case '플래너':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '여행지':
        return 'bg-blue-100 text-blue-600';
      case '플래너':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === '여행지' && onSelectDestination) {
      onSelectDestination(Number(result.id));
    } else if (result.type === '플래너' && onSelectPlanner) {
      onSelectPlanner({ id: Number(result.id), title: result.title });
    }
    onClose();
  };

  // 다음 페이지 있는지 확인
  const currentTypeResults = activeTab === '전체' 
    ? results.filter(r => r.type === '여행지').length 
    : results.length;
  const hasNextPage = currentTypeResults >= pageSize;
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
                {currentPage} 페이지 | {results.length}개 결과
              </p>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
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
                      {result.type === '여행지' ? (
                        <MapPin className="h-6 w-6 text-gray-400" />
                      ) : (
                        <Calendar className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${getTypeColor(result.type)}`}>
                        {getIcon(result.type)}
                        {result.type}
                      </span>
                      <h4 className="text-sm font-semibold">{result.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{result.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 페이징 버튼 */}
        {!isLoading && results.length > 0 && (hasPrevPage || hasNextPage) && (
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
              {currentPage} 페이지
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