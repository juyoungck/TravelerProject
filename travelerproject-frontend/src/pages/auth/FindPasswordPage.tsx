/**
 * FindPasswordPage.tsx - 비밀번호 찾기 페이지
 * 아이디/이메일 인증 후 비밀번호 재설정
 * API 연동 완료
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/authApi';

interface FindPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function FindPasswordPage({ onNavigate }: FindPasswordPageProps) {
  // 단계 관리: verify(본인확인) -> code(인증코드) -> reset(비밀번호재설정)
  const [step, setStep] = useState<'verify' | 'code' | 'reset'>('verify');
  
  // 입력 상태
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * 1단계: 본인 확인 및 인증코드 발송
   */
  const handleVerify = async () => {
    // 유효성 검사
    if (!username) {
      setErrorMessage('아이디를 입력해주세요.');
      return;
    }

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

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.findPasswordVerify(username, email);

      if (response.status === 'success') {
        alert('인증 코드가 이메일로 발송되었습니다.');
        setStep('code');
      } else {
        setErrorMessage(response.message || '본인 확인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('본인 확인 오류:', error);
      setErrorMessage(
        error.response?.data?.message || 
        '입력한 정보와 일치하는 계정이 없습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2단계: 인증코드 확인
   */
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setErrorMessage('인증 코드를 입력해주세요.');
      return;
    }

    if (verificationCode.length !== 6) {
      setErrorMessage('인증 코드는 6자리입니다.');
      return;
    }

    // 인증코드 확인은 비밀번호 재설정 시 함께 처리
    setStep('reset');
    setErrorMessage('');
  };

  /**
   * 3단계: 비밀번호 재설정
   */
  const handleResetPassword = async () => {
    // 유효성 검사
    if (!newPassword) {
      setErrorMessage('새 비밀번호를 입력해주세요.');
      return;
    }

    // 비밀번호 형식 검사 (8자 이상, 영문+숫자+특수문자)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrorMessage('비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.resetPassword({
        username,
        email,
        verificationCode,
        newPassword,
        newPasswordConfirm: confirmPassword,
      });

      if (response.status === 'success') {
        alert('비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.');
        onNavigate('login');
      } else {
        setErrorMessage(response.message || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('비밀번호 재설정 오류:', error);
      setErrorMessage(
        error.response?.data?.message || 
        '비밀번호 재설정 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 인증코드 재발송
   */
  const handleResendCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.findPasswordVerify(username, email);

      if (response.status === 'success') {
        alert('인증 코드가 다시 발송되었습니다.');
        setVerificationCode('');
      } else {
        setErrorMessage(response.message || '인증 코드 발송에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('인증 코드 재발송 오류:', error);
      setErrorMessage('인증 코드 발송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 엔터키 처리
   */
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !isLoading) {
      action();
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
          <h1 className="text-2xl font-bold text-center">비밀번호 찾기</h1>
        </div>

        <div className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          
          {/* ============================================ */}
          {/* 1단계: 본인 확인 */}
          {/* ============================================ */}
          {step === 'verify' && (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  회원정보에 등록된 아이디와 이메일을 입력하시면<br />
                  인증 코드를 발송해드립니다.
                </p>
              </div>

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
                  onKeyPress={(e) => handleKeyPress(e, handleVerify)}
                />
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
                  onKeyPress={(e) => handleKeyPress(e, handleVerify)}
                />
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <Button
                onClick={handleVerify}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '확인 중...' : '인증코드 발송'}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => onNavigate('find-id')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  아이디가 기억나지 않으세요?
                </button>
              </div>
            </>
          )}

          {/* ============================================ */}
          {/* 2단계: 인증코드 입력 */}
          {/* ============================================ */}
          {step === 'code' && (
            <>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✉️</span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{email}</span>
                  <br />위 이메일로 발송된 인증 코드를 입력해주세요.
                </p>
              </div>

              {/* 인증코드 입력 */}
              <div>
                <Label htmlFor="verificationCode">인증 코드</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="6자리 인증 코드"
                  value={verificationCode}
                  onChange={(e) => {
                    // 숫자만 입력, 6자리 제한
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                    setErrorMessage('');
                  }}
                  onKeyPress={(e) => handleKeyPress(e, handleVerifyCode)}
                  maxLength={6}
                  className="text-center text-xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  인증 코드는 5분간 유효합니다.
                </p>
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <Button
                onClick={handleVerifyCode}
                className="w-full"
                disabled={isLoading || verificationCode.length !== 6}
              >
                확인
              </Button>

              {/* 인증코드 재발송 */}
              <div className="text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                >
                  인증 코드 다시 받기
                </button>
              </div>

              {/* 이전 단계로 */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setStep('verify');
                    setVerificationCode('');
                    setErrorMessage('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  정보 다시 입력하기
                </button>
              </div>
            </>
          )}

          {/* ============================================ */}
          {/* 3단계: 비밀번호 재설정 */}
          {/* ============================================ */}
          {step === 'reset' && (
            <>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔒</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{username}</strong>님의 새로운 비밀번호를 설정해주세요.
                </p>
              </div>

              {/* 새 비밀번호 입력 */}
              <div>
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="8자 이상, 영문+숫자+특수문자"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.
                </p>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-500 mt-1">
                    비밀번호가 일치합니다.
                  </p>
                )}
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <Button
                onClick={handleResetPassword}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '재설정 중...' : '비밀번호 재설정'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
