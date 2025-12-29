/**
 * BoardCreatePage.tsx - 게시판 작성 페이지
 * 동행/후기 카테고리 선택 및 글 작성 (후기는 플래너 선택 모달 포함)
 */

import { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/layout/Header';

interface BoardCreatePageProps {
  onClose: () => void;
  onSubmit: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

// Mock 플래너 데이터
const mockMyPlanners = [
  { id: 1, title: '제주도 3박 4일', period: '2024.03.15 - 2024.03.18', thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
  { id: 2, title: '부산 여행', period: '2024.04.01 - 2024.04.03', thumbnail: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400' },
  { id: 3, title: '서울 투어', period: '2024.05.10 - 2024.05.12', thumbnail: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' },
];

const mockFavoritePlanners = [
  { id: 4, title: '강릉 바다 여행', period: '2024.06.01 - 2024.06.02', thumbnail: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400', author: '여행러버' },
  { id: 5, title: '경주 역사 탐방', period: '2024.06.15 - 2024.06.16', thumbnail: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400', author: '역사탐험가' },
];

export function BoardCreatePage({ onClose, onSubmit, onNavigate, isLoggedIn, onOpenSearch }: BoardCreatePageProps) {
  const [category, setCategory] = useState<'동행' | '후기'>('동행');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedPlanner, setSelectedPlanner] = useState<any>(null);

  const handleImageUpload = () => {
    // Mock 이미지 업로드
    alert('이미지 업로드 기능 (실제로는 파일 선택 다이얼로그가 열립니다)');
    setImages([...images, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400']);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    alert('게시글이 작성되었습니다.');
    onSubmit();
  };

  const handlePlannerSelect = (planner: any) => {
    setSelectedPlanner(planner);
    setShowPlannerModal(false);
    setTitle(planner.title);
    setContent(`여행 기간: ${planner.period}\n\n`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 - 네비게이션 포함 */}
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          onOpenSearch={onOpenSearch}
          isLoggedIn={isLoggedIn || false}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <Label>카테고리</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  value="동행"
                  checked={category === '동행'}
                  onChange={(e) => setCategory(e.target.value as '동행')}
                />
                <span>동행</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  value="후기"
                  checked={category === '후기'}
                  onChange={(e) => setCategory(e.target.value as '후기')}
                />
                <span>후기</span>
              </label>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 플래너 선택 (후기인 경우) */}
          {category === '후기' && (
            <div>
              <Label>플래너</Label>
              <div className="mt-2">
                {selectedPlanner ? (
                  <div className="border rounded-lg p-4 flex items-center gap-4">
                    <img
                      src={selectedPlanner.thumbnail}
                      alt={selectedPlanner.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{selectedPlanner.title}</h4>
                      <p className="text-sm text-gray-600">{selectedPlanner.period}</p>
                      {selectedPlanner.author && (
                        <p className="text-xs text-gray-500">작성자: {selectedPlanner.author}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPlanner(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPlannerModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    플래너 추가하기
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 내용 */}
          <div>
            <Label htmlFor="content">내용</Label>
            <textarea
              id="content"
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[300px] px-3 py-2 border rounded-md resize-vertical"
            />
          </div>

          {/* 후기인 경우 별점 선택 */}
          {category === '후기' && (
            <div>
              <Label>별점</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-all"
                  >
                    {star <= (hoverRating || rating) ? '⭐' : '☆'}
                  </button>
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {rating > 0 ? `${rating}/5` : '별점을 선택하세요'}
                </span>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">취소</Button>
            <Button onClick={handleSubmit} className="flex-1">작성완료</Button>
          </div>
        </div>
      </div>

      {/* 플래너 선택 모달 */}
      {showPlannerModal && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">플래너 선택</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPlannerModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 모달 컨텐츠 - 좌우 분할 */}
            <div className="flex flex-1 overflow-hidden">
              {/* 왼쪽: 내 플래너 */}
              <div className="w-1/2 p-6 border-r overflow-y-auto">
                <h4 className="font-semibold mb-4 text-gray-700">내 플래너</h4>
                <div className="space-y-3">
                  {mockMyPlanners.map((planner) => (
                    <button
                      key={planner.id}
                      onClick={() => handlePlannerSelect(planner)}
                      className="w-full border rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center gap-4 text-left"
                    >
                      <img
                        src={planner.thumbnail}
                        alt={planner.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold truncate">{planner.title}</h5>
                        <p className="text-sm text-gray-600">{planner.period}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 오른쪽: 찜한 플래너 */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <h4 className="font-semibold mb-4 text-gray-700">찜한 플래너</h4>
                <div className="space-y-3">
                  {mockFavoritePlanners.map((planner) => (
                    <button
                      key={planner.id}
                      onClick={() => handlePlannerSelect(planner)}
                      className="w-full border rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center gap-4 text-left"
                    >
                      <img
                        src={planner.thumbnail}
                        alt={planner.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold truncate">{planner.title}</h5>
                        <p className="text-sm text-gray-600">{planner.period}</p>
                        <p className="text-xs text-gray-500">작성자: {planner.author}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
