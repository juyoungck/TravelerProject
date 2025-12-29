/**
 * DraggablePlaceItem.tsx - 드래그 가능한 장소 아이템
 * React DnD를 이용한 드래그 앤 드롭 장소 카드
 */

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, MapPin, X } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
}

interface DraggablePlaceItemProps {
  place: Place;
  dayId: string;
  index: number;
  onMovePlace: (placeId: string, fromDayId: string, toDayId: string, toIndex: number) => void;
  onAddPlaceAtIndex: (place: Place, dayId: string, index: number) => void;
  onRemovePlace?: (dayId: string, placeId: string) => void;
}

export function DraggablePlaceItem({
  place,
  dayId,
  index,
  onMovePlace,
  onAddPlaceAtIndex,
  onRemovePlace,
}: DraggablePlaceItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'PLACE',
    item: { id: place.id, dayId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'PLACE',
    hover: (item: { id: string; dayId: string; index: number; place?: any }, monitor) => {
      if (!ref.current) return;
      
      const dragId = item.id;
      const dragDayId = item.dayId;
      const dragIndex = item.index;
      const hoverDayId = dayId;
      const hoverIndex = index;

      // 검색 결과에서 드래그한 경우 - 커서 위치에 추가
      if (item.place) {
        onAddPlaceAtIndex(item.place, hoverDayId, hoverIndex);
        // place 제거하여 일반 아이템처럼 취급
        delete item.place;
        item.id = `${item.id}-added`;
        item.dayId = hoverDayId;
        item.index = hoverIndex;
        return;
      }

      // 같은 위치면 아무것도 하지 않음
      if (dragDayId === hoverDayId && dragIndex === hoverIndex) {
        return;
      }

      // 같은 Day 내에서 이동하는 경우
      if (dragDayId === hoverDayId) {
        // 위로 드래그하는 경우와 아래로 드래그하는 경우를 구분
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        
        if (!clientOffset) return;
        
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // 아래로 드래그하는데 절반을 넘지 않았으면 리턴
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        // 위로 드래그하는데 절반을 넘지 않았으면 리턴
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
      }

      // 실제로 이동
      onMovePlace(dragId, dragDayId, hoverDayId, hoverIndex);
      
      // 아이템 정보 업데이트
      item.dayId = hoverDayId;
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`bg-white border rounded p-2 cursor-move flex items-center gap-2 ${
        isDragging ? 'opacity-50' : ''
      } ${isOver ? 'border-blue-500' : 'border-gray-200'} hover:border-blue-400 transition-colors`}
    >
      <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
      {onRemovePlace && (
        <X
          className="h-4 w-4 text-gray-400 cursor-pointer"
          onClick={() => onRemovePlace(dayId, place.id)}
        />
      )}
    </div>
  );
}