/**
 * PlannerSearchResults.tsx - 플래너 검색 결과 리스트
 * 검색된 장소를 드래그 가능한 형태로 표시
 */

import { useDrag } from 'react-dnd';
import { MapPin } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
}

interface DayPlan {
  id: string;
  day: number;
  places: Place[];
  memo?: string;
}

interface PlannerSearchResultsProps {
  category: string[];
  region: string;
  searchQuery: string;
  dayPlans: DayPlan[];
  onAddPlace: (place: Place, dayId: string) => void;
}

const mockPlaces: Place[] = [
  {
    id: 'place-1',
    name: '경복궁',
    category: '관광',
    region: '서울 종로구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-2',
    name: 'N서울타워',
    category: '관광',
    region: '서울 용산구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-3',
    name: '명동 김밥',
    category: '음식',
    region: '서울 중구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-4',
    name: '국립중앙박물관',
    category: '역사',
    region: '서울 용산구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-5',
    name: '한강 공원',
    category: '레저',
    region: '서울 영등포구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-6',
    name: '명동 쇼핑거리',
    category: '쇼핑',
    region: '서울 중구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-7',
    name: '서울숲',
    category: '체험',
    region: '서울 성동구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-8',
    name: '국립극장',
    category: '문화',
    region: '서울 중구',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-9',
    name: '전주 한옥마을',
    category: '역사',
    region: '전북 전주시',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
  {
    id: 'place-10',
    name: '부산 해운대',
    category: '레저',
    region: '부산 해운대구',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=200',
  },
  {
    id: 'place-11',
    name: '제주 성산일출봉',
    category: '관광',
    region: '제주 서귀포시',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
  },
  {
    id: 'place-12',
    name: '강원도 스키장',
    category: '레저',
    region: '강원 평창군',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200',
  },
];

export function PlannerSearchResults({
  category,
  region,
  searchQuery,
  dayPlans,
  onAddPlace,
}: PlannerSearchResultsProps) {
  const filteredPlaces = mockPlaces.filter((place) => {
    const matchesCategory =
      category.includes('전체') || category.includes(place.category);
    const matchesRegion = region === '전체' || place.region.includes(region);
    const matchesSearch =
      searchQuery === '' ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRegion && matchesSearch;
  });

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-2">
        검색 결과: {filteredPlaces.length}개
      </div>
      {filteredPlaces.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          검색 결과가 없습니다
        </div>
      ) : (
        filteredPlaces.map((place) => (
          <DraggableSearchItem
            key={place.id}
            place={place}
            dayPlans={dayPlans}
            onAddPlace={onAddPlace}
          />
        ))
      )}
    </div>
  );
}

interface DraggableSearchItemProps {
  place: Place;
  dayPlans: DayPlan[];
  onAddPlace: (place: Place, dayId: string) => void;
}

function DraggableSearchItem({ place, dayPlans, onAddPlace }: DraggableSearchItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'PLACE',
    item: { 
      id: `new-${place.id}-${Date.now()}`,
      dayId: 'search',
      index: -1,
      place: place,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`bg-white border rounded p-2 cursor-move hover:border-blue-400 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <img
          src={place.image}
          alt={place.name}
          className="w-12 h-12 object-cover rounded flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium truncate">{place.name}</h5>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{place.region}</span>
          </div>
        </div>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex-shrink-0">
          {place.category}
        </span>
      </div>
    </div>
  );
}