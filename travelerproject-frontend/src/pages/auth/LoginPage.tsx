/**
 * LoginPage.tsx - 로그인 페이지
 * 이메일/비밀번호 로그인 및 아이디/비밀번호 찾기 연결
 */

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username && password) {
      onLogin();
      onNavigate('home');
    } else {
      alert('아이디와 비밀번호를 입력해주세요.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center">로그인</h1>
        
        <div className="space-y-4 bg-white p-8 rounded-lg shadow-lg">
          <div>
            <Label htmlFor="username">아이디</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 text-xs text-gray-600">
            <button 
              onClick={() => onNavigate('find-id')}
              className="hover:text-blue-600 hover:underline"
            >
              아이디 찾기
            </button>
            <span>|</span>
            <button 
              onClick={() => onNavigate('find-password')}
              className="hover:text-blue-600 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>

          {/* 소셜 로그인 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => alert('카카오 로그인 페이지로 이동합니다.')}
              className="hover:opacity-80 transition-opacity"
              title="카카오 로그인"
            >
              <div className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </button>
            
            <button
              onClick={() => alert('네이버 로그인 페이지로 이동합니다.')}
              className="hover:opacity-80 transition-opacity"
              title="네이버 로그인"
            >
              <div className="w-12 h-12 rounded-full bg-[#03C75A] flex items-center justify-center">
                <span className="text-2xl font-bold text-white">N</span>
              </div>
            </button>
            
            <button
              onClick={() => alert('구글 로그인 페이지로 이동합니다.')}
              className="hover:opacity-80 transition-opacity"
              title="구글 로그인"
            >
              <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                <span className="text-2xl font-bold">G</span>
              </div>
            </button>
          </div>
          
          <Button onClick={handleLogin} className="w-full">로그인</Button>
          
          <div className="text-center">
            <button 
              onClick={() => onNavigate('signup')}
              className="text-sm text-blue-600 hover:underline"
            >
              회원가입하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
