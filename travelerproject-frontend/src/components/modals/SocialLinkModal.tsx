/**
 * SocialLinkModal.tsx
 * 소셜 계정 연동 시 닉네임 선택 모달
 * 
 * 기존 닉네임 유지 또는 소셜 닉네임 사용 선택
 * 
 * @author TravelerProject
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface SocialLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;           // KAKAO, NAVER, GOOGLE
  socialNickname: string;     // 소셜 닉네임
  currentNickname: string;    // 현재 닉네임
  onConfirm: (useSocialNickname: boolean) => void;
}

export function SocialLinkModal({
  isOpen,
  onClose,
  provider,
  socialNickname,
  currentNickname,
  onConfirm
}: SocialLinkModalProps) {
  const [selectedOption, setSelectedOption] = useState<'current' | 'social'>('current');

  if (!isOpen) return null;

  // 제공자별 한글 이름
  const providerName = {
    'KAKAO': '카카오',
    'NAVER': '네이버',
    'GOOGLE': '구글'
  }[provider] || provider;

  // 제공자별 색상
  const providerColor = {
    'KAKAO': 'bg-yellow-400 text-black',
    'NAVER': 'bg-green-500 text-white',
    'GOOGLE': 'bg-white border-2 text-gray-700'
  }[provider] || 'bg-gray-500 text-white';

  const handleConfirm = () => {
    onConfirm(selectedOption === 'social');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">소셜 계정 연동</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* 내용 */}
        <div className="p-6">
          {/* 연동 안내 */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${providerColor} mb-4`}>
            <span className="font-medium">{providerName}</span>
          </div>
          
          <p className="text-gray-600 mb-6">
            {providerName} 계정을 연동합니다.<br/>
            사용할 닉네임을 선택해주세요.
          </p>
          
          {/* 닉네임 선택 */}
          <div className="space-y-3">
            {/* 기존 닉네임 유지 */}
            <label 
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedOption === 'current' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="nickname"
                value="current"
                checked={selectedOption === 'current'}
                onChange={() => setSelectedOption('current')}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium">기존 닉네임 유지</div>
                <div className="text-sm text-gray-500">{currentNickname}</div>
              </div>
            </label>
            
            {/* 소셜 닉네임 사용 */}
            <label 
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedOption === 'social' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="nickname"
                value="social"
                checked={selectedOption === 'social'}
                onChange={() => setSelectedOption('social')}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium">{providerName} 닉네임 사용</div>
                <div className="text-sm text-gray-500">
                  {socialNickname || '(닉네임 없음)'}
                </div>
              </div>
            </label>
          </div>
          
          {/* 안내 문구 */}
          <p className="text-xs text-gray-400 mt-4">
            * 닉네임이 중복될 경우 자동으로 숫자가 붙을 수 있습니다.
          </p>
        </div>
        
        {/* 버튼 */}
        <div className="flex gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            연동하기
          </Button>
        </div>
      </div>
    </div>
  );
}
