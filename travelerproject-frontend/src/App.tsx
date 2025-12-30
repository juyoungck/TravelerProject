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

/**
 * App.tsx - 메인 애플리케이션
 * ★ 테스트용: 자동 admin 로그인 활성화
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ mId: number; nickname: string } | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDestinationId, setSelectedDestinationId] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPlanner, setSelectedPlanner] = useState<any>(null);
  const [favoriteDestinations, setFavoriteDestinations] = useState<any[]>([]);
  const [favoritePlanners, setFavoritePlanners] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  /** 
   * ★★★ 테스트용: 자동 admin 로그인 ★★★
   * DB: m_id=1, m_username='admin', m_nickname='관리자'
   * TODO: 로그인 기능 완성 후 삭제
   */
  useEffect(() => {
    const adminUser = { mId: 1, nickname: '관리자' };
    setCurrentUser(adminUser);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(adminUser));
    console.log('★ 테스트용 자동 로그인: admin (mId: 1)');
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData?: { mId: number; nickname: string }) => {
    setIsLoggedIn(true);
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('user');
    setCurrentPage("home");
  };

  const handleWithdraw = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('user');
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
    if (currentPage === "travel") {
      return (
        <TravelPage
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
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
      return <MapPage />;
    }

    if (currentPage === "board") {
      return (
        <BoardPage
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUser?.mId}
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
          onSelectDestination={(id: number) => {
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
          onSelectDestination={(id: number) => {
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