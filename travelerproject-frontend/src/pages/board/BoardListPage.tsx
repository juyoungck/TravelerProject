/**
 * BoardListPage.tsx - 게시판 목록 페이지
 * 카테고리별 게시글 필터링 및 목록 표시 (API 연동)
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getBoardList } from '../../api/boardApi';

export interface BoardPost {
  id: number;
  category: '동행' | '후기';
  title: string;
  author: string;
  date: string;
  views: number;
  comments: number;
  rating?: number;
  recruitStatus?: string;
}

interface BoardListPageProps {
  onSelectPost: (bdId: number) => void;
  onCreatePost: () => void;
  isLoggedIn?: boolean;
}

export function BoardListPage({ onSelectPost, onCreatePost, isLoggedIn }: BoardListPageProps) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'전체' | '동행' | '후기'>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /** ★ 카테고리 한글 → 영문 변환 (API 전송용) */
  const getCategoryValue = (cat: '전체' | '동행' | '후기'): string => {
    switch (cat) {
      case '동행': return 'COMPANION';
      case '후기': return 'REVIEW';
      default: return 'ALL';
    }
  };

  /** 카테고리 영문 → 한글 변환 (화면 표시용) */
  const getCategoryLabel = (cat: string): '동행' | '후기' => {
    return cat === 'COMPANION' ? '동행' : '후기';
  };

  /** 모집상태 영문 → 한글 변환 */
  const getRecruitLabel = (status: string | null): string => {
    switch (status) {
      case 'RECRUITING': return '모집중';
      case 'CLOSED': return '모집완료';
      default: return '';
    }
  };

  /** 날짜 포맷 */
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  /** 게시글 목록 조회 (API) */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const categoryValue = getCategoryValue(selectedCategory);
      const response = await getBoardList(categoryValue, searchQuery, currentPage, 10);
      
      if (response.status === 'success') {
        const convertedPosts: BoardPost[] = (response.data || []).map((item: any) => ({
          id: item.bdId,
          category: getCategoryLabel(item.bdCategory),
          title: item.bdTitle,
          author: item.authorNickname || '알 수 없음',
          date: formatDate(item.createdAt),
          views: item.bdViewCount || 0,
          comments: item.commentCount || 0,
          rating: item.bdRating,
          recruitStatus: item.recruitStatus
        }));
        
        setPosts(convertedPosts);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery, currentPage]);

  /** 검색 실행 */
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  /** 엔터키 검색 */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /** 카테고리 변경 */
  const handleCategoryChange = (category: '전체' | '동행' | '후기') => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">게시판</h1>

      {/* 카테고리 탭과 글 작성 버튼 */}
      <div className="flex items-center justify-between mb-6 border-b">
        <div className="flex gap-4">
          {(['전체', '동행', '후기'] as const).map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
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
        
        <Button 
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
          onClick={() => {
            if (!isLoggedIn) {
              alert('로그인이 필요한 서비스입니다.');
              return;
            }
            onCreatePost();
          }}
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
          {loading ? (
            <div className="text-center py-10 text-gray-500">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">게시글이 없습니다.</div>
          ) : (
            posts.map((post) => (
              <button
                key={post.id}
                onClick={() => onSelectPost(post.id)}
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
                  
                  {post.category === '동행' && post.recruitStatus && (
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded mr-2 ${
                        post.recruitStatus === 'RECRUITING'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {getRecruitLabel(post.recruitStatus)}
                    </span>
                  )}
                  
                  <span className="hover:text-blue-600">{post.title}</span>
                  
                  {post.comments > 0 && (
                    <span className="text-blue-600 text-sm ml-2">({post.comments})</span>
                  )}
                  
                  {post.rating !== undefined && post.rating !== null && (
                    <span className="text-yellow-500 text-sm ml-2">★ {post.rating}</span>
                  )}
                </div>
                <div className="col-span-2 text-center text-gray-600">{post.author}</div>
                <div className="col-span-2 text-center text-gray-600 text-sm">{post.date}</div>
                <div className="col-span-1 text-center text-gray-600">{post.views}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            이전
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </Button>
        </div>
      )}

      {/* 검색 */}
      <div className="flex justify-center">
        <div className="flex gap-2 w-96">
          <Input
            type="search"
            placeholder="제목 또는 작성자 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}