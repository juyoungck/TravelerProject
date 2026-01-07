/**
 * BoardEditPage.tsx - 게시판 수정 페이지
 * ★ 제목/내용/별점/플래너 수정 가능
 * ★ 제목 30자 제한
 * ★ TOAST UI Editor 사용 (HTML 태그 + 이미지 유지)
 * ★ 찜한 플래너 썸네일 표시 수정
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, Plus, Pencil, Save, Trash2, MapPin, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Header } from '../../components/layout/Header';
import { getBoardDetail, updateBoard } from '../../api/boardApi';
import { getMyPlannerList, getPlannerDetail } from '../../api/plannerApi';
import favoriteApi from '../../api/favoriteApi';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

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
  const [initialContent, setInitialContent] = useState('');  // ★ 초기 HTML 콘텐츠
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [plnId, setPlnId] = useState<number | null>(null);
  
  // ★ TOAST UI Editor ref
  const editorRef = useRef<Editor>(null);
  
  // 플래너 관련
  const [plannerDetail, setPlannerDetail] = useState<PlannerDetailData | null>(null);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [myPlanners, setMyPlanners] = useState<PlannerItem[]>([]);
  const [loadingPlanners, setLoadingPlanners] = useState(false);
  const [activePlannerTab, setActivePlannerTab] = useState<'my' | 'favorite'>('my');
  const [favoritePlanners, setFavoritePlanners] = useState<PlannerItem[]>([]);

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
        setInitialContent(board.bdContent || '');  // ★ HTML 그대로 저장
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

  /** ★ 찜한 플래너 불러오기 (썸네일 포함) */
  const fetchMyFavoritePlanners = async () => {
    if (!currentUserId) return;

    try {
      const response = await favoriteApi.getMyFavoritePlanners();
      if (response.status === 'success') {
        // ★ 각 플래너의 상세 정보를 가져와서 썸네일 추출
        const plannersWithThumbnail = await Promise.all(
          (response.data || []).map(async (p: any) => {
            try {
              const detail = await getPlannerDetail(p.plnId);
              return {
                plnId: p.plnId,
                plnTitle: p.plnTitle,
                startDate: p.startDate,
                endDate: p.endDate,
                region: detail?.regionName || '전국',
                thumbnailUrl: detail?.dayPlans?.[0]?.places?.[0]?.firstimage || '',
              };
            } catch {
              return {
                plnId: p.plnId,
                plnTitle: p.plnTitle,
                startDate: p.startDate,
                endDate: p.endDate,
                region: '전국',
                thumbnailUrl: '',
              };
            }
          })
        );
        setFavoritePlanners(plannersWithThumbnail);
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
    
    // ★ 선택한 플래너의 상세 정보 가져오기 (썸네일 포함)
    try {
      const detail = await getPlannerDetail(planner.plnId);
      setPlannerDetail({
        plnId: planner.plnId,
        plnTitle: planner.plnTitle,
        startDate: planner.startDate,
        endDate: planner.endDate,
        region: detail?.regionName || planner.region || '전국',
        thumbnailUrl: detail?.dayPlans?.[0]?.places?.[0]?.firstimage || planner.thumbnailUrl || ''
      });
    } catch {
      setPlannerDetail({
        plnId: planner.plnId,
        plnTitle: planner.plnTitle,
        startDate: planner.startDate,
        endDate: planner.endDate,
        region: planner.region || '전국',
        thumbnailUrl: planner.thumbnailUrl || ''
      });
    }
    
    setShowPlannerModal(false);
  };

  /** 플래너 삭제 (연결 해제) */
  const handleRemovePlanner = () => {
    if (!confirm('연결된 플래너를 삭제하시겠습니까?')) return;
    setPlnId(null);
    setPlannerDetail(null);
  };

  /** ★ 이미지 업로드 핸들러 */
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

  /** 게시글 저장 */
  const handleSave = async () => {
    if (!currentUserId) return;
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    // ★ TOAST UI Editor에서 HTML 가져오기
    const editorInstance = editorRef.current?.getInstance();
    const content = editorInstance?.getHTML() || '';
    
    if (!content.trim() || content === '<p><br></p>') {
      alert('내용을 입력해주세요.');
      return;
    }
    if (bdCategory === 'REVIEW' && !rating) {
      alert('별점을 선택해주세요.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await updateBoard(bdId, {
        mId: currentUserId,
        bdTitle: title.trim(),
        bdContent: content,  // ★ HTML 그대로 저장
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
                  <div className="border rounded-lg overflow-hidden max-w-sm">
                    {/* 플래너 썸네일 */}
                    <div className="relative h-28 bg-gray-200">
                      {plannerDetail.thumbnailUrl ? (
                        <img 
                          src={plannerDetail.thumbnailUrl} 
                          alt={plannerDetail.plnTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MapPin className="h-6 w-6" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                        연결된 플래너
                      </span>
                    </div>
                    
                    {/* 플래너 정보 */}
                    <div className="p-2">
                      <h4 className="font-bold text-sm mb-1 line-clamp-1">{plannerDetail.plnTitle}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{plannerDetail.region}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(plannerDetail.startDate, plannerDetail.endDate)}</span>
                        </div>
                      </div>
                      
                      {/* 수정/삭제 버튼 */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          onClick={handleOpenPlannerModal}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 text-xs py-1"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          수정
                        </Button>
                        <Button
                          onClick={handleRemovePlanner}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50 text-xs py-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
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

          {/* ★ 내용 - TOAST UI Editor */}
          <div>
            <Label>내용</Label>
            <div className="mt-2 border rounded-md">
              <Editor
                ref={editorRef}
                initialValue={initialContent}
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
              {loadingPlanners ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  불러오는 중...
                </p>
              ) : (activePlannerTab === 'my' ? myPlanners : favoritePlanners).length === 0 ? (
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
