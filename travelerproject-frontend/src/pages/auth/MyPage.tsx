/**
 * MyPage.tsx - 마이페이지
 * 회원정보 조회/수정, 비밀번호 변경, 회원탈퇴
 * API 연동 완료
 */

import { useState, useEffect } from 'react';
import { Star, Heart, Trash2, Calendar, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

// 변경 후
import { authApi } from '../../api/authApi';
import type { MemberInfo } from '../../api/authApi';


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

export function MyPage({ 
  onLogout, 
  onWithdraw, 
  favoriteDestinations, 
  onRemoveFavorite, 
  favoritePlanners, 
  onRemoveFavoritePlanner, 
  onNavigateToPlanner, 
  onNavigateToDestination, 
  reviews, 
  onDeleteReview 
}: MyPageProps) {
  // ============================================
  // 상태 관리
  // ============================================
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('destinations');
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  
  // 회원 정보 상태
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 정보 수정 폼 상태 (닉네임만 수정 가능)
  const [nickname, setNickname] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // 비밀번호 변경 상태
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 회원탈퇴 상태
  const [withdrawPassword, setWithdrawPassword] = useState('');
  
  // 소셜 계정 연동 상태
  const [socialConnections, setSocialConnections] = useState({
    kakao: false,
    naver: false,
    google: false,
  });

  // ============================================
  // 회원 정보 조회
  // ============================================
  useEffect(() => {
    fetchMemberInfo();
  }, []);

  const fetchMemberInfo = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getMyInfo();
      if (response.status === 'success' && response.data) {
        setMemberInfo(response.data);
        setNickname(response.data.nickname || '');
      }
    } catch (error: any) {
      console.error('회원 정보 조회 오류:', error);
      // 토큰 만료 시 로그아웃 처리
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 회원 정보 수정
  // ============================================
  const handleUpdateInfo = async () => {
    // 유효성 검사
    if (!nickname.trim()) {
      setUpdateMessage('닉네임을 입력해주세요.');
      return;
    }
    
    if (nickname.length < 2 || nickname.length > 10) {
      setUpdateMessage('닉네임은 2~10자로 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    setUpdateMessage('');

    try {
      const response = await authApi.updateMyInfo({
        nickname: nickname.trim(),
      });

      if (response.status === 'success') {
        setUpdateMessage('회원정보가 수정되었습니다.');
        if (response.data) {
          setMemberInfo(response.data);
        }
        // 3초 후 메시지 삭제
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage(response.message || '수정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('회원정보 수정 오류:', error);
      setUpdateMessage(error.response?.data?.message || '수정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================
  // 비밀번호 변경
  // ============================================
  const handleChangePassword = async () => {
    // 유효성 검사
    if (!currentPassword) {
      setPasswordMessage('현재 비밀번호를 입력해주세요.');
      return;
    }
    
    if (!newPassword) {
      setPasswordMessage('새 비밀번호를 입력해주세요.');
      return;
    }
    
    // 비밀번호 형식 검사 (8자 이상, 영문+숫자+특수문자)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordMessage('비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.');
      return;
    }
    
    if (newPassword !== newPasswordConfirm) {
      setPasswordMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (currentPassword === newPassword) {
      setPasswordMessage('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage('');

    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      if (response.status === 'success') {
        alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
        onLogout();
      } else {
        setPasswordMessage(response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error);
      setPasswordMessage(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ============================================
  // 회원 탈퇴
  // ============================================
  const handleWithdraw = async () => {
    if (!withdrawPassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await authApi.withdraw(withdrawPassword);
      
      if (response.status === 'success') {
        setIsWithdrawalModalOpen(false);
        alert('회원 탈퇴가 완료되었습니다.');
        onWithdraw();
      } else {
        alert(response.message || '회원 탈퇴에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('회원 탈퇴 오류:', error);
      alert(error.response?.data?.message || '회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  // ============================================
  // 로그아웃
  // ============================================
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('로그아웃 API 오류:', error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('memberInfo');
      onLogout();
    }
  };

  // ============================================
  // 기타 핸들러
  // ============================================
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
      alert(`${platform} 소셜 로그인은 준비 중입니다.`);
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

  // 성별 표시 변환
  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'M': return '남성';
      case 'F': return '여성';
      case 'OTHER': return '기타';
      default: return '미설정';
    }
  };

  // ============================================
  // 로딩 상태
  // ============================================
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">마이페이지</h1>
      
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

      {/* ============================================ */}
      {/* 개인정보 수정 탭 */}
      {/* ============================================ */}
      {activeTab === 'info' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-6">개인정보수정</h2>
          
          <div className="space-y-4">
            {/* 아이디 - 변경 불가 */}
            <div>
              <Label htmlFor="username">아이디</Label>
              <Input 
                id="username" 
                type="text" 
                value={memberInfo?.username || ''} 
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            
            {/* 비밀번호 변경 섹션 */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label>비밀번호</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPasswordForm(!showPasswordForm);
                    setPasswordMessage('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setNewPasswordConfirm('');
                  }}
                >
                  {showPasswordForm ? '취소' : '비밀번호 변경'}
                </Button>
              </div>
              
              {showPasswordForm && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  {/* 현재 비밀번호 */}
                  <div className="relative">
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="현재 비밀번호 입력"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* 새 비밀번호 */}
                  <div>
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword" 
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="8자 이상, 영문+숫자+특수문자"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* 새 비밀번호 확인 */}
                  <div>
                    <Label htmlFor="newPasswordConfirm">새 비밀번호 확인</Label>
                    <div className="relative">
                      <Input 
                        id="newPasswordConfirm" 
                        type={showNewPasswordConfirm ? 'text' : 'password'}
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="새 비밀번호 다시 입력"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPasswordConfirm(!showNewPasswordConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showNewPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* 비밀번호 변경 메시지 */}
                  {passwordMessage && (
                    <p className={`text-sm ${passwordMessage.includes('성공') ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordMessage}
                    </p>
                  )}
                  
                  {/* 비밀번호 변경 버튼 */}
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full"
                  >
                    {isChangingPassword ? '변경 중...' : '비밀번호 변경'}
                  </Button>
                </div>
              )}
            </div>

            {/* 닉네임 - 수정 가능 */}
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input 
                id="nickname" 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2~10자"
                maxLength={10}
              />
            </div>

            {/* 전화번호 - 변경 불가 */}
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={memberInfo?.phone || '미설정'}
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
                value={memberInfo?.email || ''}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 생년월일 - 변경 불가 */}
            <div>
              <Label htmlFor="birth">생년월일</Label>
              <Input 
                id="birth" 
                type="text" 
                value={memberInfo?.birth || '미설정'}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 성별 - 변경 불가 */}
            <div>
              <Label>성별</Label>
              <Input 
                type="text" 
                value={getGenderText(memberInfo?.gender)}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 가입일 */}
            <div>
              <Label>가입일</Label>
              <Input 
                type="text" 
                value={memberInfo?.regdate ? new Date(memberInfo.regdate).toLocaleDateString('ko-KR') : ''}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 수정 결과 메시지 */}
            {updateMessage && (
              <p className={`text-sm ${updateMessage.includes('수정되었습니다') ? 'text-green-600' : 'text-red-500'}`}>
                {updateMessage}
              </p>
            )}

            {/* 수정하기 버튼 */}
            <div className="pt-4">
              <Button 
                className="w-full"
                onClick={handleUpdateInfo}
                disabled={isUpdating}
              >
                {isUpdating ? '수정 중...' : '수정하기'}
              </Button>
            </div>

            {/* 소셜 계정 연동 */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">소셜 계정 연동</h3>
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

            {/* 로그아웃 & 회원탈퇴 */}
            <div className="pt-6 border-t flex justify-between">
              <button
                onClick={handleLogout}
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

      {/* ============================================ */}
      {/* 리뷰 목록 탭 */}
      {/* ============================================ */}
      {activeTab === 'reviews' && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <p className="text-gray-600">총 {reviews?.length || 0}개의 리뷰</p>
          </div>
          
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
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
                          <h3 className="font-medium mb-1">{review.destinationName}</h3>
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
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                작성한 리뷰가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 찜 목록 탭 */}
      {/* ============================================ */}
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
              {favoriteDestinations && favoriteDestinations.length > 0 ? (
                favoriteDestinations.map((favorite) => (
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
                            <h3 className="font-medium mb-1">{favorite.name}</h3>
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
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  찜한 여행지가 없습니다.
                </div>
              )}
            </div>
          )}

          {/* 플래너 찜 목록 */}
          {favoriteType === 'planners' && (
            <div className="space-y-4">
              {favoritePlanners && favoritePlanners.length > 0 ? (
                favoritePlanners.map((planner) => (
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
                            <h3 className="font-medium mb-1">{planner.title}</h3>
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
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  찜한 플래너가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* 회원탈퇴 모달 */}
      {/* ============================================ */}
      {isWithdrawalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">회원 탈퇴</h3>
            <p className="text-gray-600 mb-4">
              정말로 탈퇴하시겠습니까?<br />
              탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            
            <div className="mb-4">
              <Label htmlFor="withdrawPassword">비밀번호 확인</Label>
              <Input
                id="withdrawPassword"
                type="password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsWithdrawalModalOpen(false);
                  setWithdrawPassword('');
                }}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleWithdraw}
              >
                탈퇴하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
