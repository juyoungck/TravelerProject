/**
 * FeaturedCarousel.tsx - 추천 여행지 캐러셀
 * 메인 페이지 상단 캐러셀
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: '경복궁',
    region: '서울 종로구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    description: '조선왕조의 법궁으로 600년의 역사를 간직한 궁궐',
  },
  {
    id: 2,
    name: 'N서울타워',
    region: '서울 용산구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    description: '서울의 상징적인 랜드마크',
  },
  {
    id: 3,
    name: '해운대 해수욕장',
    region: '부산 해운대구',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
    description: '대한민국 최고의 해수욕장',
  },
  {
    id: 4,
    name: '성산일출봉',
    region: '제주 서귀포시',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    description: '제주의 아름다운 일출 명소',
  },
];

interface FeaturedCarouselProps {
  onSelectDestination: (destinationId: number) => void;
}

export function FeaturedCarousel({ onSelectDestination }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 5초마다 자동으로 다음 슬라이드로 이동
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === destinations.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? destinations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === destinations.length - 1 ? 0 : prev + 1));
  };

  const getPrevIndex = () => {
    return currentIndex === 0 ? destinations.length - 1 : currentIndex - 1;
  };

  const getNextIndex = () => {
    return currentIndex === destinations.length - 1 ? 0 : currentIndex + 1;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center">추천 여행지</h2>
        
        <div className="relative">
          {/* 캐러셀 컨테이너 */}
          <div className="flex items-center justify-center gap-4">
            {/* 이전 버튼 */}
            <button
              onClick={handlePrev}
              className="absolute left-0 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* 이전 이미지 (살짝 보이기) */}
            <div className="hidden md:block w-1/6 opacity-50">
              <img
                src={destinations[getPrevIndex()].image}
                alt={destinations[getPrevIndex()].name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* 현재 이미지 (메인) */}
            <div className="w-full md:w-2/3 relative">
              <button
                onClick={() => onSelectDestination(destinations[currentIndex].id)}
                className="w-full group"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={destinations[currentIndex].image}
                    alt={destinations[currentIndex].name}
                    className="w-full h-96 md:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* 그라디언트 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* 정보 */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5" />
                      <span className="text-lg">{destinations[currentIndex].region}</span>
                    </div>
                    <h3 className="text-4xl font-bold mb-3">
                      {destinations[currentIndex].name}
                    </h3>
                    <p className="text-lg text-gray-200">
                      {destinations[currentIndex].description}
                    </p>
                  </div>
                </div>
              </button>

              {/* 인디케이터 */}
              <div className="flex justify-center gap-2 mt-6">
                {destinations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 다음 이미지 (살짝 보이기) */}
            <div className="hidden md:block w-1/6 opacity-50">
              <img
                src={destinations[getNextIndex()].image}
                alt={destinations[getNextIndex()].name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleNext}
              className="absolute right-0 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
