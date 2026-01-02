/**
 * SignupPage.tsx - 회원가입 페이지
 * 
 * 일반 회원가입 + 소셜 가입 모드 지원
 * 소셜 모드: 아이디/비밀번호/이메일은 비활성화, 추가정보만 입력
 * 
 * API 연동 완료
 */

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PrivacyModal } from '../../components/modals/PrivacyModal';
import { authApi } from '../../api/authApi';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  // 소셜 가입 모드 여부
  const [isSocialMode, setIsSocialMode] = useState(false);
  
  // 모달 상태
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  
  // 입력값 상태
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [birth, setBirth] = useState('');
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [verificationCode, setVerificationCode] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  
  // 중복체크 상태
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // 전체 이메일 주소 생성
  const fullEmail = `${emailId}@${emailDomain}`;

  /**
   * 컴포넌트 마운트 시 소셜 가입 모드 확인
   */
  useEffect(() => {
    const socialMode = localStorage.getItem('socialSignupMode');
    
    if (socialMode === 'true') {
      setIsSocialMode(true);
      // 소셜 모드면 개인정보 동의 기본 체크 (소셜 로그인 시 이미 동의한 것으로 간주)
      setIsPrivacyChecked(true);
    }
    
    // cleanup: 페이지 떠날 때 플래그 제거
    return () => {
      localStorage.removeItem('socialSignupMode');
    };
  }, []);

  /**
   * 아이디 중복 체크
   */
  const handleCheckUsername = async () => {
    if (!username.trim()) {
      alert('아이디를 입력하세요.');
      return;
    }
    
    // 아이디 유효성 검사 (영문, 숫자 4~20자)
    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!usernameRegex.test(username)) {
      alert('아이디는 영문, 숫자 4~20자로 입력하세요.');
      return;
    }

    try {
      const response = await authApi.checkUsername(username) as any;
      if (response.available) {
        alert('사용 가능한 아이디입니다.');
        setIsUsernameChecked(true);
      } else {
        alert('이미 사용 중인 아이디입니다.');
        setIsUsernameChecked(false);
      }
    } catch (error) {
      console.error('아이디 중복체크 오류:', error);
      alert('중복체크 중 오류가 발생했습니다.');
    }
  };

  /**
   * 닉네임 중복 체크
   */
  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }

    // 닉네임 유효성 검사 (2~10자)
    if (nickname.length < 2 || nickname.length > 10) {
      alert('닉네임은 2~10자로 입력하세요.');
      return;
    }

    try {
      const response = await authApi.checkNickname(nickname) as any;
      if (response.available) {
        alert('사용 가능한 닉네임입니다.');
        setIsNicknameChecked(true);
      } else {
        alert('이미 사용 중인 닉네임입니다.');
        setIsNicknameChecked(false);
      }
    } catch (error) {
      console.error('닉네임 중복체크 오류:', error);
      alert('중복체크 중 오류가 발생했습니다.');
    }
  };

  /**
   * 이메일 중복 체크
   */
  const handleCheckEmail = async () => {
    if (!emailId.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }

    try {
      const response = await authApi.checkEmail(fullEmail) as any;
      if (response.available) {
        alert('사용 가능한 이메일입니다.');
        setIsEmailChecked(true);
      } else {
        alert('이미 사용 중인 이메일입니다.');
        setIsEmailChecked(false);
      }
    } catch (error) {
      console.error('이메일 중복체크 오류:', error);
      alert('중복체크 중 오류가 발생했습니다.');
    }
  };

  /**
   * 이메일 인증코드 발송
   */
  const handleSendVerificationCode = async () => {
    if (!isEmailChecked) {
      alert('이메일 중복확인을 먼저 해주세요.');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await authApi.sendVerificationCode(fullEmail) as any;
      if (response.status === 'success') {
        alert('인증코드가 이메일로 전송되었습니다. 5분 내에 입력해주세요.');
      } else {
        alert(response.message || '인증코드 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증코드 전송 오류:', error);
      alert('인증코드 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  /**
   * 이메일 인증코드 확인
   */
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      alert('인증코드를 입력하세요.');
      return;
    }

    try {
      const response = await authApi.verifyEmailCode(fullEmail, verificationCode) as any;
      if (response.status === 'success') {
        alert('이메일 인증이 완료되었습니다.');
        setIsEmailVerified(true);
      } else {
        alert(response.message || '인증코드가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('인증코드 확인 오류:', error);
      alert('인증코드 확인 중 오류가 발생했습니다.');
    }
  };

  /**
   * 소셜 가입 모드 - 추가정보 저장
   */
  const handleSocialSignup = async () => {
    // 유효성 검사
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    if (!isNicknameChecked) {
      alert('닉네임 중복확인을 해주세요.');
      return;
    }
    if (!phone.trim()) {
      alert('전화번호를 입력하세요.');
      return;
    }
    if (!gender) {
      alert('성별을 선택하세요.');
      return;
    }
    if (!birth) {
      alert('생년월일을 입력하세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 회원정보 업데이트 API 호출 (PUT /api/auth/me)
      const updateData = {
        nickname,
        phone,
        gender,
        birth
      };

      const response = await authApi.updateMyInfo(updateData) as any;
      
      if (response.status === 'success') {
        alert('정보가 저장되었습니다!');
        localStorage.removeItem('socialSignupMode');
        onNavigate('home');
      } else {
        alert(response.message || '저장에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('추가정보 저장 오류:', error);
      const errorMessage = error.response?.data?.message || '저장 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 일반 회원가입 처리
   */
  const handleNormalSignup = async () => {
    // 유효성 검사
    if (!username.trim()) {
      alert('아이디를 입력하세요.');
      return;
    }
    if (!isUsernameChecked) {
      alert('아이디 중복확인을 해주세요.');
      return;
    }
    if (!password.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    // 비밀번호 유효성 검사 (8자 이상, 영문+숫자+특수문자)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert('비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    if (!isNicknameChecked) {
      alert('닉네임 중복확인을 해주세요.');
      return;
    }
    if (!emailId.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }
    if (!isEmailChecked) {
      alert('이메일 중복확인을 해주세요.');
      return;
    }
    if (!isEmailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    if (!isPrivacyChecked) {
      alert('개인정보 제공 동의가 필요합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const signupData = {
        username,
        password,
        passwordConfirm,
        email: fullEmail,
        nickname,
        verificationCode,
        birth: birth || undefined,
        gender: gender || undefined,
        phone: phone || undefined,
      };

      const response = await authApi.signup(signupData as any) as any;
      
      if (response.status === 'success') {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        onNavigate('login');
      } else {
        alert(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      const errorMessage = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 제출 핸들러 - 모드에 따라 분기
   */
  const handleSubmit = () => {
    if (isSocialMode) {
      handleSocialSignup();
    } else {
      handleNormalSignup();
    }
  };

  // 입력값 변경 시 중복체크 상태 초기화
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setIsUsernameChecked(false);
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setIsNicknameChecked(false);
  };

  const handleEmailChange = (value: string) => {
    setEmailId(value);
    setIsEmailChecked(false);
    setIsEmailVerified(false);
  };

  const handleEmailDomainChange = (value: string) => {
    setEmailDomain(value);
    setIsEmailChecked(false);
    setIsEmailVerified(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center">
          {isSocialMode ? '추가 정보 입력' : '회원가입'}
        </h1>
        
        {/* 소셜 가입 모드 안내 */}
        {isSocialMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm">
              🎉 소셜 로그인이 완료되었습니다!<br/>
              서비스 이용을 위해 추가 정보를 입력해주세요.
            </p>
          </div>
        )}
        
        <div className="space-y-4 bg-white p-8 rounded-lg shadow-lg">
          {/* 아이디 */}
          <div>
            <Label htmlFor="signup-username">아이디 {!isSocialMode && '*'}</Label>
            <div className="flex gap-2">
              <Input 
                id="signup-username" 
                type="text" 
                placeholder={isSocialMode ? "소셜 로그인 사용자" : "영문, 숫자 4~20자"}
                className={`flex-1 ${isSocialMode ? "bg-gray-100 text-gray-500" : ""}`}
                value={isSocialMode ? "소셜 로그인" : username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={isSocialMode}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCheckUsername}
                className={`whitespace-nowrap ${isSocialMode ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSocialMode || isUsernameChecked}
              >
                {isUsernameChecked ? '확인완료' : '중복확인'}
              </Button>
            </div>
          </div>
          
          {/* 비밀번호 */}
          <div>
            <Label htmlFor="signup-password">비밀번호 {!isSocialMode && '*'}</Label>
            <Input 
              id="signup-password" 
              type="password" 
              placeholder={isSocialMode ? "소셜 로그인은 비밀번호가 필요없습니다" : "8자 이상, 영문+숫자+특수문자"}
              className={isSocialMode ? "bg-gray-100 text-gray-500" : ""}
              value={isSocialMode ? "" : password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSocialMode}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <Label htmlFor="signup-password-confirm">비밀번호 확인 {!isSocialMode && '*'}</Label>
            <Input 
              id="signup-password-confirm" 
              type="password" 
              placeholder={isSocialMode ? "소셜 로그인은 비밀번호가 필요없습니다" : "비밀번호를 다시 입력하세요"}
              className={isSocialMode ? "bg-gray-100 text-gray-500" : ""}
              value={isSocialMode ? "" : passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isSocialMode}
            />
            {!isSocialMode && passwordConfirm && password !== passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <Label htmlFor="signup-email">이메일 {!isSocialMode && '*'}</Label>
            <div className="flex gap-2 items-center mb-2">
              <Input 
                id="signup-email" 
                type="text" 
                placeholder={isSocialMode ? "소셜 계정 이메일 사용" : "이메일"}
                className={`flex-1 ${isSocialMode ? "bg-gray-100 text-gray-500" : ""}`}
                value={isSocialMode ? "소셜 이메일" : emailId}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isSocialMode}
              />
              {!isSocialMode && (
                <>
                  <span>@</span>
                  <select 
                    value={emailDomain}
                    onChange={(e) => handleEmailDomainChange(e.target.value)}
                    className="border rounded px-3 py-2 flex-1"
                    disabled={isSocialMode}
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
                    onClick={handleCheckEmail}
                    className="whitespace-nowrap"
                    disabled={isEmailChecked}
                  >
                    {isEmailChecked ? '확인완료' : '중복확인'}
                  </Button>
                </>
              )}
            </div>
            {!isSocialMode && (
              <div className="flex gap-2">
                <Input 
                  id="verification-code" 
                  type="text" 
                  placeholder="인증코드 6자리" 
                  className="flex-1"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isEmailVerified}
                />
                {!isEmailVerified ? (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSendVerificationCode}
                      className="whitespace-nowrap"
                      disabled={!isEmailChecked || isSendingCode}
                    >
                      {isSendingCode ? '전송중...' : '전송'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleVerifyCode}
                      className="whitespace-nowrap"
                      disabled={!verificationCode}
                    >
                      확인
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="whitespace-nowrap"
                    disabled
                  >
                    인증완료 ✓
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 구분선 - 소셜 모드일 때만 */}
          {isSocialMode && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">아래 정보를 입력해주세요</span>
              </div>
            </div>
          )}

          {/* 닉네임 */}
          <div>
            <Label htmlFor="signup-nickname">닉네임 *</Label>
            <div className="flex gap-2">
              <Input 
                id="signup-nickname" 
                type="text" 
                placeholder="2~10자" 
                className="flex-1"
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCheckNickname}
                className="whitespace-nowrap"
                disabled={isNicknameChecked}
              >
                {isNicknameChecked ? '확인완료' : '중복확인'}
              </Button>
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <Label htmlFor="signup-birth">생년월일 {isSocialMode ? '' : '(선택)'}</Label>
            <Input 
              id="signup-birth" 
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
            />
          </div>

          {/* 전화번호 */}
          <div>
            <Label htmlFor="signup-phone">전화번호 {isSocialMode ? '' : ''}</Label>
            <Input 
              id="signup-phone" 
              type="tel" 
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* 성별 */}
          <div>
            <Label>성별 {isSocialMode ? '*' : '(선택)'}</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value="M"
                  checked={gender === 'M'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>남성</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value="F"
                  checked={gender === 'F'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>여성</span>
                </label>
            </div>
          </div>

          {/* 개인정보 동의 - 일반 모드만 */}
          {!isSocialMode && (
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
          )}
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : (isSocialMode ? '저장하기' : '회원가입')}
          </Button>
          
          {/* 로그인 링크 - 일반 모드만 */}
          {!isSocialMode && (
            <div className="text-center">
              <button 
                onClick={() => onNavigate('login')}
                className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          )}
        </div>
      </div>

      <PrivacyModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
