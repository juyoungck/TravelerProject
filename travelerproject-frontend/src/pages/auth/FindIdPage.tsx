/**
 * FindIdPage.tsx - 아이디 찾기 페이지
 * 이메일로 아이디 찾기 (이메일로 아이디 전송)
 * API 연동 완료
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/authApi';

interface FindIdPageProps {
  onNavigate: (page: string) => void;
}

export function FindIdPage({ onNavigate }: FindIdPageProps) {
  // 상태 관리
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 아이디 찾기 요청
   * 이메일로 아이디를 발송합니다
   */
  const handleFindId = async () => {
    // 유효성 검사
    if (!email) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');

    try {
      const response = await authApi.findUsername(email);

      if (response.status === 'success') {
        setIsSent(true);
      } else {
        setErrorMessage(response.message || '아이디 찾기에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('아이디 찾기 오류:', error);
      setErrorMessage(
        error.response?.data?.message || 
        '해당 이메일로 가입된 계정이 없습니다.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 다시 찾기
   */
  const handleReset = () => {
    setEmail('');
    setIsSent(false);
    setErrorMessage('');
  };

  /**
   * 엔터키로 아이디 찾기
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleFindId();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>로그인으로 돌아가기</span>
          </button>
          <h1 className="text-2xl font-bold text-center">아이디 찾기</h1>
        </div>

        <div className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          {!isSent ? (
            <>
              {/* 안내 문구 */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  가입 시 등록한 이메일을 입력하시면<br />
                  해당 이메일로 아이디를 보내드립니다.
                </p>
              </div>

              {/* 이메일 입력 */}
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <Button
                onClick={handleFindId}
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? '전송 중...' : '아이디 찾기'}
              </Button>

              {/* 비밀번호 찾기 링크 */}
              <div className="text-center">
                <button
                  onClick={() => onNavigate('find-password')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  비밀번호가 기억나지 않으세요?
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 발송 완료 화면 */}
              <div className="text-center py-6">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✉️</span>
                  </div>
                  <p className="text-lg font-medium mb-2">이메일을 확인해주세요!</p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-blue-600">{email}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    위 이메일로 아이디를 발송했습니다.<br />
                    메일함을 확인해주세요.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => onNavigate('login')}
                  className="w-full"
                >
                  로그인하기
                </Button>
                <Button
                  onClick={() => onNavigate('find-password')}
                  variant="outline"
                  className="w-full"
                >
                  비밀번호 찾기
                </Button>
                <button
                  onClick={handleReset}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
                >
                  다시 찾기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
