/**
 * DestinationDetail.tsx - 여행지 상세 모달 (미사용 - TravelDetailPage로 대체됨)
 * 여행지 상세 정보를 모달로 표시
 */

import { X, MapPin, Star, Clock, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export interface Destination {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  rating: number;
  tags: string[];
}

interface DestinationDetailProps {
  destination: Destination;
  onClose: () => void;
}

export function DestinationDetail({ destination, onClose }: DestinationDetailProps) {
  // destination이 없거나 필수 필드가 없으면 렌더링하지 않음
  if (!destination || !destination.name) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-64 md:h-96">
          <img
            src={destination.image || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'}
            alt={destination.name}
            className="h-full w-full object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="mb-2">{destination.name}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{destination.region || '정보 없음'}</span>
              </div>
            </div>
            {destination.rating && (
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{destination.rating}</span>
              </div>
            )}
          </div>

          {destination.tags && destination.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {destination.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="mb-2">소개</h3>
              <p className="text-gray-700 leading-relaxed">
                {destination.description || '설명이 제공되지 않았습니다.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">운영시간</p>
                  <p className="font-medium">09:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">추천 계절</p>
                  <p className="font-medium">사계절</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">여행 계획에 추가</Button>
              <Button variant="outline" className="flex-1">공유하기</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}