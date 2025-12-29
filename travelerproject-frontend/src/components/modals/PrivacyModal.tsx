/**
 * PrivacyModal.tsx - 개인정보처리방침 모달
 * 회원가입 시 개인정보처리방침 전문 표시
 */

import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3>개인정보 제공 동의</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="mb-2">1. 개인정보의 수집 및 이용 목적</h4>
              <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
              <ul className="list-disc ml-5 mt-2">
                <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                <li>회원 관리</li>
                <li>마케팅 및 광고에 활용</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2">2. 수집하는 개인정보 항목</h4>
              <p>회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
              <ul className="list-disc ml-5 mt-2">
                <li>필수항목: 아이디, 비밀번호, 닉네임, 이름, 생년월일, 성별, 이메일</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2">3. 개인정보의 보유 및 이용기간</h4>
              <p>원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
            </div>

            <div>
              <h4 className="mb-2">4. 개인정보의 파기절차 및 방법</h4>
              <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다.</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full">닫기</Button>
        </div>
      </div>
    </div>
  );
}
