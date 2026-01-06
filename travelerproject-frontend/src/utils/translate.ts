/**
 * translate.ts - 번역 유틸리티
 * Google Translate (비공식) → 실패 시 MyMemory 백업
 * 페이지 전체 DOM 번역 + 캐싱 + DOM 변화 감지
 */

export const LANGUAGES = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// 메모리 캐시 (빠른 접근)
const memoryCache: Map<string, string> = new Map();

// 번역 중 여부 (중복 방지)
let isCurrentlyTranslating = false;

// DOM 감지용
let observer: MutationObserver | null = null;
let translateTimeout: ReturnType<typeof setTimeout> | null = null;

/** 현재 언어 저장/불러오기 */
export const saveLanguage = (lang: LanguageCode) => {
  localStorage.setItem('selectedLang', lang);
};

export const getSavedLanguage = (): LanguageCode => {
  return (localStorage.getItem('selectedLang') as LanguageCode) || 'ko';
};

/** 번역 캐시 저장 */
const saveToCache = (text: string, lang: LanguageCode, translated: string) => {
  const cacheKey = `trans_${lang}_${text}`;
  memoryCache.set(cacheKey, translated);
  if (text.length < 200) {
    try {
      localStorage.setItem(cacheKey, translated);
    } catch (e) {
      console.warn('캐시 저장 실패:', e);
    }
  }
};

/** 번역 캐시 불러오기 */
const getFromCache = (text: string, lang: LanguageCode): string | null => {
  const cacheKey = `trans_${lang}_${text}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    memoryCache.set(cacheKey, cached);
    return cached;
  }
  return null;
};

/** Google Translate (비공식) */
const googleTranslate = async (text: string, from: string, to: string): Promise<string> => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data && data[0]) {
    return data[0].map((item: any) => item[0]).join('');
  }
  throw new Error('Google 번역 실패');
};

/** MyMemory API (백업) */
const myMemoryTranslate = async (text: string, from: string, to: string): Promise<string> => {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  );
  const data = await response.json();
  
  if (data.responseStatus === 200) {
    return data.responseData.translatedText;
  }
  throw new Error('MyMemory 번역 실패');
};

/** 텍스트 번역 (캐시 우선) */
export const translateText = async (text: string, from: string, to: string): Promise<string> => {
  if (!text.trim()) return '';
  if (from === to) return text;

  const cached = getFromCache(text, to as LanguageCode);
  if (cached) {
    return cached;
  }

  try {
    const result = await googleTranslate(text, from, to);
    saveToCache(text, to as LanguageCode, result);
    return result;
  } catch {
    try {
      const result = await myMemoryTranslate(text, from, to);
      saveToCache(text, to as LanguageCode, result);
      return result;
    } catch {
      return text;
    }
  }
};

/** 이미 번역된 노드 표시용 속성 */
const TRANSLATED_ATTR = 'data-translated';

/**
 * 페이지 전체 번역 (DOM 직접 수정)
 */
export const translatePage = async (
  targetLang: LanguageCode,
  onProgress?: (percent: number) => void
): Promise<void> => {
  saveLanguage(targetLang);
  
  if (targetLang === 'ko') {
    window.location.reload();
    return;
  }

  if (isCurrentlyTranslating) {
    console.log('이미 번역 중...');
    return;
  }
  
  isCurrentlyTranslating = true;

  try {
    const textNodes: { node: Text; original: string }[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          if (parent.getAttribute(TRANSLATED_ATTR) === targetLang) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const tagName = parent.tagName;
          if (tagName === 'SCRIPT' || 
              tagName === 'STYLE' || 
              tagName === 'TEXTAREA' ||
              tagName === 'INPUT' ||
              tagName === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          
          if (!node.textContent?.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      textNodes.push({ 
        node: currentNode as Text, 
        original: currentNode.textContent || '' 
      });
    }

    if (textNodes.length === 0) {
      console.log('번역할 새 텍스트 없음');
      return;
    }

    console.log(`번역할 텍스트 노드: ${textNodes.length}개`);

    const batchSize = 10;
    const totalBatches = Math.ceil(textNodes.length / batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const batch = textNodes.slice(i * batchSize, (i + 1) * batchSize);
      
      const promises = batch.map(async (item) => {
        try {
          const translated = await translateText(item.original.trim(), 'ko', targetLang);
          item.node.textContent = translated;
          
          if (item.node.parentElement) {
            item.node.parentElement.setAttribute(TRANSLATED_ATTR, targetLang);
          }
        } catch (error) {
          console.error('텍스트 번역 실패:', item.original, error);
        }
      });
      
      await Promise.all(promises);
      
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalBatches) * 100));
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('페이지 번역 완료!');
  } finally {
    isCurrentlyTranslating = false;
  }
};

/**
 * DOM 변화 감지 시작
 */
export const startWatchingDOM = () => {
  const savedLang = getSavedLanguage();
  if (savedLang === 'ko') return;

  stopWatchingDOM();

  observer = new MutationObserver(() => {
    if (translateTimeout) {
      clearTimeout(translateTimeout);
    }
    
    translateTimeout = setTimeout(async () => {
      await translatePage(savedLang);
    }, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('DOM 감지 시작');
};

/**
 * DOM 변화 감지 중지
 */
export const stopWatchingDOM = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (translateTimeout) {
    clearTimeout(translateTimeout);
    translateTimeout = null;
  }
};

/**
 * 페이지 변경 시 호출 (App.tsx에서 사용)
 */
export const onPageChange = async () => {
  const savedLang = getSavedLanguage();
  if (savedLang !== 'ko') {
    stopWatchingDOM();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await translatePage(savedLang);
    
    startWatchingDOM();
  }
};