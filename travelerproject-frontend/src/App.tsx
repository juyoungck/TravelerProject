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

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [selectedPlanner, setSelectedPlanner] = useState<any>(null);
  const [favoriteDestinations, setFavoriteDestinations] = useState<any[]>([]);
  const [favoritePlanners, setFavoritePlanners] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // 소셜 로그인 콜백 상태
  const [oauthStatus, setOauthStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [oauthError, setOauthError] = useState<string>('');

  /**
   * 소셜 로그인 콜백 처리
   * URL에서 토큰을 추출하여 로그인 처리
   */
  useEffect(() => {
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const error = urlParams.get('error');
    
    // 소셜 로그인 콜백인 경우
    if (window.location.pathname === '/oauth2/callback' || accessToken || error) {
      if (error) {
        // 에러 처리
        setOauthStatus('error');
        setOauthError(decodeURIComponent(error));
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          setOauthStatus(null);
          setCurrentPage('login');
          // URL 정리
          window.history.replaceState({}, '', '/');
        }, 3000);
      } else if (accessToken && refreshToken) {
        // 성공 처리
        setOauthStatus('success');
        
        // 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // 로그인 상태 변경
        setIsLoggedIn(true);
        
        // 2초 후 홈으로 이동
        setTimeout(() => {
          setOauthStatus(null);
          setCurrentPage('home');
          // URL 정리
          window.history.replaceState({}, '', '/');
        }, 2000);
      }
    }
    
    // 페이지 로드 시 로그인 상태 확인
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberInfo');
    
    setIsLoggedIn(false);
    setCurrentPage("home");
  };

  const handleWithdraw = () => {
    // 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberInfo');
    
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

  /**
   * 소셜 로그인 콜백 화면 렌더링
   */
  const renderOAuthCallback = () => {
    if (oauthStatus === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">로그인 처리 중...</p>
          </div>
        </div>
      );
    }
    
    if (oauthStatus === 'success') {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-lg text-green-600 font-semibold">로그인 성공!</p>
            <p className="text-gray-500 mt-2">메인 페이지로 이동합니다...</p>
          </div>
        </div>
      );
    }
    
    if (oauthStatus === 'error') {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="text-lg text-red-600 font-semibold">로그인 실패</p>
            <p className="text-gray-500 mt-2">{oauthError}</p>
            <p className="text-gray-400 mt-2">로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderPage = () => {
    // 소셜 로그인 콜백 처리 중이면 콜백 화면 표시
    if (oauthStatus) {
      return renderOAuthCallback();
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
      return <MapPage />;
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
  return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLogin} />;
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
          setSelectedDestinationId(destinationId?.toString() ?? null);
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
          setSelectedDestinationId(id.toString());
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
          setSelectedDestinationId(id.toString());
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
