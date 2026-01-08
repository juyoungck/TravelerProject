/**
 * TravelPage.tsx - 여행지 메인 페이지 (리스트 ↔ 상세 라우팅)
 */

import { useState, useEffect } from 'react';
import {TravelListPage} from './TravelListPage';
import {TravelDetailPage} from './TravelDetailPage';

interface TravelPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;  // ← 추가!
  initialDestinationId?: string | null;
  onOpenSearch?: () => void;
}

export function TravelPage({ 
  onNavigate, 
  isLoggedIn, 
  currentUserId,  // ← 추가!
  initialDestinationId, 
  onOpenSearch
}: TravelPageProps) {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(
    initialDestinationId || null
  );

  // initialDestinationId가 변경되면 selectedDestinationId도 업데이트
  useEffect(() => {
    if (initialDestinationId) {
      setSelectedDestinationId(initialDestinationId);
    }
  }, [initialDestinationId]);

  if (selectedDestinationId) {
    return (
      <TravelDetailPage
        destinationId={selectedDestinationId}
        onClose={() => setSelectedDestinationId(null)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}  // ← 추가!
        onOpenSearch={onOpenSearch}
      />
    );
  }

  return (
    <TravelListPage
      onSelectDestination={(id) => setSelectedDestinationId(id)}
      isLoggedIn={isLoggedIn}
      currentUserId={currentUserId}
    />
  );
}

export default TravelPage;