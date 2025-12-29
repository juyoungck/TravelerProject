/**
 * SearchModal.tsx - 통합 검색 모달
 * 여행지, 플래너, 게시판 등 전체 검색 기능
 */

import { useState } from 'react';
import { X, Search, MapPin, Calendar, Users } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface SearchResult {
  id: number;
  type: '여행지' | '플래너';
  title: string;
  subtitle: string;
  image?: string;
}

// 플래너 전체 데이터 (미리보기에 필요)
const plannerFullData: Record<number, any> = {
  2: {
    id: 2,
    title: '경복궁 근처 맛집 투어',
    author: 'traveler1',
    region: '서울',
    days: 3,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    likes: 324,
  },
  4: {
    id: 4,
    title: 'N서울타워 야경 데이트 코스',
    author: 'traveler2',
    region: '서울',
    days: 2,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    likes: 256,
  },
  6: {
    id: 6,
    title: '부산 해운대 바다 여행',
    author: 'traveler3',
    region: '부산',
    days: 3,
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
    likes: 412,
  },
  8: {
    id: 8,
    title: '제주도 일주 코스',
    author: 'traveler4',
    region: '제주',
    days: 5,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    likes: 589,
  },
  10: {
    id: 10,
    title: '경주 역사 탐방',
    author: 'traveler5',
    region: '경주',
    days: 3,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    likes: 187,
  },
  12: {
    id: 12,
    title: '강릉 바다 여행',
    author: 'traveler6',
    region: '강릉',
    days: 3,
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
    likes: 298,
  },
  14: {
    id: 14,
    title: '전주 한옥마을 투어',
    author: 'traveler7',
    region: '전주',
    days: 2,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    likes: 345,
  },
  16: {
    id: 16,
    title: '여수 낭만 포차 투어',
    author: 'traveler8',
    region: '여수',
    days: 3,
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
    likes: 423,
  },
};

// Mock 검색 데이터
const mockSearchData: SearchResult[] = [
  {
    id: 1,
    type: '여행지',
    title: '경복궁',
    subtitle: '서울 종로구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100',
  },
  {
    id: 2,
    type: '플래너',
    title: '경복궁 근처 맛집 투어',
    subtitle: '2박 3일 서울 여행',
  },
  {
    id: 3,
    type: '여행지',
    title: 'N서울타워',
    subtitle: '서울 용산구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100',
  },
  {
    id: 4,
    type: '플래너',
    title: 'N서울타워 야경 데이트 코스',
    subtitle: '1박 2일 서울 여행',
  },
  {
    id: 5,
    type: '여행지',
    title: '해운대 해수욕장',
    subtitle: '부산 해운대구',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=100',
  },
  {
    id: 6,
    type: '플래너',
    title: '부산 해운대 바다 여행',
    subtitle: '2박 3일 부산 여행',
  },
  {
    id: 7,
    type: '여행지',
    title: '성산일출봉',
    subtitle: '제주 서귀포시',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100',
  },
  {
    id: 8,
    type: '플래너',
    title: '제주도 일주 코스',
    subtitle: '4박 5일 제주 여행',
  },
  {
    id: 9,
    type: '여행지',
    title: '불국사',
    subtitle: '경주 경상북도',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100',
  },
  {
    id: 10,
    type: '플래너',
    title: '경주 역사 탐방',
    subtitle: '2박 3일 경주 여행',
  },
  {
    id: 11,
    type: '여행지',
    title: '정동진 해변',
    subtitle: '강원 강릉시',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=100',
  },
  {
    id: 12,
    type: '플래너',
    title: '강릉 바다 여행',
    subtitle: '2박 3일 강릉 여행',
  },
  {
    id: 13,
    type: '여행지',
    title: '전주 한옥마을',
    subtitle: '전북 전주시',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100',
  },
  {
    id: 14,
    type: '플래너',
    title: '전주 한옥마을 투어',
    subtitle: '1박 2일 전주 여행',
  },
  {
    id: 15,
    type: '여행지',
    title: '여수 오동도',
    subtitle: '전남 여수시',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=100',
  },
  {
    id: 16,
    type: '플래너',
    title: '여수 낭만 포차 투어',
    subtitle: '2박 3일 여수 여행',
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination?: (id: number) => void;
  onSelectPlanner?: (planner: any) => void;
}

export function SearchModal({ isOpen, onClose, onSelectDestination, onSelectPlanner }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  if (!isOpen) return null;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    // 검색어로 필터링
    const filtered = mockSearchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(filtered);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3>통합 검색</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="여행지, 플래너를 검색하세요... (예: 경복궁)"
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchQuery && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-4">
                총 {results.length}개의 결과
              </p>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="w-full p-4 hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center gap-4"
                  onClick={() => {
                    if (result.type === '여행지' && onSelectDestination) {
                      onSelectDestination(result.id);
                    } else if (result.type === '플래너' && onSelectPlanner) {
                      // 플래너 전체 데이터 전달
                      const fullPlannerData = plannerFullData[result.id];
                      if (fullPlannerData) {
                        onSelectPlanner(fullPlannerData);
                      }
                    }
                    onClose();
                  }}
                >
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
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
      </div>
    </div>
  );
}
