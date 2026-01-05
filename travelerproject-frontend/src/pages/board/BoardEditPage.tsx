/**
 * BoardEditPage.tsx - 게시판 수정 페이지
 * ★ 제목/내용/별점/플래너 수정 가능
 * ★ 제목 30자 제한
 * ★ HTML 태그 제거 후 편집
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, X, Plus, Pencil, Save, Trash2, MapPin, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/layout/Header';
import { getBoardDetail, updateBoard } from '../../api/boardApi';
import { getMyPlannerList, getPlannerDetail } from '../../api/plannerApi';
import favoriteApi from '../../api/favoriteApi';

interface PlannerItem {
  plnId: number;
  plnTitle: string;
  startDate: string;
  endDate: string;
  region?: string;
  thumbnailUrl?: string;
}

interface PlannerDetailData {
  plnId: number;
  plnTitle: string;
  startDate: string;
  endDate: string;
  region: string;
  thumbnailUrl: string;
}

interface BoardEditPageProps {
  bdId: number;
  onClose: () => void;
  onSave: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onOpenSearch?: () => void;
}

export function BoardEditPage({
  bdId,
  onClose,
  onSave,
  onNavigate,
  isLoggedIn,
  currentUserId,
  onOpenSearch
}: BoardEditPageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 게시글 데이터
  const [bdCategory, setBdCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [plnId, setPlnId] = useState<number | null>(null);
  
  // 플래너 관련
  const [plannerDetail, setPlannerDetail] = useState<PlannerDetailData | null>(null);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [myPlanners, setMyPlanners] = useState<PlannerItem[]>([]);
  const [loadingPlanners, setLoadingPlanners] = useState(false);
  const [activePlannerTab, setActivePlannerTab] = useState<'my' | 'favorite'>('my');
  const [favoritePlanners, setFavoritePlanners] = useState<PlannerItem[]>([]);

  /** HTML 태그 제거 함수 */
  const stripHtml = (html: string): string => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  /** 날짜 포맷팅 (플래너용) */
  const formatDate = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '-';
    const sd = new Date(startDate).toLocaleDateString('ko-KR');
    const ed = new Date(endDate).toLocaleDateString('ko-KR');
    return `${sd} ~ ${ed}`;
  };

  /** 게시글 상세 조회 */
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await getBoardDetail(bdId);
      if (response.status === 'success') {
        const board = response.data.board;
        setBdCategory(board.bdCategory);
        setTitle(board.bdTitle);
        setContent(stripHtml(board.bdContent));  // ★ HTML 태그 제거
        setRating(board.bdRating);
        setPlnId(board.plnId);
        
        // 플래너 상세 정보 불러오기
        if (board.plnId) {
          fetchPlannerDetailInfo(board.plnId);
        }
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러오는데 실패했습니다.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /** 플래너 상세 정보 조회 */
  const fetchPlannerDetailInfo = async (id: number) => {
    try {
      const response = await getPlannerDetail(id);
      if (response) {
        setPlannerDetail({
          plnId: response.plnId,
          plnTitle: response.plnTitle,
          startDate: response.startDate,
          endDate: response.endDate,
          region: response.regionName || '전국',
          thumbnailUrl: response.dayPlans?.[0]?.places?.[0]?.firstimage || ''
        });
      }
    } catch (error) {
      console.error('플래너 상세 조회 실패:', error);
    }
  };

  /** 내 공개 플래너 불러오기 */
  const fetchMyPublicPlanners = async () => {
    if (!currentUserId) return;
    
    setLoadingPlanners(true);
    try {
      const response = await getMyPlannerList(currentUserId, 1, 100);
      const publicPlanners = response.planners.filter((p: any) => p.isPublic === 1);
      setMyPlanners(publicPlanners.map((p: any) => ({
        plnId: p.plnId,
        plnTitle: p.plnTitle,
        startDate: p.startDate,
        endDate: p.endDate,
        region: p.regionName || '전국',
        thumbnailUrl: p.thumbnailImage || '',
      })));
    } catch (error) {
      console.error('플래너 목록 조회 실패:', error);
    } finally {
      setLoadingPlanners(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [bdId]);

  /** 찜한 플래너 불러오기 */
  const fetchMyFavoritePlanners = async () => {
    if (!currentUserId) return;

    try {
      const response = await favoriteApi.getMyFavoritePlanners();
      if (response.status === 'success') {
        setFavoritePlanners(
          response.data.map((p: any) => ({
            plnId: p.plnId,
            plnTitle: p.plnTitle,
            startDate: p.startDate,
            endDate: p.endDate,
            region: p.regionName || '전국',
            thumbnailUrl: p.thumbnailImage || '',
          }))
        );
      }
    } catch (e) {
      console.error('찜한 플래너 조회 실패', e);
    }
  };

  /** 플래너 수정 모달 열기 */
  const handleOpenPlannerModal = () => {
    if (!currentUserId) return;

    fetchMyPublicPlanners();
    fetchMyFavoritePlanners(); 
    setActivePlannerTab('my');
    setShowPlannerModal(true);
  };

  /** 플래너 선택 */
  const handlePlannerSelect = async (planner: PlannerItem) => {
    setPlnId(planner.plnId);
    setPlannerDetail({
      plnId: planner.plnId,
      plnTitle: planner.plnTitle,
      startDate: planner.startDate,
      endDate: planner.endDate,
      region: planner.region || '전국',
      thumbnailUrl: planner.thumbnailUrl || ''
    });
    setShowPlannerModal(false);
  };

  /** 플래너 삭제 (연결 해제) */
  const handleRemovePlanner = () => {
    if (!confirm('연결된 플래너를 삭제하시겠습니까?')) return;
    setPlnId(null);
    setPlannerDetail(null);
  };

  /** 게시글 저장 */
  const handleSave = async () => {
    if (!currentUserId) return;
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    if (bdCategory === 'REVIEW' && !rating) {
      alert('별점을 선택해주세요.');
      return;
    }
    
    setSaving(true);
    try {
      // ★ 순수 텍스트를 <p> 태그로 감싸서 저장
      const htmlContent = `<p>${content.trim().replace(/\n/g, '</p><p>')}</p>`;
      
      const response = await updateBoard(bdId, {
        mId: currentUserId,
        bdTitle: title.trim(),
        bdContent: htmlContent,
        plnId: plnId || undefined,
        bdRating: rating || undefined
      });
      
      if (response.status === 'success') {
        alert('게시글이 수정되었습니다.');
        onSave();
      }
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  /** 별점 렌더링 */
  const renderStarSelector = () => {
    const displayRating = hoverRating || rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-3xl transition-all"
            style={{ color: star <= displayRating ? '#facc15' : '#d1d5db' }}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">{rating || 0}/5</span>
      </div>
    );
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          onOpenSearch={onOpenSearch}
          isLoggedIn={isLoggedIn || false}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          취소
        </Button>

        <h1 className="text-2xl font-bold mb-8">게시글 수정</h1>

        <div className="space-y-6">
          {/* 카테고리 (읽기 전용) */}
          <div>
            <Label>카테고리</Label>
            <p className="mt-2 text-gray-700">
              {bdCategory === 'COMPANION' ? '동행' : '후기'}
            </p>
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

          {/* ★ 플래너 - 후기일 때만 */}
          {bdCategory === 'REVIEW' && (
            <div>
              <Label>플래너</Label>
              <div className="mt-2">
                {plannerDetail ? (
                  <div className="border rounded-lg overflow-hidden">
                    {/* 플래너 썸네일 */}
                    <div className="relative h-48 bg-gray-200">
                      {plannerDetail.thumbnailUrl ? (
                        <img 
                          src={plannerDetail.thumbnailUrl} 
                          alt={plannerDetail.plnTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MapPin className="h-12 w-12" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        내 플래너
                      </span>
                    </div>
                    
                    {/* 플래너 정보 */}
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2">{plannerDetail.plnTitle}</h4>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>{plannerDetail.region}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(plannerDetail.startDate, plannerDetail.endDate)}</span>
                      </div>
                      
                      {/* 수정/삭제 버튼 */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button
                          onClick={handleOpenPlannerModal}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          onClick={handleRemovePlanner}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleOpenPlannerModal}
                    variant="outline"
                    className="w-full text-blue-600 border-blue-300 hover:bg-blue-50 border-dashed"
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 mt-2 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="내용을 입력하세요"
            />
          </div>

          {/* ★ 별점 - 후기일 때만 */}
          {bdCategory === 'REVIEW' && (
            <div>
              <Label>별점</Label>
              <div className="mt-2">{renderStarSelector()}</div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={saving}>
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              variant="outline"
              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? '저장 중...' : '저장하기'}
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
