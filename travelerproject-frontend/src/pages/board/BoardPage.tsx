/**
 * BoardPage.tsx - 게시판 메인 라우터
 * 게시판 목록/상세/작성/수정 페이지 간 라우팅 관리
 * ★ isEditing 상태 추가 (DetailPage ↔ EditPage 전환)
 * ★ 플래너 미리보기 → App.tsx로 전달
 */

import { useState, useEffect } from 'react';
import { BoardListPage } from './BoardListPage';
import { BoardDetailPage } from './BoardDetailPage';
import { BoardCreatePage } from './BoardCreatePage';
import { BoardEditPage } from './BoardEditPage';

interface BoardPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onOpenSearch?: () => void;
  initialBoardId?: number | null;
  onViewPlanner?: (plnId: number) => void;  // ★ App.tsx에서 전달받음
}

export function BoardPage({ 
  onNavigate, 
  isLoggedIn, 
  currentUserId, 
  onOpenSearch,
  onViewPlanner 
}: BoardPageProps) {
  const [selectedBdId, setSelectedBdId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);  // ★ 편집 모드 상태
  const [refreshKey, setRefreshKey] = useState(0);

  // 초기 게시글 ID가 있으면 해당 게시글로 이동
  useEffect(() => {
    if (initialBoardId) {
      setSelectedBdId(initialBoardId);
    }
  }, [initialBoardId]);

  /** 글 작성 완료 후 */
  const handleCreateComplete = () => {
    setIsCreating(false);
    setRefreshKey(prev => prev + 1);
  };

  /** 글 삭제 후 */
  const handleDeleteComplete = () => {
    setSelectedBdId(null);
    setIsEditing(false);
    setRefreshKey(prev => prev + 1);
  };

  /** ★ 편집 페이지로 이동 */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /** ★ 편집 완료 후 */
  const handleEditComplete = () => {
    setIsEditing(false);
    // 상세 페이지로 돌아감 (selectedBdId 유지)
  };

  /** ★ 편집 취소 */
  const handleEditCancel = () => {
    setIsEditing(false);
  };

  /** ★ 플래너 미리보기 페이지 이동 (새창 X) */
  const handleViewPlanner = (plnId: number) => {
    if (onViewPlanner) {
      onViewPlanner(plnId);
    }
  };

  // 글 작성 페이지
  if (isCreating) {
    return (
      <BoardCreatePage
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreateComplete}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  // ★ 글 수정 페이지
  if (selectedBdId && isEditing) {
    return (
      <BoardEditPage
        bdId={selectedBdId}
        onClose={handleEditCancel}
        onSave={handleEditComplete}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  // 글 상세 페이지
  if (selectedBdId) {
    return (
      <BoardDetailPage
        bdId={selectedBdId}
        onClose={() => setSelectedBdId(null)}
        onDelete={handleDeleteComplete}
        onEdit={handleEdit}  // ★ 편집 페이지로 이동
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        onOpenSearch={onOpenSearch}
        onViewPlanner={handleViewPlanner}  // ★ 플래너 미리보기
      />
    );
  }

  // 목록 페이지
  return (
    <BoardListPage
      key={refreshKey}
      onSelectPost={(bdId) => setSelectedBdId(bdId)}
      onCreatePost={() => setIsCreating(true)}
      isLoggedIn={isLoggedIn}
    />
  );
}