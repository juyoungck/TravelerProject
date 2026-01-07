/**
 * OAuth2CallbackPage.tsx - 소셜 로그인 콜백 처리 페이지
 * 
 * 백엔드에서 소셜 로그인 완료 후 이 페이지로 리다이렉트됨
 * URL 파라미터에서 토큰을 추출하여 저장하고 메인 페이지로 이동
 * 
 * URL 형식:
 * - 성공: /oauth2/callback?accessToken=xxx&refreshToken=xxx&tokenType=Bearer&expiresIn=1800
 * - 실패: /oauth2/callback?error=에러메시지
 * 
 * @author TravelerProject
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { setAccessToken, setRefreshToken } from '../../api/api';

interface OAuth2CallbackPageProps {
  /** 로그인 성공 시 호출될 콜백 */
  onLoginSuccess?: (tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    member?: any;
  }) => void;
}

export function OAuth2CallbackPage({ onLoginSuccess }: OAuth2CallbackPageProps) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // URL 파라미터에서 값 추출
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const tokenType = searchParams.get('tokenType');
    const expiresIn = searchParams.get('expiresIn');
    const error = searchParams.get('error');

    // 에러 처리
    if (error) {
      setStatus('error');
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    // 토큰 확인
    if (accessToken && refreshToken) {
      // 1. 토큰 먼저 저장 (API 호출에 필요)
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      // 2. 회원 정보 조회 API 호출
      const fetchMemberInfo = async () => {
        try {
          const response = await api.get('/auth/me');
          
          if (response.data.status === 'success') {
            // 3. 회원 정보 저장
            const member = response.data.data;
            localStorage.setItem('memberInfo', JSON.stringify(member));
            
            // 4. 콜백 호출 (App.tsx에서 상태 업데이트)
            if (onLoginSuccess) {
              onLoginSuccess({
                accessToken,
                refreshToken,
                tokenType: tokenType || 'Bearer',
                expiresIn: parseInt(expiresIn || '1800', 10),
                member,
              });
            }
            
            setStatus('success');

            // 5. 1.5초 후 메인 페이지로 이동
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          } else {
            throw new Error('회원 정보 조회 실패');
          }
        } catch (err: any) {
          console.error('회원 정보 조회 실패:', err);
          setStatus('error');
          setErrorMessage(err.response?.data?.message || '회원 정보를 불러올 수 없습니다.');
        }
      };

      fetchMemberInfo();
    } else {
      setStatus('error');
      setErrorMessage('로그인 정보를 받아올 수 없습니다.');
    }
  }, [searchParams, onLoginSuccess]);

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        
        {/* 로딩 상태 */}
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </>
        )}

        {/* 성공 상태 */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">로그인 성공!</h2>
            <p className="text-gray-600">메인 페이지로 이동합니다...</p>
          </>
        )}

        {/* 에러 상태 */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">로그인 실패</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => window.location.href = '/?page=login'}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuth2CallbackPage;