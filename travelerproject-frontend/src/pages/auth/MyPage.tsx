/**
 * MyPage.tsx - 마이페이지
 * 회원정보 수정, 찜한 여행지/플래너, 작성한 리뷰 관리
 */

import { useState } from 'react';
import { Star, Heart, Trash2, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { WithdrawalModal } from '../../components/modals/WithdrawalModal';

interface MyPageProps {
  onLogout: () => void;
  onWithdraw: () => void;
  favoriteDestinations?: any[];
  onRemoveFavorite?: (id: number) => void;
  favoritePlanners?: any[];
  onRemoveFavoritePlanner?: (id: number) => void;
  onNavigateToPlanner?: (planner: any) => void;
  onNavigateToDestination?: (destinationId: number) => void;
  reviews?: any[];
  onDeleteReview?: (reviewId: number) => void;
}

type TabType = 'info' | 'reviews' | 'favorites';
type FavoriteType = 'destinations' | 'planners';

export function MyPage({ onLogout, onWithdraw, favoriteDestinations, onRemoveFavorite, favoritePlanners, onRemoveFavoritePlanner, onNavigateToPlanner, onNavigateToDestination, reviews, onDeleteReview }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('destinations');
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [socialConnections, setSocialConnections] = useState({
    kakao: false,
    naver: false,
    google: false,
  });

  const handleWithdraw = () => {
    setIsWithdrawalModalOpen(false);
    onWithdraw();
  };

  const handleRemoveFavoriteDestination = (id: number) => {
    if (onRemoveFavorite) {
      onRemoveFavorite(id);
    }
  };

  const handleRemoveFavoritePlanner = (id: number) => {
    if (onRemoveFavoritePlanner) {
      onRemoveFavoritePlanner(id);
    }
  };

  const handleDeleteReview = (id: number) => {
    if (onDeleteReview) {
      onDeleteReview(id);
    }
  };

  const handleSocialConnect = (platform: 'kakao' | 'naver' | 'google') => {
    if (socialConnections[platform]) {
      if (confirm(`${platform} 계정 연동을 해제하시겠습니까?`)) {
        setSocialConnections({ ...socialConnections, [platform]: false });
      }
    } else {
      alert(`${platform} 계정 연동 페이지로 이동합니다.`);
      setSocialConnections({ ...socialConnections, [platform]: true });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8">마이페이지</h1>
      
      {/* 탭 메뉴 */}
      <div className="flex gap-4 border-b mb-8">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'info'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          개인정보수정
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'reviews'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          여행지 리뷰 목록
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'favorites'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          나의 찜 목록
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'info' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="mb-6">개인정보수정</h2>
          
          <div className="space-y-4">
            {/* 아이디 - 변경 불가 */}
            <div>
              <Label htmlFor="username">아이디</Label>
              <Input 
                id="username" 
                type="text" 
                value="user123" 
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            
            {/* 비밀번호 */}
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="새 비밀번호를 입력하세요"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <Label htmlFor="password-confirm">비밀번호 확인</Label>
              <Input 
                id="password-confirm" 
                type="password" 
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            {/* 닉네임 */}
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input 
                id="nickname" 
                type="text" 
                defaultValue="여행러버"
              />
            </div>

            {/* 이름 - 변경 불가 */}
            <div>
              <Label htmlFor="name">이름</Label>
              <Input 
                id="name" 
                type="text" 
                value="홍길동"
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 생년월일 */}
            <div>
              <Label htmlFor="birth">생년월일</Label>
              <Input 
                id="birth" 
                type="date" 
                value="1990-01-01"
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 이메일 - 변경 불가 */}
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input 
                id="email" 
                type="email" 
                value="user@naver.com"
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 성별 - 변경 불가 */}
            <div>
              <Label>성별</Label>
              <div className="flex gap-4 mt-2 bg-gray-100 p-3 rounded border cursor-not-allowed">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="radio" name="gender" value="male" checked disabled />
                  <span>남성</span>
                </label>
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="radio" name="gender" value="female" disabled />
                  <span>여성</span>
                </label>
              </div>
            </div>

            {/* 소셜 계정 연동 */}
            <div className="pt-4 border-t">
              <h3 className="mb-4">소셜 계정 연동</h3>
              <div className="space-y-3">
                {/* 카카오톡 */}
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <span>카카오톡</span>
                  </div>
                  <Button
                    variant={socialConnections.kakao ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleSocialConnect('kakao')}
                    className={socialConnections.kakao ? 'text-red-500 hover:text-red-600' : ''}
                  >
                    {socialConnections.kakao ? '연동 해제' : '연동하기'}
                  </Button>
                </div>
                
                {/* 네이버 */}
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#03C75A]">N</span>
                    <span>네이버</span>
                  </div>
                  <Button
                    variant={socialConnections.naver ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleSocialConnect('naver')}
                    className={socialConnections.naver ? 'text-red-500 hover:text-red-600' : ''}
                  >
                    {socialConnections.naver ? '연동 해제' : '연동하기'}
                  </Button>
                </div>
                
                {/* 구글 */}
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">G</span>
                    <span>구글</span>
                  </div>
                  <Button
                    variant={socialConnections.google ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleSocialConnect('google')}
                    className={socialConnections.google ? 'text-red-500 hover:text-red-600' : ''}
                  >
                    {socialConnections.google ? '연동 해제' : '연동하기'}
                  </Button>
                </div>
              </div>
            </div>

            {/* 수정하기 버튼 */}
            <div className="pt-4">
              <Button className="w-full">수정하기</Button>
            </div>

            {/* 로그아웃 & 회원탈퇴 */}
            <div className="pt-6 border-t flex justify-between">
              <button
                onClick={onLogout}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                로그아웃
              </button>
              <button
                onClick={() => setIsWithdrawalModalOpen(true)}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                회원탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <p className="text-gray-600">총 {reviews?.length || 0}개의 리뷰</p>
          </div>
          
          <div className="space-y-4">
            {reviews?.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={review.destinationImage}
                    alt={review.destinationName}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="mb-1">{review.destinationName}</h3>
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="max-w-6xl mx-auto">
          {/* 찜 목록 타입 선택 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFavoriteType('destinations')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                favoriteType === 'destinations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              여행지 찜 ({favoriteDestinations?.length || 0})
            </button>
            <button
              onClick={() => setFavoriteType('planners')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                favoriteType === 'planners'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              플래너 찜 ({favoritePlanners?.length || 0})
            </button>
          </div>

          {/* 여행지 찜 목록 */}
          {favoriteType === 'destinations' && (
            <div className="space-y-4">
              {favoriteDestinations?.map((favorite) => (
                <div
                  key={favorite.id}
                  onClick={() => onNavigateToDestination?.(favorite.id)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex gap-4 p-4">
                    <img
                      src={favorite.image}
                      alt={favorite.name}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="mb-1">{favorite.name}</h3>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                            {favorite.region}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavoriteDestination(favorite.id);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart className="h-5 w-5 fill-red-500" />
                        </Button>
                      </div>
                      
                      <p className="text-gray-600">{favorite.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {favoriteDestinations?.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  찜한 여행지가 없습니다.
                </div>
              )}
            </div>
          )}

          {/* 플래너 찜 목록 */}
          {favoriteType === 'planners' && (
            <div className="space-y-4">
              {favoritePlanners?.map((planner) => (
                <div
                  key={planner.id}
                  onClick={() => onNavigateToPlanner?.(planner)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex gap-4 p-4">
                    <img
                      src={planner.image}
                      alt={planner.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="mb-1">{planner.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>작성자: {planner.author}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{planner.duration || `${planner.days}일`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                              <span>{planner.likes}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavoritePlanner(planner.id);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart className="h-5 w-5 fill-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(favoritePlanners?.length === 0 || !favoritePlanners) && (
                <div className="text-center py-12 text-gray-400">
                  찜한 플래너가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 회원탈퇴 모달 */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}