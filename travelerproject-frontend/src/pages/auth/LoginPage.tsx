/**
 * LoginPage.tsx - 로그인 페이지
 * 일반 로그인 + 소셜 로그인 (카카오, 네이버, 구글)
 * 
 * API 연동 완료
 * 
 * @author TravelerProject
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { oauth2Api } from '../../api/oauth2Api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: () => void;  // 이거 추가!
}  

export function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  // 입력값 상태
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 일반 로그인 처리
   */
  const handleLogin = async () => {
    // 유효성 검사
    if (!username.trim()) {
      setErrorMessage('아이디를 입력하세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력하세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.login({ username, password }) as any;

      if (response.status === 'success' && response.data) {
        // 토큰 저장
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // 회원 정보 저장
        if (response.data.member) {
          localStorage.setItem('memberInfo', JSON.stringify(response.data.member));
        }
        
        // 성공 콜백 호출
        onLoginSuccess();
        
        // 홈으로 이동
        onNavigate('home');
      } else {
        setErrorMessage(response.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setErrorMessage(error.response?.data?.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 엔터키로 로그인
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  /**
   * 카카오 로그인
   */
  const handleKakaoLogin = () => {
    oauth2Api.kakaoLogin();
  };

  /**
   * 네이버 로그인
   */
  const handleNaverLogin = () => {
    oauth2Api.naverLogin();
  };

  /**
   * 구글 로그인
   */
  const handleGoogleLogin = () => {
    oauth2Api.googleLogin();
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8 text-center">로그인</h1>
        
        <div className="space-y-4 bg-white p-8 rounded-lg shadow-lg">
          {/* 아이디 입력 */}
          <div>
            <Label htmlFor="username">아이디</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMessage('');
              }}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          {/* 비밀번호 입력 */}
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          {/* 로그인 버튼 */}
          <Button 
            onClick={handleLogin} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          
          {/* 아이디/비밀번호 찾기 */}
          <div className="flex justify-center gap-4 text-sm">
            <button 
              onClick={() => onNavigate('find-id')}
              className="text-gray-600 hover:text-blue-600 hover:underline"
            >
              아이디 찾기
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => onNavigate('find-password')}
              className="text-gray-600 hover:text-blue-600 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
          
          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">간편 로그인</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">
            {/* 카카오 로그인 */}
            <button
              onClick={handleKakaoLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-[#FEE500] hover:bg-[#FDD800] transition-colors text-[#191919] font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.52 1.67 4.73 4.17 5.98l-.85 3.18c-.07.27.19.51.44.4l3.72-1.64c.8.14 1.65.22 2.52.22 5.52 0 10-3.48 10-7.64C22 6.48 17.52 3 12 3z"/>
              </svg>
              <span>카카오로 시작하기</span>
            </button>

            {/* 네이버 로그인 */}
            <button
              onClick={handleNaverLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-[#03C75A] hover:bg-[#02B351] transition-colors text-white font-medium"
            >
              <span className="text-xl font-bold">N</span>
              <span>네이버로 시작하기</span>
            </button>

            {/* 구글 로그인 */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google로 시작하기</span>
            </button>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center mt-6">
            <button 
              onClick={() => onNavigate('signup')}
              className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
            >
              아직 계정이 없으신가요? 회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
