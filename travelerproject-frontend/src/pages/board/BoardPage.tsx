/**
 * BoardPage.tsx - 게시판 메인 라우터
 * 게시판 목록/상세/작성 페이지 간 라우팅 관리
 */

import { useState } from 'react';
import { BoardListPage } from './BoardListPage';
import { BoardDetailPage } from './BoardDetailPage';
import { BoardCreatePage } from './BoardCreatePage';

interface BoardPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onOpenSearch?: () => void;
}

export function BoardPage({ onNavigate, isLoggedIn, currentUserId, onOpenSearch }: BoardPageProps) {
  const [selectedBdId, setSelectedBdId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /** 글 작성 완료 후 */
  const handleCreateComplete = () => {
    setIsCreating(false);
    setRefreshKey(prev => prev + 1);
  };

  /** 글 삭제 후 */
  const handleDeleteComplete = () => {
    setSelectedBdId(null);
    setRefreshKey(prev => prev + 1);
  };

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

  if (selectedBdId) {
    return (
      <BoardDetailPage
        bdId={selectedBdId}
        onClose={() => setSelectedBdId(null)}
        onDelete={handleDeleteComplete}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  return (
    <BoardListPage
      key={refreshKey}
      onSelectPost={(bdId) => setSelectedBdId(bdId)}
      onCreatePost={() => setIsCreating(true)}
      isLoggedIn={isLoggedIn}
    />
  );
}