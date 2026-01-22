/**
 * BoardCreatePage.tsx - 게시판 작성 페이지
 * 동행/후기 카테고리 선택 및 글 작성 (API 연동)
 * ★ 동행: 플래너 선택 없음 / 후기: 플래너 선택 + 별점
 * ★ 제목 30자 제한
 */

import { useState, useRef, useEffect } from 'react'; 
import { X, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/layout/Header';
import { createBoard } from '../../api/boardApi';
import { Editor } from '@toast-ui/react-editor';
import { getMyPlannerList } from '../../api/plannerApi';
import '@toast-ui/editor/dist/toastui-editor.css';
import favoriteApi from '../../api/favoriteApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + ":8080/api";


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
  const [activePlannerTab, setActivePlannerTab] = useState<'my' | 'favorite'>('my');
  const [submitting, setSubmitting] = useState(false);

  const [myPlanners, setMyPlanners] = useState<PlannerItem[]>([]);
  const [_loadingPlanners, setLoadingPlanners] = useState(false);
  const [favoritePlanners, setFavoritePlanners] = useState<PlannerItem[]>([]);
   
  const handleOpenPlannerModal = () => {
    if (!currentUserId) return;

    fetchMyPublicPlanners();
    fetchMyFavoritePlanners();
    setActivePlannerTab('my');
    setShowPlannerModal(true);
  };
  /** 후기 카테고리 선택 시 공개 플래너 불러오기 */
      useEffect(() => {
    if (showPlannerModal && activePlannerTab === 'favorite') {
      fetchMyFavoritePlanners();
    }
  }, [showPlannerModal, activePlannerTab]);

  const fetchMyFavoritePlanners = async () => {
    try {
      const response = await favoriteApi.getMyFavoritePlanners();
      if (response.status === 'success') {
         setFavoritePlanners(response.data || []);
      }
    } catch (e) {
      console.error('찜한 플래너 조회 실패', e);
    }
  };
  
  const fetchMyPublicPlanners = async () => {
    setLoadingPlanners(true);
    try {
      const response = await getMyPlannerList(currentUserId!, 1, 100);
      const publicPlanners = response.planners.filter((p: any) => p.isPublic === 1);
      setMyPlanners(publicPlanners.map((p: any) => ({
        plnId: p.plnId,
        plnTitle: p.plnTitle,
        startDate: p.startDate,
        endDate: p.endDate,
      })));
    } catch (error) {
      console.error('플래너 목록 조회 실패:', error);
    } finally {
      setLoadingPlanners(false);
    }
  };

  /** 카테고리 변경 시 플래너 초기화 */
  const handleCategoryChange = (newCategory: '동행' | '후기') => {
    setCategory(newCategory);
    if (newCategory === '동행') {
      setSelectedPlanner(null);
    }
    if (newCategory === '후기') {
      setRating(0);
    }
  };

  /** 별점 클릭 */
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

  /** 이미지 업로드 */
  const handleImageUpload = async (blob: Blob, callback: (url: string, alt: string) => void) => {
    const formData = new FormData();
    formData.append('file', blob);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/board`, {
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

      if (category === '후기' && selectedPlanner?.plnId) {
        boardData.plnId = selectedPlanner.plnId;
      }
      if (category === '후기') {
        boardData.bdRating = rating;
      }

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
  const formatDate = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '-';
    const sd = new Date(startDate).toLocaleDateString('ko-KR');
    const ed = new Date(endDate).toLocaleDateString('ko-KR');
    return `${sd} ~ ${ed}`;
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

          {/* ★ 제목 - 30자 제한 */}
          <div>
            <Label htmlFor="title">제목 (최대 30자)</Label>
            <Input
              id="title"
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/30</p>
          </div>

          {/* 플래너 선택 - 후기일 때만 */}
          {category === '후기' && (
            <div>
              <Label>플래너 (선택사항)</Label>
              <div className="mt-2">
                {selectedPlanner ? (
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedPlanner.plnTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedPlanner.startDate, selectedPlanner.endDate)}
                      </p>
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
                    onClick={handleOpenPlannerModal}
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
                hooks={{ addImageBlobHook: handleImageUpload }}
                toolbarItems={[
                  ['heading', 'bold', 'italic', 'strike'],
                  ['hr', 'quote'],
                  ['ul', 'ol'],
                  ['image', 'link'],
                ]}
              />
            </div>
          </div>

          {/* 별점 - 후기일 때만 */}
          {category === '후기' && (
            <div>
              <Label>별점</Label>
              <div className="mt-2">{renderStarSelector()}</div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={submitting}>
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

{/* 플래너 선택 패널 */}
{showPlannerModal && (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    onClick={() => setShowPlannerModal(false)}  
  >
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-xl w-[600px]"
      onClick={(e) => e.stopPropagation()}     
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">플래너 선택</h2>
        <button onClick={() => setShowPlannerModal(false)}>✕</button>
      </div>

      {/* 탭 */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 ${
            activePlannerTab === 'my'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActivePlannerTab('my')}
        >
          내 플래너
        </button>
        <button
          className={`flex-1 py-3 ${
            activePlannerTab === 'favorite'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActivePlannerTab('favorite')}
        >
          찜한 플래너
        </button>
      </div>

      {/* 리스트 */}
      <div className="p-4 max-h-[320px] overflow-y-auto space-y-3">
        {(activePlannerTab === 'my' ? myPlanners : favoritePlanners).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            플래너가 없습니다.
          </p>
        ) : (
          (activePlannerTab === 'my' ? myPlanners : favoritePlanners).map(planner => (
            <div
              key={planner.plnId}
              onClick={() => handlePlannerSelect(planner)}
              className="rounded-xl border border-gray-200 p-4 cursor-pointer
                         hover:border-blue-500 hover:bg-blue-50"
            >
              <p className="font-medium">{planner.plnTitle}</p>
              <p className="text-sm text-gray-500">
                {formatDate(planner.startDate, planner.endDate)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
}