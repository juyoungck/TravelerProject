import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { FeaturedCarousel } from "./components/home/FeaturedCarousel";
import { PopularPlanners } from "./components/home/PopularPlanners";
import { SearchModal } from "./components/modals/SearchModal";
import { TravelPage } from "./pages/travel/TravelPage";
import { PlannerPage } from "./pages/planner/PlannerPage";
import { EventPage } from "./pages/event/EventPage";
import { MapPage } from "./pages/MapPage";
import { BoardPage } from "./pages/board/BoardPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { MyPage } from "./pages/auth/MyPage";
import { FindIdPage } from "./pages/auth/FindIdPage";
import { FindPasswordPage } from "./pages/auth/FindPasswordPage";
import { SharedPlannerPage } from "./pages/planner/SharedPlannerPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [selectedPlanner, setSelectedPlanner] = useState<any>(null);
  const [favoriteDestinations, setFavoriteDestinations] = useState<any[]>([]);
  const [favoritePlanners, setFavoritePlanners] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // 공유 링크 상태
  const [shareLink, setShareLink] = useState<string | null>(null);

  /**
   * URL 경로 파싱 - 공유 링크 감지
   */
  useEffect(() => {
    const checkShareLink = () => {
      const path = window.location.pathname;
      const shareMatch = path.match(/^\/planner\/share\/([a-zA-Z0-9]+)$/);
      
      if (shareMatch) {
        setShareLink(shareMatch[1]);
        setCurrentPage("shared-planner");
      }
    };

    // 초기 로드 시 확인
    checkShareLink();

    // popstate 이벤트 (브라우저 뒤로가기/앞으로가기)
    window.addEventListener('popstate', checkShareLink);
    
    return () => {
      window.removeEventListener('popstate', checkShareLink);
    };
  }, []);

  /**
   * ★ URL 파라미터 파싱 - 새 탭에서 열릴 때 처리
   * 예: http://localhost:5173/?page=travel-detail&contentid=126508
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const contentid = urlParams.get('contentid');

    console.log('URL 파라미터:', { page, contentid }); // 디버깅용

    // 여행지 상세 페이지로 이동
    if (page === 'travel-detail' && contentid) {
      setSelectedDestinationId(contentid);
      setCurrentPage('travel');
    }
    // 다른 페이지들
    else if (page === 'travel') {
      setCurrentPage('travel');
    }
    else if (page === 'planner') {
      setCurrentPage('planner');
    }
    else if (page === 'map') {
      setCurrentPage('map');
    }
    else if (page === 'event') {
      setCurrentPage('event');
    }
    else if (page === 'board') {
      setCurrentPage('board');
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setShareLink(null);
    // URL 변경 (공유 링크가 아닌 경우 기본 경로로)
    if (page === "home") {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("home");
  };

  const handleWithdraw = () => {
    setIsLoggedIn(false);
    setCurrentPage("home");
    alert("회원탈퇴가 완료되었습니다.");
  };

  const handleToggleFavorite = (destination: any) => {
    const isAlreadyFavorite = favoriteDestinations.some((fav) => fav.id === destination.id);
    if (isAlreadyFavorite) {
      setFavoriteDestinations(favoriteDestinations.filter((fav) => fav.id !== destination.id));
    } else {
      setFavoriteDestinations([...favoriteDestinations, destination]);
    }
  };

  const handleRemoveFavorite = (id: number) => {
    setFavoriteDestinations(favoriteDestinations.filter((fav) => fav.id !== id));
  };

  const handleToggleFavoritePlanner = (planner: any) => {
    const isAlreadyFavorite = favoritePlanners.some((fav) => fav.id === planner.id);
    if (isAlreadyFavorite) {
      setFavoritePlanners(favoritePlanners.filter((fav) => fav.id !== planner.id));
    } else {
      setFavoritePlanners([...favoritePlanners, planner]);
    }
  };

  const handleRemoveFavoritePlanner = (id: number) => {
    setFavoritePlanners(favoritePlanners.filter((fav) => fav.id !== id));
  };

  const handleAddReview = (review: any) => {
    setReviews([review, ...reviews]);
  };

  const handleDeleteReview = (reviewId: number) => {
    setReviews(reviews.filter((review) => review.id !== reviewId));
  };

  const renderPage = () => {
    // 공유 링크 페이지
    if (currentPage === "shared-planner" && shareLink) {
      return (
        <SharedPlannerPage
          shareLink={shareLink}
          onBack={() => {
            setShareLink(null);
            setCurrentPage("home");
            window.history.pushState({}, '', '/');
          }}
        />
      );
    }

    if (currentPage === "travel") {
      return (
        <TravelPage
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          initialDestinationId={selectedDestinationId}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          favoriteDestinations={favoriteDestinations}
          onToggleFavorite={handleToggleFavorite}
          reviews={reviews}
          onAddReview={handleAddReview}
        />
      );
    }

    if (currentPage === "planner") {
      return (
        <PlannerPage
          selectedPlanner={selectedPlanner}
          isLoggedIn={isLoggedIn}
          favoritePlanners={favoritePlanners}
          onToggleFavoritePlanner={handleToggleFavoritePlanner}
        />
      );
    }

    if (currentPage === "event") {
      return (
        <EventPage
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />
      );
    }

    if (currentPage === "map") {
      return (
        <MapPage 
          onNavigate={(page, params) => {
            if (page === 'travel-detail' && params?.contentid) {
              setSelectedDestinationId(params.contentid);
              setCurrentPage('travel');
            }
          }}
        />
      );
    }

    if (currentPage === "board") {
      return (
        <BoardPage
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />
      );
    }

    if (currentPage === "login") {
      return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
    }

    if (currentPage === "signup") {
      return <SignupPage onNavigate={handleNavigate} />;
    }

    if (currentPage === "find-id") {
      return <FindIdPage onNavigate={handleNavigate} />;
    }

    if (currentPage === "find-password") {
      return <FindPasswordPage onNavigate={handleNavigate} />;
    }

    if (currentPage === "mypage") {
      return (
        <MyPage
          onLogout={handleLogout}
          onWithdraw={handleWithdraw}
          favoriteDestinations={favoriteDestinations}
          onRemoveFavorite={handleRemoveFavorite}
          favoritePlanners={favoritePlanners}
          onRemoveFavoritePlanner={handleRemoveFavoritePlanner}
          onNavigateToPlanner={(planner) => {
            setSelectedPlanner(planner);
            setCurrentPage("planner");
          }}
          onNavigateToDestination={(destinationId) => {
            setSelectedDestinationId(destinationId);
            setCurrentPage("travel");
          }}
          reviews={reviews}
          onDeleteReview={handleDeleteReview}
        />
      );
    }

    return (
      <>
        <FeaturedCarousel
          onSelectDestination={(id: string) => {
            setSelectedDestinationId(id);
            setCurrentPage("travel");
          }}
        />
        <PopularPlanners
          onSelectPlanner={(planner) => {
            setSelectedPlanner(planner);
            setCurrentPage("planner");
          }}
        />
      </>
    );
  };

  // 공유 링크 페이지는 헤더/푸터 없이 전체 화면
  if (currentPage === "shared-planner" && shareLink) {
    return (
      <div className="min-h-screen bg-white">
        {renderPage()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onSearch={(query: string) => console.log(query)}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      {renderPage()}

      <Footer />

      {isSearchModalOpen && (
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectDestination={(id: string) => {
            setSelectedDestinationId(id);
            setCurrentPage("travel");
            setIsSearchModalOpen(false);
          }}
          onSelectPlanner={(planner: any) => {
            setSelectedPlanner(planner);
            setCurrentPage("planner");
            setIsSearchModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
