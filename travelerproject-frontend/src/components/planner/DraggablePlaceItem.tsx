/**
 * DraggablePlaceItem.tsx - 드래그 가능한 장소 아이템
 * React DnD를 이용한 드래그 앤 드롭 장소 카드
 * 
 * 수정: 같은 DAY 내 아래로 이동 버그 수정
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
    item: () => ({ 
      id: place.id, 
      dayId, 
      index,
      isExisting: true  // 기존 아이템 표시
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'PLACE',
    drop: (item: { id: string; dayId: string; index: number; place?: any; isExisting?: boolean }, monitor) => {
      // 다른 드롭 타겟이 처리했으면 무시
      if (monitor.didDrop()) return;
      
      // 검색 결과에서 드래그한 경우 - 해당 위치에 추가
      if (item.place && !item.isExisting) {
        onAddPlaceAtIndex(item.place, dayId, index);
        return;
      }
      
      // 기존 아이템 이동
      if (item.isExisting && (item.dayId !== dayId || item.index !== index)) {
        onMovePlace(item.id, item.dayId, dayId, index);
      }
    },
    hover: (item: { id: string; dayId: string; index: number; place?: any; isExisting?: boolean }, monitor) => {
      if (!ref.current) return;
      
      // 검색 결과에서 드래그한 경우 - hover에서는 처리하지 않음 (drop에서 처리)
      if (item.place && !item.isExisting) {
        return;
      }
      
      const dragId = item.id;
      const dragDayId = item.dayId;
      const dragIndex = item.index;
      const hoverDayId = dayId;
      const hoverIndex = index;

      // 같은 위치면 아무것도 하지 않음
      if (dragDayId === hoverDayId && dragIndex === hoverIndex) {
        return;
      }

      // 마우스 위치 계산
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // 같은 Day 내에서 이동하는 경우
      if (dragDayId === hoverDayId) {
        // 아래로 드래그 (dragIndex < hoverIndex)
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;  // 절반을 넘지 않았으면 리턴
        }
        // 위로 드래그 (dragIndex > hoverIndex)
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;  // 절반을 넘지 않았으면 리턴
        }
      }

      // 실제로 이동
      onMovePlace(dragId, dragDayId, hoverDayId, hoverIndex);
      
      // 아이템 정보 업데이트 (다음 hover 체크를 위해)
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
      } ${isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} hover:border-blue-400 transition-colors`}
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
          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-red-500"
          onClick={() => onRemovePlace(dayId, place.id)}
        />
      )}
    </div>
  );
}
