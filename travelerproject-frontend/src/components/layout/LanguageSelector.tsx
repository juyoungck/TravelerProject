/**
 * LanguageSelector.tsx - 언어 선택 컴포넌트
 * 선택 시 페이지 전체 번역 (AI 번역)
 */

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { LANGUAGES, translatePage, getSavedLanguage, startWatchingDOM, stopWatchingDOM } from '../../utils/translate';
import type { LanguageCode } from '../../utils/translate';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('ko');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);

  const languages = [
    { code: 'ko' as LanguageCode, name: '한국어', flag: '🇰🇷' },
    { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
    { code: 'ja' as LanguageCode, name: '日本語', flag: '🇯🇵' },
    { code: 'zh' as LanguageCode, name: '中文', flag: '🇨🇳' },
  ];

  /** 컴포넌트 마운트 시 */
  useEffect(() => {
    const savedLang = getSavedLanguage();
    setCurrentLang(savedLang);
    
    // 한국어가 아니면 DOM 감지 시작 + 초기 번역
    if (savedLang !== 'ko') {
      // DOM 감지 먼저 시작
      startWatchingDOM();
      
      // 초기 번역 (약간의 딜레이 후)
      const timer = setTimeout(async () => {
        setIsTranslating(true);
        try {
          await translatePage(savedLang, (percent) => {
            setProgress(percent);
          });
        } finally {
          setIsTranslating(false);
          setProgress(0);
        }
      }, 800);

      return () => {
        clearTimeout(timer);
        stopWatchingDOM();
      };
    }
  }, []);

  /** 언어 선택 시 페이지 전체 번역 */
  const handleSelectLanguage = async (lang: LanguageCode) => {
    setIsOpen(false);
    
    if (lang === currentLang) return;
    
    // 기존 DOM 감지 중지
    stopWatchingDOM();
    
    setIsTranslating(true);
    setProgress(0);
    
    try {
      await translatePage(lang, (percent) => {
        setProgress(percent);
      });
      setCurrentLang(lang);
      
      // 한국어가 아니면 DOM 감지 시작
      if (lang !== 'ko') {
        startWatchingDOM();
      }
    } catch (error) {
      console.error('페이지 번역 실패:', error);
      alert('번역 중 오류가 발생했습니다.');
    } finally {
      setIsTranslating(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className="flex items-center gap-2"
      >
        <Globe className={`h-5 w-5 ${isTranslating ? 'animate-spin' : ''}`} />
        <span className="hidden lg:inline">
          {isTranslating ? `${progress}%` : LANGUAGES[currentLang]}
        </span>
      </Button>

      {isOpen && !isTranslating && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-[100px] bg-white rounded-lg shadow-lg border p-2 z-[9999] min-w-[150px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition-colors ${
                  currentLang === lang.code ? 'bg-blue-50 text-blue-600 font-medium' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
      
      {/* 번역 중 오버레이 */}
      {isTranslating && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <Globe className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="font-medium text-lg mb-2">AI 번역 중...</p>
            <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-3">{progress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}