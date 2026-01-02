/**
 * SocialLinkSection.tsx
 * 마이페이지 소셜 연동 섹션
 * 
 * 요구사항 USER-011:
 * - 미연동 상태면 연동하기 버튼 표시
 * - 연동 완료 상태면 연동 완료 텍스트 표시
 * 
 * @author TravelerProject
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { socialApi } from '../api/socialApi';
import type { SocialLinkStatus } from '../api/socialApi';
interface SocialLinkSectionProps {
  onLinkStart: (provider: string) => void;
}

export function SocialLinkSection({ onLinkStart }: SocialLinkSectionProps) {
  const [linkStatus, setLinkStatus] = useState<SocialLinkStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 연동 상태 조회
  useEffect(() => {
    fetchLinkStatus();
  }, []);

  const fetchLinkStatus = async () => {
    try {
      const response = await socialApi.getSocialLinkStatus();
      if (response.status === 'success' && response.data) {
        setLinkStatus(response.data);
      }
    } catch (error) {
      console.error('소셜 연동 상태 조회 실패:', error);
      // 기본값 설정
      setLinkStatus([
        { provider: 'KAKAO', linked: false },
        { provider: 'NAVER', linked: false },
        { provider: 'GOOGLE', linked: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 연동하기 클릭
  const handleLinkClick = (provider: string) => {
    // 소셜 로그인 페이지로 이동
    const linkUrl = socialApi.getSocialLinkUrl(provider);
    window.location.href = linkUrl;
  };

  // 제공자별 스타일
  const getProviderStyle = (provider: string) => {
    switch (provider) {
      case 'KAKAO':
        return {
          icon: '🟡',
          name: '카카오',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'NAVER':
        return {
          icon: '🟢',
          name: '네이버',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'GOOGLE':
        return {
          icon: '🔵',
          name: '구글',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      default:
        return {
          icon: '⚪',
          name: provider,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="font-medium text-gray-700 mb-3">소셜 계정 연동</h3>
        <div className="text-center py-4 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-700 mb-3">소셜 계정 연동</h3>
      
      {linkStatus.map((status) => {
        const style = getProviderStyle(status.provider);
        
        return (
          <div 
            key={status.provider}
            className={`flex items-center justify-between p-4 rounded-lg border ${style.bgColor} ${style.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{style.icon}</span>
              <div>
                <span className={`font-medium ${style.textColor}`}>
                  {style.name}
                </span>
                {status.linked && status.socialEmail && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {status.socialEmail}
                  </p>
                )}
              </div>
            </div>
            
            {status.linked ? (
              <span className="text-sm text-green-600 font-medium px-3 py-1 bg-green-100 rounded-full">
                연동 완료
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLinkClick(status.provider)}
                className="text-sm"
              >
                연동하기
              </Button>
            )}
          </div>
        );
      })}
      
      <p className="text-xs text-gray-400 mt-2">
        * 소셜 계정을 연동하면 해당 계정으로도 로그인할 수 있습니다.
      </p>
    </div>
  );
}
