/**
 * NoticePage.tsx - 공지사항 및 자주 묻는 질문 페이지
 * 상단: 공지사항 (내용 전체 표시)
 * 하단: 자주 묻는 질문 (Q&A 나열)
 */

import { useEffect } from 'react';

/** NoticePage 컴포넌트 Props */
interface NoticePageProps {
  /** 스크롤 위치 (notice: 상단, faq: FAQ 섹션) */
  scrollTo?: 'notice' | 'faq';
}

/** 공지사항 데이터 타입 */
interface NoticeItem {
  id: number;
  date: string;
  title: string;
  content: string;
}

/** FAQ 데이터 타입 */
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

/** 공지사항 더미 데이터 */
const noticeData: NoticeItem[] = [
  {
    id: 1,
    date: '2025/05/01',
    title: '강원도에 폭설특보',
    content: '강원도에 폭설이 내려서 해당 지역에 눈이 15cm가 쌓였습니다. 이동에 각별히 유의해주시기 바랍니다.'
  },
  {
    id: 2,
    date: '2025/04/15',
    title: '서비스 점검 안내',
    content: '4월 20일 새벽 2시~4시 서버 점검이 예정되어 있습니다. 해당 시간에는 서비스 이용이 제한됩니다.'
  }
];

/** FAQ 더미 데이터 */
const faqData: FaqItem[] = [
  {
    id: 1,
    question: '회원가입은 어떻게 하나요?',
    answer: '우측 상단의 로그인/회원가입 버튼을 클릭하신 후, 회원가입 탭에서 필요한 정보를 입력하시면 가입이 완료됩니다.'
  },
  {
    id: 2,
    question: '플래너는 어떻게 만드나요?',
    answer: '로그인 후 상단 메뉴의 플래너를 클릭하시면 새로운 여행 플래너를 작성하실 수 있습니다. 날짜와 여행지를 선택하여 나만의 여행 계획을 세워보세요.'
  },
  {
    id: 3,
    question: '부산에도 눈이 내리나요?',
    answer: '2025년에는 예정이 없습니다. 최근 기록은 1999년입니다.'
  },
  {
    id: 4,
    question: '여행지 정보는 어디서 제공되나요?',
    answer: '한국관광공사 TourAPI를 통해 전국의 관광지, 문화시설, 축제, 숙박 등 다양한 여행 정보를 제공하고 있습니다. 매일 새벽 자동으로 최신 정보가 업데이트됩니다.'
  }
];

/**
 * NoticePage 컴포넌트
 * @param scrollTo - 스크롤 위치 지정
 */
export function NoticePage({ scrollTo }: NoticePageProps) {
  
  /** 페이지 로드 시 스크롤 위치 조정 */
  useEffect(() => {
    if (scrollTo === 'faq') {
      const faqSection = document.getElementById('faq-section');
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [scrollTo]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 공지사항 섹션 */}
      <section id="notice-section" className="mb-16">
        <h2 className="text-2xl font-bold mb-8">📢 공지사항</h2>
        
        <div className="space-y-4">
          {noticeData.map((notice) => (
            <div
              key={notice.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              {/* 날짜 + 제목 */}
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-gray-500">{notice.date}</span>
                <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
              </div>
              {/* 내용 */}
              <p className="text-gray-600">{notice.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 자주 묻는 질문 섹션 */}
      <section id="faq-section">
        <h2 className="text-2xl font-bold mb-8">❓ 자주 묻는 질문</h2>
        
        <div className="space-y-4">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              {/* 질문 */}
              <p className="font-semibold text-gray-900 mb-2">
                Q. {faq.question}
              </p>
              {/* 답변 */}
              <p className="text-gray-600">
                A. {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}