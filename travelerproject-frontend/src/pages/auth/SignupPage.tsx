/**
 * SignupPage.tsx - 회원가입 페이지
 * 이메일, 비밀번호, 개인정보 처리방침 동의 등
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PrivacyModal } from '../../components/modals/PrivacyModal';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [emailDomain, setEmailDomain] = useState('naver.com');

  const handleCheckDuplicate = (type: string) => {
    alert(`${type} 중복체크가 완료되었습니다.`);
  };

  const handleSendVerificationCode = () => {
    alert('인증코드가 전송되었습니다.');
  };

  const handleSignup = () => {
    if (!isPrivacyChecked) {
      alert('개인정보 제공 동의가 필요합니다.');
      return;
    }
    alert('회원가입이 완료되었습니다.');
    onNavigate('login');
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center">회원가입</h1>
        
        <div className="space-y-4 bg-white p-8 rounded-lg shadow-lg">
          {/* 아이디 */}
          <div>
            <Label htmlFor="signup-username">아이디</Label>
            <div className="flex gap-2">
              <Input id="signup-username" type="text" placeholder="아이디를 입력하세요" className="flex-1" />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleCheckDuplicate('아이디')}
                className="whitespace-nowrap"
              >
                중복확인
              </Button>
            </div>
          </div>
          
          {/* 비밀번호 */}
          <div>
            <Label htmlFor="signup-password">비밀번호</Label>
            <Input id="signup-password" type="password" placeholder="비밀번호를 입력하세요" />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
            <Input id="signup-password-confirm" type="password" placeholder="비밀번호를 다시 입력하세요" />
          </div>

          {/* 닉네임 */}
          <div>
            <Label htmlFor="signup-nickname">닉네임</Label>
            <div className="flex gap-2">
              <Input id="signup-nickname" type="text" placeholder="닉네임을 입력하세요" className="flex-1" />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleCheckDuplicate('닉네임')}
                className="whitespace-nowrap"
              >
                중복확인
              </Button>
            </div>
          </div>

          {/* 이름 */}
          <div>
            <Label htmlFor="signup-name">이름</Label>
            <Input id="signup-name" type="text" placeholder="이름을 입력하세요" />
          </div>

          {/* 생년월일 */}
          <div>
            <Label htmlFor="signup-birth">생년월일</Label>
            <Input id="signup-birth" type="date" />
          </div>

          {/* 이메일 */}
          <div>
            <Label htmlFor="signup-email">이메일</Label>
            <div className="flex gap-2 items-center mb-2">
              <Input 
                id="signup-email" 
                type="text" 
                placeholder="이메일" 
                className="flex-1"
              />
              <span>@</span>
              <select 
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              >
                <option value="naver.com">naver.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="daum.net">daum.net</option>
                <option value="kakao.com">kakao.com</option>
                <option value="hanmail.net">hanmail.net</option>
              </select>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleCheckDuplicate('이메일')}
                className="whitespace-nowrap"
              >
                중복확인
              </Button>
            </div>
            <div className="flex gap-2">
              <Input 
                id="verification-code" 
                type="text" 
                placeholder="확인코드를 입력하세요" 
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSendVerificationCode}
                className="whitespace-nowrap"
              >
                전송
              </Button>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <Label>성별</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="gender" value="male" />
                <span>남성</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="gender" value="female" />
                <span>여성</span>
              </label>
            </div>
          </div>

          {/* 개인정보 동의 */}
          <div className="pt-4 border-t">
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPrivacyChecked}
                onChange={(e) => setIsPrivacyChecked(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                개인정보 제공에 동의합니다. 
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-blue-600 hover:underline ml-1"
                >
                  [자세히 보기]
                </button>
              </span>
            </label>
          </div>
          
          <Button onClick={handleSignup} className="w-full">회원가입</Button>
          
          <div className="text-center">
            <button 
              onClick={() => onNavigate('login')}
              className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </div>
        </div>
      </div>

      <PrivacyModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}