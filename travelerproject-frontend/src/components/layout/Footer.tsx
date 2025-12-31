/**
 * Footer.tsx - 푸터 컴포넌트
 * 왼쪽: 로고 + 소개글
 * 중앙: 공지사항, 자주 묻는 질문, 이용약관, 개인정보처리방침
 * 하단: 저작권 + 팀원 정보 (중앙 정렬)
 */

import { useState } from 'react';
import { MapPin } from 'lucide-react';

/** Footer 컴포넌트 Props 인터페이스 */
interface FooterProps {
  /** 페이지 이동 핸들러 (page, scrollTo) */
  onNavigate: (page: string, scrollTo?: string) => void;
}

/**
 * Footer 컴포넌트
 * @param onNavigate - 페이지 이동 함수
 */
export function Footer({ onNavigate }: FooterProps) {
  /** 이용약관 모달 상태 */
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  /** 개인정보처리방침 모달 상태 */
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-gray-300">
        {/* 메인 푸터 영역 */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8">
            
            {/* 왼쪽: 로고 + 소개글 */}
            <div>
              {/* 로고 */}
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-xl text-white">어디갈래?</span>
              </div>
              {/* 소개글 */}
              <p className="text-sm leading-relaxed text-gray-400">
                대한민국 구석구석, 당신만의 특별한 여행을 계획해보세요.<br />
                여행지 정보부터 플래너 작성까지, 어디갈래?가 함께합니다.
              </p>
            </div>

            {/* 중앙: 링크 목록 */}
            <div className="text-center">
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate('notice', 'notice')}
                    className="hover:text-white transition-colors"
                  >
                    공지사항
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('notice', 'faq')}
                    className="hover:text-white transition-colors"
                  >
                    자주 묻는 질문
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsTermsOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    이용약관
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsPrivacyOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    개인정보처리방침
                  </button>
                </li>
              </ul>
            </div>

            {/* 오른쪽: 빈 공간 (균형용) */}
            <div></div>
          </div>
        </div>

        {/* 하단 저작권 영역 */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center gap-1 text-sm text-gray-500">
              <p>© 2025 어디갈래 All rights reserved.</p>
              <p>Made by 김주영 박중건 백승진 안태호 이현성</p>
            </div>
          </div>
        </div>
      </footer>

      {/* 이용약관 모달 */}
      {isTermsOpen && (
        <TermsModal onClose={() => setIsTermsOpen(false)} />
      )}

      {/* 개인정보처리방침 모달 */}
      {isPrivacyOpen && (
        <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />
      )}
    </>
  );
}

/**
 * 이용약관 모달 컴포넌트
 */
function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">이용약관</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">제1조 (목적)</h4>
              <p>
                이 약관은 어디갈래(이하 "서비스")가 제공하는 여행 정보 서비스의 
                이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제2조 (정의)</h4>
              <ul className="list-disc ml-5 space-y-1">
                <li>"서비스"란 회사가 제공하는 여행 정보 및 플래너 기능을 말합니다.</li>
                <li>"회원"이란 서비스에 가입하여 이용하는 자를 말합니다.</li>
                <li>"콘텐츠"란 서비스에 게시된 여행 정보, 리뷰, 플래너 등을 말합니다.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제3조 (약관의 효력 및 변경)</h4>
              <p>
                이 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다. 
                회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 
                서비스 내 공지사항을 통해 공지합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제4조 (서비스의 제공)</h4>
              <p>회사는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>여행지 정보 제공</li>
                <li>여행 플래너 작성 및 관리</li>
                <li>여행 후기 및 리뷰 게시</li>
                <li>여행지 검색 및 추천</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제5조 (회원의 의무)</h4>
              <p>회원은 다음 사항을 준수해야 합니다:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>타인의 개인정보를 도용하지 않습니다.</li>
                <li>서비스의 정상적인 운영을 방해하지 않습니다.</li>
                <li>불법적인 목적으로 서비스를 이용하지 않습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 개인정보처리방침 모달 컴포넌트
 */
function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">개인정보처리방침</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">1. 개인정보의 수집 및 이용 목적</h4>
              <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                <li>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별</li>
                <li>마케팅 및 광고에 활용: 이벤트 정보 및 참여기회 제공</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. 수집하는 개인정보 항목</h4>
              <p>회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>필수항목: 아이디, 비밀번호, 닉네임, 이메일, 휴대전화번호</li>
                <li>선택항목: 생년월일, 성별</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. 개인정보의 보유 및 이용기간</h4>
              <p>
                원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 
                지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 
                있는 경우 회사는 관계법령에서 정한 일정한 기간 동안 회원정보를 
                보관합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4. 개인정보의 파기절차 및 방법</h4>
              <p>
                회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 
                해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다:
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>파기절차: 회원이 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 
                    일정 기간 저장된 후 파기됩니다.</li>
                <li>파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 
                    기술적 방법을 사용합니다.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5. 개인정보 보호책임자</h4>
              <p>
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 
                개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 
                아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="mt-2 bg-gray-50 p-3 rounded">
                <p>▶ 개인정보 보호책임자</p>
                <p>- 성명: 어디갈래 관리자</p>
                <p>- 연락처: traveler@example.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}