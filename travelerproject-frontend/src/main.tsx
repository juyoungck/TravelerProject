import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * 카카오맵 SDK 동적 로드
 * .env 파일의 VITE_KAKAO_MAP_API_KEY 사용
 */
const loadKakaoMapSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드됐으면 스킵
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log('카카오맵 SDK 로드 완료');
        resolve();
      });
    };
    
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
    
    document.head.appendChild(script);
  });
};

// SDK 로드 후 앱 렌더링
loadKakaoMapSDK()
  .then(() => {
    createRoot(document.getElementById('root')!).render(<App />);
  })
  .catch((error) => {
    console.error('카카오맵 로드 실패:', error);
    createRoot(document.getElementById('root')!).render(<App />);
  });