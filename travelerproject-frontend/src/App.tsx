import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { FeaturedCarousel } from "./components/home/FeaturedCarousel";
import { PopularPlanners } from "./components/home/PopularPlanners";
import { SearchModal } from "./components/modals/SearchModal";
import { SocialLinkModal } from "./components/modals/SocialLinkModal";
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
import { socialApi } from "./api/socialApi";

/**
 * App.tsx - 메인 애플리케이션
 * 라우팅 및 전역 상태 관리
 * ★ plnId URL 파라미터 처리 추가
 * ★ BoardPage에 onViewPlanner 전달
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

  // 소셜 연동 모달 상태
  const [isSocialLinkModalOpen, setIsSocialLinkModalOpen] = useState(false);
  const [socialLinkInfo, setSocialLinkInfo] = useState<{
    provider: string;
    providerId: string;
    email: string;
    nickname: string;
  } | null>(null);

  /**
   * 페이지 로드 시 로그인 상태 확인
   * localStorage에 토큰과 회원정보가 있으면 로그인 상태로 설정
   */
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      const memberInfo = localStorage.getItem('memberInfo');
      
      if (accessToken && memberInfo) {
        setIsLoggedIn(true);
        try {
          const member = JSON.parse(memberInfo);
          setCurrentUser({ mId: member.mId, nickname: member.nickname });
          console.log('로그인 상태 복원:', member.nickname);
        } catch (e) {
          console.error('회원정보 파싱 오류:', e);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('memberInfo');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
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
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const error = urlParams.get('error');
    const isNewUser = urlParams.get('isNewUser');
    
    // 소셜 로그인 콜백인 경우
    if (window.location.pathname === '/oauth2/callback' || accessToken || error) {
      if (error) {
        setOauthStatus('error');
        setOauthError(decodeURIComponent(error));
        
        setTimeout(() => {
          setOauthStatus(null);
          setCurrentPage('login');
          window.history.replaceState({}, '', '/');
        }, 3000);
      } else if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setIsLoggedIn(true);
        
        if (isNewUser === 'true') {
          setOauthStatus('success');
          localStorage.setItem('socialSignupMode', 'true');
          
          setTimeout(() => {
            setOauthStatus(null);
            setCurrentPage('signup');
            window.history.replaceState({}, '', '/');
          }, 1500);
        } else {
          setOauthStatus('success');
          
          setTimeout(() => {
            setOauthStatus(null);
            setCurrentPage('home');
            window.history.replaceState({}, '', '/');
          }, 2000);
        }
      }
    }
  }, []);

  /**
   * 소셜 연동 콜백 처리
   */
  useEffect(() => {
    if (window.location.pathname === '/oauth2/link/callback') {
      const urlParams = new URLSearchParams(window.location.search);
      
      const provider = urlParams.get('provider');
      const providerId = urlParams.get('providerId');
      const email = urlParams.get('email') || '';
      const nickname = urlParams.get('nickname') || '';
      const isAlreadyRegistered = urlParams.get('isAlreadyRegistered') === 'true';
      const isAlreadyLinked = urlParams.get('isAlreadyLinked') === 'true';
      const error = urlParams.get('error');
      
      window.history.replaceState({}, document.title, '/mypage');
      
      if (error) {
        alert(decodeURIComponent(error));
        setCurrentPage('mypage');
        return;
      }
      
      if (isAlreadyRegistered) {
        alert('이미 가입된 소셜 계정입니다.');
        setCurrentPage('mypage');
        return;
      }
      
      if (isAlreadyLinked) {
        alert('이미 다른 계정에 연동된 소셜 계정입니다.');
        setCurrentPage('mypage');
        return;
      }
      
      if (provider && providerId) {
        setSocialLinkInfo({
          provider,
          providerId,
          email,
          nickname
        });
        setIsSocialLinkModalOpen(true);
        setCurrentPage('mypage');
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

    checkShareLink();
    window.addEventListener('popstate', checkShareLink);
    
    return () => {
      window.removeEventListener('popstate', checkShareLink);
    };
  }, []);

  /**
   * URL 파라미터 파싱 - 새 탭에서 열릴 때 처리
   * ★ plnId 파라미터 추가
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const contentid = urlParams.get('contentid');
    const plnId = urlParams.get('plnId');  // ★ 플래너 ID 추가

    console.log('URL 파라미터:', { page, contentid, plnId });

    // 여행지 상세 페이지로 이동
    if (page === 'travel-detail' && contentid) {
      setSelectedDestinationId(contentid);
      setCurrentPage('travel');
    }
    // ★ 플래너 미리보기 페이지로 이동
    else if (page === 'planner' && plnId) {
      setSelectedPlanner({ plnId: Number(plnId) });
      setCurrentPage('planner');
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

    if (page === "travel") {
      setSelectedDestinationId(null);
    }
    if (page === "home") {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo(0, 0);
  };

  /**
   * ★ 플래너 미리보기 이동 핸들러 (게시판에서 호출)
   */
  const handleViewPlannerFromBoard = (plnId: number) => {
    setSelectedPlanner({ id: plnId });
    setCurrentPage('planner');
  };

  /**
   * 로그인 성공 핸들러
   */
  const handleLogin = (userData?: { mId: number; nickname: string }) => {
    setIsLoggedIn(true);
    if (userData) {
      setCurrentUser(userData);
    } else {
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage("home");
    
    console.log('로그아웃 완료');
  };

  /**
   * 회원탈퇴 핸들러
   */
  const handleWithdraw = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage("home");
    
    alert("회원탈퇴가 완료되었습니다.");
  };

  /**
   * 소셜 연동 확정 핸들러
   */
  const handleSocialLinkConfirm = async (useSocialNickname: boolean) => {
    if (!socialLinkInfo) return;
    
    try {
      const response = await socialApi.confirmSocialLink({
        provider: socialLinkInfo.provider,
        providerId: socialLinkInfo.providerId,
        email: socialLinkInfo.email,
        nickname: socialLinkInfo.nickname,
        useSocialNickname
      });
      
      if (response.status === 'success') {
        alert('소셜 계정이 연동되었습니다!');
        setIsSocialLinkModalOpen(false);
        setSocialLinkInfo(null);
        window.location.reload();
      } else {
        alert(response.message || '연동에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('소셜 연동 실패:', error);
      alert(error.response?.data?.message || '연동 중 오류가 발생했습니다.');
    }
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
    if (oauthStatus) {
      return renderOAuthCallback();
    }
    
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

    {/* ★ BoardPage에 onViewPlanner 전달 */}
    if (currentPage === "board") {
      return (
        <BoardPage
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUser?.mId}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onViewPlanner={handleViewPlannerFromBoard}
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
          onNavigateToPlanner={(planner) => {
            setSelectedPlanner(planner);
            setCurrentPage("planner");
          }}
          onNavigateToDestination={(contentid) => {
            setSelectedDestinationId(contentid);
            setCurrentPage("travel");
          }}
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

      {/* 소셜 연동 모달 */}
      {isSocialLinkModalOpen && socialLinkInfo && (
        <SocialLinkModal
          isOpen={isSocialLinkModalOpen}
          onClose={() => {
            setIsSocialLinkModalOpen(false);
            setSocialLinkInfo(null);
          }}
          provider={socialLinkInfo.provider}
          socialNickname={socialLinkInfo.nickname}
          currentNickname={currentUser?.nickname || ''}
          onConfirm={handleSocialLinkConfirm}
        />
      )}
    </div>
  );
}