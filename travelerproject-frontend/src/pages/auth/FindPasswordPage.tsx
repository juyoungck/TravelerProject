/**
 * FindPasswordPage.tsx - 비밀번호 찾기 페이지
 * 아이디/이메일 인증을 통한 비밀번호 재설정
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface FindPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function FindPasswordPage({ onNavigate }: FindPasswordPageProps) {
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleVerify = () => {
    if (!userId) {
      alert('아이디를 입력해주세요.');
      return;
    }

    if (!name) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    // 목 데이터로 본인 확인 시뮬레이션
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('reset');
    }, 1000);
  };

  const handleResetPassword = () => {
    if (!newPassword) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 재설정 시뮬레이션
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      alert('비밀번호가 재설정되었습니다.');
      onNavigate('login');
    }, 1000);
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
          <h1 className="text-center">비밀번호 찾기</h1>
        </div>

        <div className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          {step === 'verify' ? (
            <>
              {/* 본인 확인 단계 */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  회원정보에 등록된 정보로 본인 확인 후<br />
                  비밀번호를 재설정할 수 있습니다.
                </p>
              </div>

              {/* 아이디 입력 */}
              <div>
                <Label htmlFor="userId">아이디</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              {/* 이름 입력 */}
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                onClick={handleVerify}
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? '확인 중...' : '본인 확인'}
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
          ) : (
            <>
              {/* 비밀번호 재설정 단계 */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔒</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{userId}</strong>님의 새로운 비밀번호를 설정해주세요.
                </p>
              </div>

              {/* 새 비밀번호 입력 */}
              <div>
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="8자 이상 입력하세요"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.
                </p>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>

              <Button
                onClick={handleResetPassword}
                className="w-full"
                disabled={isResetting}
              >
                {isResetting ? '재설정 중...' : '비밀번호 재설정'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
