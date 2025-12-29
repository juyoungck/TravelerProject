/**
 * FindIdPage.tsx - 아이디 찾기 페이지
 * 이메일 인증을 통한 아이디 찾기
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface FindIdPageProps {
  onNavigate: (page: string) => void;
}

export function FindIdPage({ onNavigate }: FindIdPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundId, setFoundId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleFindId = () => {
    if (!name) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    // 목 데이터로 아이디 찾기 시뮬레이션
    setIsSearching(true);
    setTimeout(() => {
      setFoundId('user****');
      setIsSearching(false);
    }, 1000);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setFoundId('');
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
          <h1 className="text-center">아이디 찾기</h1>
        </div>

        <div className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          {!foundId ? (
            <>
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
                onClick={handleFindId}
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? '검색 중...' : '아이디 찾기'}
              </Button>
            </>
          ) : (
            <>
              {/* 결과 화면 */}
              <div className="text-center py-6">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✓</span>
                  </div>
                  <p className="text-gray-600 mb-2">회원님의 아이디는</p>
                  <p className="text-2xl font-bold text-blue-600 mb-4">{foundId}</p>
                  <p className="text-sm text-gray-500">
                    {email}로 가입된 아이디입니다.
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
