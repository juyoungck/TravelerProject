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
import { NoticePage } from "./pages/NoticePage";
import { SharedPlannerPage } from "./pages/planner/SharedPlannerPage";

/**
 * App.tsx - 메인 애플리케이션
 * 라우팅 및 전역 상태 관리
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ mId: number; nickname: string } | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

  const [selectedPlanner, setSelectedPlanner] = useState<any>(null);
  const [favoriteDestinations, setFavoriteDestinations] = useState<any[]>([]);
  const [favoritePlanners, setFavoritePlanners] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // 소셜 로그인 콜백 상태
  const [oauthStatus, setOauthStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [oauthError, setOauthError] = useState<string>('');
  
  // 공유 링크 상태
  const [shareLink, setShareLink] = useState<string | null>(null);

  /**
   * 페이지 로드 시 로그인 상태 확인
   * localStorage에 토큰과 회원정보가 있으면 로그인 상태로 설정
   */
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      const memberInfo = localStorage.getItem('memberInfo');
      
      if (accessToken && memberInfo) {
        // 토큰 + 회원정보 둘 다 있으면 로그인 상태
        setIsLoggedIn(true);
        try {
          const member = JSON.parse(memberInfo);
          setCurrentUser({ mId: member.mId, nickname: member.nickname });
          console.log('로그인 상태 복원:', member.nickname);
        } catch (e) {
          console.error('회원정보 파싱 오류:', e);
          // 파싱 오류 시 로그아웃 처리
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('memberInfo');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        // 하나라도 없으면 로그아웃 상태
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    
    checkLoginStatus();
  }, []);

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
  }, []); 

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
   * URL 파라미터 파싱 - 새 탭에서 열릴 때 처리
   * 예: http://localhost:5173/?page=travel-detail&contentid=126508
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const contentid = urlParams.get('contentid');

    console.log('URL 파라미터:', { page, contentid });

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

  /**
   * 페이지 이동 핸들러
   */
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setShareLink(null);
    // URL 변경 (공유 링크가 아닌 경우 기본 경로로)
    if (page === "home") {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo(0, 0);
  };

  /**
   * 로그인 성공 핸들러
   */
  const handleLogin = (userData?: { mId: number; nickname: string }) => {
    setIsLoggedIn(true);
    if (userData) {
      setCurrentUser(userData);
    } else {
      // userData가 없으면 localStorage에서 가져오기
      const memberInfo = localStorage.getItem('memberInfo');
      if (memberInfo) {
        try {
          const member = JSON.parse(memberInfo);
          setCurrentUser({ mId: member.mId, nickname: member.nickname });
        } catch (e) {
          console.error('회원정보 파싱 오류:', e);
        }
      }
    }
    setCurrentPage("home");
  };

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = () => {
    // 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('user');
    
    // 상태 초기화
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage("home");
    
    console.log('로그아웃 완료');
  };

  /**
   * 회원탈퇴 핸들러
   */
  const handleWithdraw = () => {
    // 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('user');
    
    // 상태 초기화
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage("home");
    
    alert("회원탈퇴가 완료되었습니다.");
  };

  /**
   * 여행지 찜 토글
   */
  const handleToggleFavorite = (destination: any) => {
    const isAlreadyFavorite = favoriteDestinations.some((fav) => fav.id === destination.id);
    if (isAlreadyFavorite) {
      setFavoriteDestinations(favoriteDestinations.filter((fav) => fav.id !== destination.id));
    } else {
      setFavoriteDestinations([...favoriteDestinations, destination]);
    }
  };

  /**
   * 여행지 찜 삭제
   */
  const handleRemoveFavorite = (id: number) => {
    setFavoriteDestinations(favoriteDestinations.filter((fav) => fav.id !== id));
  };

  /**
   * 플래너 찜 토글
   */
  const handleToggleFavoritePlanner = (planner: any) => {
    const isAlreadyFavorite = favoritePlanners.some((fav) => fav.id === planner.id);
    if (isAlreadyFavorite) {
      setFavoritePlanners(favoritePlanners.filter((fav) => fav.id !== planner.id));
    } else {
      setFavoritePlanners([...favoritePlanners, planner]);
    }
  };

  /**
   * 플래너 찜 삭제
   */
  const handleRemoveFavoritePlanner = (id: number) => {
    setFavoritePlanners(favoritePlanners.filter((fav) => fav.id !== id));
  };

  /**
   * 리뷰 추가
   */
  const handleAddReview = (review: any) => {
    setReviews([review, ...reviews]);
  };

  /**
   * 리뷰 삭제
   */
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

  /**
   * 페이지 렌더링
   */
  const renderPage = () => {
    // 소셜 로그인 콜백 처리 중이면 콜백 화면 표시
    if (oauthStatus) {
      return renderOAuthCallback();
    }
    
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
          initialDestinationId={selectedDestinationId?.toString() || null}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          currentUserId={currentUser?.mId} 
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
          currentUserId={currentUser?.mId}
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

    if (currentPage === "notice") {
      return <NoticePage />;
    }
    
    // 홈 페이지
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

      <Footer onNavigate={handleNavigate} />

      {isSearchModalOpen && (
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectDestination={(id) => {
            setSelectedDestinationId(null);
            setTimeout(() => {
              setSelectedDestinationId(String(id));
              setCurrentPage("travel");
            }, 0);
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
