/**
 * BoardListPage.tsx - 게시판 목록 페이지
 * 카테고리별 게시글 필터링 및 목록 표시
 */

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export interface BoardPost {
  id: number;
  category: '동행' | '후기';
  title: string;
  author: string;
  date: string;
  views: number;
  comments: number;
  rating?: number;
}

const mockPosts: BoardPost[] = [
  {
    id: 1,
    category: '동행',
    title: '독도 탐험',
    author: '승진',
    date: '2025/12/18',
    views: 2,
    comments: 3,
  },
  {
    id: 2,
    category: '후기',
    title: '제주도 3박 4일 여행 후기',
    author: '민수',
    date: '2025/12/17',
    views: 45,
    comments: 5,
    rating: 4.5,
  },
  {
    id: 3,
    category: '동행',
    title: '부산 감천문화마을 같이 가실 분',
    author: '지영',
    date: '2025/12/16',
    views: 23,
    comments: 7,
  },
  {
    id: 4,
    category: '후기',
    title: '경주 불국사 정말 좋았어요!',
    author: '태희',
    date: '2025/12/15',
    views: 67,
    comments: 12,
    rating: 5,
  },
  {
    id: 5,
    category: '동행',
    title: '강원도 스키장 동행 구합니다',
    author: '현우',
    date: '2025/12/14',
    views: 34,
    comments: 8,
  },
];

interface BoardListPageProps {
  onSelectPost: (post: BoardPost) => void;
  onCreatePost: () => void;
  isLoggedIn?: boolean;
}

export function BoardListPage({ onSelectPost, onCreatePost, isLoggedIn }: BoardListPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<'전체' | '동행' | '후기'>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = mockPosts.filter((post) => {
    const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
    const matchesSearch = 
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">게시판</h1>

      {/* 카테고리 탭과 글 작성 버튼 */}
      <div className="flex items-center justify-between mb-6 border-b">
        <div className="flex gap-4">
          {(['전체', '동행', '후기'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 transition-colors ${
                selectedCategory === category
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* 글 작성 버튼 - 항상 표시, 로그인 여부에 따라 동작 제어 */}
        <Button 
          onClick={() => {
            if (!isLoggedIn) {
              alert('로그인이 필요한 서비스입니다.');
              return;
            }
            onCreatePost();
          }}
          className="mb-[-1px]"
        >
          글 작성
        </Button>
      </div>

      {/* 게시글 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-sm font-semibold text-gray-700">
          <div className="col-span-1 text-center">No</div>
          <div className="col-span-6">제목</div>
          <div className="col-span-2 text-center">작성자</div>
          <div className="col-span-2 text-center">작성일</div>
          <div className="col-span-1 text-center">조회</div>
        </div>

        {/* 게시글 목록 */}
        <div>
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="w-full grid grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-gray-50 transition-colors text-left"
            >
              <div className="col-span-1 text-center text-gray-600">{post.id}</div>
              <div className="col-span-6">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded mr-2 ${
                    post.category === '동행'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  [{post.category}]
                </span>
                <span className="hover:text-blue-600">{post.title}</span>
                {post.comments > 0 && (
                  <span className="text-blue-600 text-sm ml-2">({post.comments})</span>
                )}
                {post.rating !== undefined && (
                  <span className="text-yellow-500 text-sm ml-2">★ {post.rating}</span>
                )}
              </div>
              <div className="col-span-2 text-center text-gray-600">{post.author}</div>
              <div className="col-span-2 text-center text-gray-600 text-sm">{post.date}</div>
              <div className="col-span-1 text-center text-gray-600">{post.views}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <div className="flex justify-center">
        <div className="flex gap-2 w-96">
          <Input
            type="search"
            placeholder="제목 또는 작성자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
