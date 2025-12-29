import { X, MapPin, Calendar, Clock, Phone, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Header } from '../../components/layout/Header';

interface Event {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  image: string;
  category: '공연' | '축제';
  description?: string;
  price?: string;
  contact?: string;
}

interface EventDetailPageProps {
  event: Event;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

export function EventDetailPage({ event, onClose, onNavigate, isLoggedIn, onOpenSearch }: EventDetailPageProps) {
  const mockDescription =
    event.category === '공연'
      ? `${event.title}은(는) 대한민국을 대표하는 공연으로, 매년 많은 관객들이 찾는 인기 공연입니다.\n\n탁월한 연출과 뛰어난 배우들의 연기로 관객들에게 깊은 감동을 선사합니다. 예술의 향연을 경험하세요!`
      : `${event.title}은(는) 지역을 대표하는 축제로, 다양한 문화 체험과 즐길거리가 가득합니다.\n\n가족, 친구와 함께 잊지 못할 추억을 만들어보세요!`;

  const mockPrice = event.category === '공연' ? '일반 50,000원 / 학생 30,000원' : '무료';
  const mockContact = event.category === '공연' ? '02-123-4567' : '1588-5678';

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 - 네비게이션 포함 */}
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          onOpenSearch={onOpenSearch}
          isLoggedIn={isLoggedIn || false}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* 메인 이미지 */}
        <div className="mb-6">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        {/* 제목 및 카테고리 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span
                className={`inline-block px-3 py-1 rounded text-sm mb-2 ${
                  event.category === '공연'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-orange-100 text-orange-600'
                }`}
              >
                {event.category === '공연' ? '🎭 공연' : '🎉 축제'}
              </span>
              <h1 className="mb-2">{event.title}</h1>
            </div>
          </div>

          {/* 정보 */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold mb-1">장소</h5>
                <p className="text-gray-700">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold mb-1">날짜</h5>
                <p className="text-gray-700">{event.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold mb-1">시간</h5>
                <p className="text-gray-700">{event.time}</p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h5 className="text-sm font-semibold mb-1">요금</h5>
              <p className="text-gray-700">{mockPrice}</p>
            </div>

            <div className="pt-3 border-t">
              <h5 className="text-sm font-semibold mb-1">문의</h5>
              <p className="text-gray-700">{mockContact}</p>
            </div>
          </div>
        </div>

        {/* 상세설명 */}
        <div className="mb-6">
          <h3 className="mb-4">상세설명</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {mockDescription}
            </p>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
