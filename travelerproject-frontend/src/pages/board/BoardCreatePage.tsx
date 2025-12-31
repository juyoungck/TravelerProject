/**
 * BoardCreatePage.tsx - 게시판 작성 페이지
 * 동행/후기 카테고리 선택 및 글 작성 (API 연동)
 * ★ 동행: 플래너 선택 없음 / 후기: 플래너 선택 + 별점
 */

import { useState, useRef } from 'react'; 
import { X, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/layout/Header';
import { createBoard } from '../../api/boardApi';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

interface BoardCreatePageProps {
  onClose: () => void;
  onSubmit: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onOpenSearch?: () => void;
}

interface PlannerItem {
  plnId: number;
  plnTitle: string;
  startDate: string;
  endDate: string;
  authorNickname?: string;
}

export function BoardCreatePage({ 
  onClose, 
  onSubmit, 
  onNavigate, 
  isLoggedIn,
  currentUserId
}: BoardCreatePageProps) {
  const [category, setCategory] = useState<'동행' | '후기'>('동행');
  const [title, setTitle] = useState('');
  const editorRef = useRef<Editor>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedPlanner, setSelectedPlanner] = useState<PlannerItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // TODO: 플래너 API 연동 후 사용
  const [myPlanners] = useState<PlannerItem[]>([]);
  const [favoritePlanners] = useState<PlannerItem[]>([]);

  /** 카테고리 변경 시 플래너 초기화 */
  const handleCategoryChange = (newCategory: '동행' | '후기') => {
    setCategory(newCategory);
    // 동행으로 바꾸면 플래너 초기화
    if (newCategory === '동행') {
      setSelectedPlanner(null);
    }
    // 후기로 바꾸면 별점 초기화
    if (newCategory === '후기') {
      setRating(0);
    }
  };

  /** 별점 클릭 (정수만) */
  const handleRatingClick = (star: number) => {
    setRating(star);
  };

  /** 별점 렌더링 */
  const renderStarSelector = () => {
    const displayRating = hoverRating || rating;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-3xl transition-all"
            style={{ color: star <= displayRating ? '#facc15' : '#d1d5db' }}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? `${rating}/5` : '별점을 선택하세요'}
        </span>
      </div>
    );
  };

    /**
   * 이미지 업로드 훅 (TOAST UI Editor용)
   */
  const handleImageUpload = async (blob: Blob, callback: (url: string, alt: string) => void) => {
    const formData = new FormData();
    formData.append('file', blob);

    try {
      const response = await fetch('http://localhost:8080/api/upload/board', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        callback(data.url, '이미지');
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  /** 게시글 등록 */
  const handleSubmit = async () => {
    if (!currentUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
  const editorInstance = editorRef.current?.getInstance();
  const content = editorInstance?.getHTML() || '';

    if (!content.trim() || content === '<p><br></p>') {
      alert('내용을 입력해주세요.');
      return;
}
    if (category === '후기' && rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const categoryValue = category === '동행' ? 'COMPANION' : 'REVIEW';

      const boardData: {
        mId: number;
        bdCategory: string;
        bdTitle: string;
        bdContent: string;
        plnId?: number;
        bdRating?: number;
      } = {
        mId: currentUserId,
        bdCategory: categoryValue,
        bdTitle: title.trim(),
        bdContent: content,
      };

      // ★ 후기일 때만 플래너 추가
      if (category === '후기' && selectedPlanner?.plnId) {
        boardData.plnId = selectedPlanner.plnId;
      }

      // 후기면 별점 추가
      if (category === '후기') {
        boardData.bdRating = rating;
      }

      console.log('전송 데이터:', boardData);

      const response = await createBoard(boardData);
      
      if (response.status === 'success') {
        alert('게시글이 등록되었습니다.');
        onSubmit();
      } else {
        alert(response.message || '게시글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert('게시글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /** 플래너 선택 */
  const handlePlannerSelect = (planner: PlannerItem) => {
    setSelectedPlanner(planner);
    setShowPlannerModal(false);
  };

  /** 날짜 포맷팅 */
  const formatPeriod = (startDate: string, endDate: string) => {
    return `${startDate} ~ ${endDate}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          isLoggedIn={isLoggedIn || false}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8">게시글 작성</h1>

        <div className="space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <Label>카테고리</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="동행"
                  checked={category === '동행'}
                  onChange={() => handleCategoryChange('동행')}
                  className="w-4 h-4"
                />
                <span>동행</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="후기"
                  checked={category === '후기'}
                  onChange={() => handleCategoryChange('후기')}
                  className="w-4 h-4"
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
              maxLength={100}
            />
          </div>

          {/* ★ 플래너 선택 - 후기일 때만 표시 */}
          {category === '후기' && (
            <div>
              <Label>플래너 (선택사항)</Label>
              <div className="mt-2">
                {selectedPlanner ? (
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedPlanner.plnTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {formatPeriod(selectedPlanner.startDate, selectedPlanner.endDate)}
                      </p>
                      {selectedPlanner.authorNickname && (
                        <p className="text-xs text-gray-500">작성자: {selectedPlanner.authorNickname}</p>
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
            <Label>내용</Label>
              <div className="mt-2 border rounded-md">
                <Editor
                  ref={editorRef}
                  initialValue=""
                  placeholder="내용을 입력하세요"
                  height="400px"
                  initialEditType="wysiwyg"
                  hooks={{
                    addImageBlobHook: handleImageUpload
                  }}
                  toolbarItems={[
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol'],
                    ['image', 'link'],
                  ]}
                />
              </div>
            </div>

          {/* ★ 별점 - 후기일 때만 표시 */}
          {category === '후기' && (
            <div>
              <Label>별점</Label>
              <div className="mt-2">
                {renderStarSelector()}
              </div>
            </div>
          )}

          {/* ★ 버튼 - 둘 다 테두리 있게 */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1"
              disabled={submitting}
            >
              취소
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="outline"
              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
              disabled={submitting}
            >
              {submitting ? '등록 중...' : '작성완료'}
            </Button>
          </div>
        </div>
      </div>

      {/* 플래너 선택 모달 */}
      {showPlannerModal && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
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

            <div className="flex flex-1 overflow-hidden">
              {/* 내 플래너 */}
              <div className="w-1/2 p-6 border-r overflow-y-auto">
                <h4 className="font-semibold mb-4 text-gray-700">내 플래너</h4>
                {myPlanners.length === 0 ? (
                  <p className="text-gray-500 text-sm">플래너가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {myPlanners.map((planner) => (
                      <button
                        key={planner.plnId}
                        onClick={() => handlePlannerSelect(planner)}
                        className="w-full border rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
                      >
                        <h5 className="font-semibold">{planner.plnTitle}</h5>
                        <p className="text-sm text-gray-600">
                          {formatPeriod(planner.startDate, planner.endDate)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 찜한 플래너 */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <h4 className="font-semibold mb-4 text-gray-700">찜한 플래너</h4>
                {favoritePlanners.length === 0 ? (
                  <p className="text-gray-500 text-sm">찜한 플래너가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {favoritePlanners.map((planner) => (
                      <button
                        key={planner.plnId}
                        onClick={() => handlePlannerSelect(planner)}
                        className="w-full border rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
                      >
                        <h5 className="font-semibold">{planner.plnTitle}</h5>
                        <p className="text-sm text-gray-600">
                          {formatPeriod(planner.startDate, planner.endDate)}
                        </p>
                        {planner.authorNickname && (
                          <p className="text-xs text-gray-500">작성자: {planner.authorNickname}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}