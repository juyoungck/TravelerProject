/**
 * BoardPage.tsx - 게시판 메인 라우터
 * 게시판 목록/상세/작성 페이지 간 라우팅 관리
 */

import { useState, useEffect } from 'react';
import { BoardListPage, type BoardPost } from './BoardListPage';
import { BoardDetailPage } from './BoardDetailPage';
import { BoardCreatePage } from './BoardCreatePage';

interface BoardPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

export function BoardPage({ onNavigate, isLoggedIn, onOpenSearch }: BoardPageProps) {
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return (
      <BoardCreatePage
        onClose={() => setIsCreating(false)}
        onSubmit={() => setIsCreating(false)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  if (selectedPost) {
    return (
      <BoardDetailPage
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  return (
    <BoardListPage
      onSelectPost={(post) => setSelectedPost(post)}
      onCreatePost={() => setIsCreating(true)}
      isLoggedIn={isLoggedIn}
    />
  );
}
