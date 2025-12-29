/**
 * TravelPage.tsx - 여행지 메인 페이지 (리스트 ↔ 상세 라우팅)
 */

import { useState } from 'react';
import TravelListPage from './TravelListPage';
import TravelDetailPage from './TravelDetailPage';

interface TravelPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  initialDestinationId?: string | null;
  onOpenSearch?: () => void;
  favoriteDestinations?: any[];
  onToggleFavorite?: (destination: any) => void;
  reviews?: any[];
  onAddReview?: (review: any) => void;
}

export function TravelPage({ 
  onNavigate, 
  isLoggedIn, 
  initialDestinationId, 
  onOpenSearch,
  favoriteDestinations,
  onToggleFavorite,
  reviews,
  onAddReview
}: TravelPageProps) {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(
    initialDestinationId || null
  );

  if (selectedDestinationId) {
    return (
      <TravelDetailPage
        destinationId={selectedDestinationId}
        onClose={() => setSelectedDestinationId(null)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onOpenSearch={onOpenSearch}
        favoriteDestinations={favoriteDestinations}
        onToggleFavorite={onToggleFavorite}
        reviews={reviews}
        onAddReview={onAddReview}
      />
    );
  }

  return (
    <TravelListPage
      onSelectDestination={(id) => setSelectedDestinationId(id)}
      isLoggedIn={isLoggedIn}
      favoriteDestinations={favoriteDestinations}
      onToggleFavorite={onToggleFavorite}
      reviews={reviews}
    />
  );
}

export default TravelPage;