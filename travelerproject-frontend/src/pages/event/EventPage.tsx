/**
 * EventPage.tsx - 공연/축제 목록 페이지
 * 지역 및 카테고리별 이벤트 필터링 및 목록 표시
 */

import { useState } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { EventDetailPage } from './EventDetailPage';

interface Event {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  image: string;
  category: '공연' | '축제';
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: '서울 재즈 페스티벌',
    location: '올림픽공원',
    date: '2025-05-15',
    time: '18:00',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    category: '공연',
  },
  {
    id: 2,
    title: '국립극장 전통공연',
    location: '국립극장',
    date: '2025-05-20',
    time: '19:30',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    category: '공연',
  },
  {
    id: 3,
    title: '뮤지컬 캣츠',
    location: '예술의전당',
    date: '2025-06-01',
    time: '15:00',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400',
    category: '공연',
  },
  {
    id: 4,
    title: '부산 불꽃축제',
    location: '광안리 해수욕장',
    date: '2025-10-15',
    time: '20:00',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    category: '축제',
  },
  {
    id: 5,
    title: '보령 머드축제',
    location: '대천해수욕장',
    date: '2025-07-20',
    time: '10:00',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    category: '축제',
  },
  {
    id: 6,
    title: '진주 남강 유등축제',
    location: '남강 일원',
    date: '2025-10-01',
    time: '18:00',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    category: '축제',
  },
];

interface EventPageProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

export function EventPage({ onNavigate, isLoggedIn, onOpenSearch }: EventPageProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const performances = mockEvents.filter((event) => event.category === '공연');
  const festivals = mockEvents.filter((event) => event.category === '축제');

  if (selectedEvent) {
    return (
      <EventDetailPage
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onOpenSearch={onOpenSearch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8">공연, 축제</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 왼쪽 - 공연 */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2>🎭 공연</h2>
              <span className="text-sm text-gray-600">({performances.length}개)</span>
            </div>
            <div className="space-y-4">
              {performances.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          </div>

          {/* 오른쪽 - 축제 */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2>🎉 축제</h2>
              <span className="text-sm text-gray-600">({festivals.length}개)</span>
            </div>
            <div className="space-y-4">
              {festivals.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow text-left"
    >
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="mb-3">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
