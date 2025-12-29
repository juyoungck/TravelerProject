/**
 * PlannerPage.tsx - 플래너 메인 라우터
 * 플래너 메인/리스트/편집/미리보기 페이지 간 라우팅 관리
 */

import { useState, useEffect } from 'react';
import { PlannerMainPage } from './PlannerMainPage';
import { PlannerListPage } from './PlannerListPage';
import { PlannerEditPage } from './PlannerEditPage';
import { PlannerPreviewPage } from './PlannerPreviewPage';

type PageType = 'main' | 'list' | 'edit' | 'preview';

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
}

interface DayPlan {
  id: string;
  day: number;
  places: Place[];
  memo: string;
}

interface PlannerData {
  id: number;
  title: string;
  author: string;
  region: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  dayPlans: DayPlan[];
}

interface PlannerPageProps {
  selectedPlanner?: any;
  isLoggedIn?: boolean;
  favoritePlanners?: any[];
  onToggleFavoritePlanner?: (planner: any) => void;
}

export function PlannerPage({ 
  selectedPlanner: initialSelectedPlanner,
  isLoggedIn,
  favoritePlanners,
  onToggleFavoritePlanner 
}: PlannerPageProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [selectedPlanner, setSelectedPlanner] = useState<any>(null);
  const [editingPlannerData, setEditingPlannerData] = useState<PlannerData | null>(null);

  // 메인 페이지에서 플래너를 선택하여 들어온 경우 바로 미리보기로 이동
  useEffect(() => {
    if (initialSelectedPlanner) {
      setSelectedPlanner(initialSelectedPlanner);
      setCurrentPage('preview');
    }
  }, [initialSelectedPlanner]);

  if (currentPage === 'edit') {
    return (
      <PlannerEditPage
        onBack={() => {
          setCurrentPage('main');
          setEditingPlannerData(null);
        }}
        initialData={editingPlannerData}
      />
    );
  }

  if (currentPage === 'preview' && selectedPlanner) {
    return (
      <PlannerPreviewPage
        planner={selectedPlanner}
        onBack={() => {
          setSelectedPlanner(null);
          setCurrentPage('main');
        }}
        onEdit={(plannerData) => {
          setEditingPlannerData(plannerData);
          setCurrentPage('edit');
        }}
        isLoggedIn={isLoggedIn}
        favoritePlanners={favoritePlanners}
        onToggleFavoritePlanner={onToggleFavoritePlanner}
      />
    );
  }

  if (currentPage === 'list') {
    return (
      <PlannerListPage
        onSelectPlanner={(planner) => {
          setSelectedPlanner(planner);
          setCurrentPage('preview');
        }}
      />
    );
  }

  return (
    <PlannerMainPage
      onCreatePlanner={() => {
        setEditingPlannerData(null);
        setCurrentPage('edit');
      }}
      onViewMore={() => setCurrentPage('list')}
      onSelectPlanner={(planner) => {
        setSelectedPlanner(planner);
        setCurrentPage('preview');
      }}
    />
  );
}
