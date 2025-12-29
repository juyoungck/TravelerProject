/**
 * Footer.tsx - 푸터 컴포넌트
 * 회사 정보 및 링크
 */

import { MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-white">어디갈래</span>
            </div>
            <p className="text-sm">
              대한민국의 아름다운 여행지를 소개하는 여행 정보 플랫폼입니다.
            </p>
          </div>

          <div>
            <h4 className="text-white mb-4">고객 지원</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">공지사항</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 어디갈래 All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
