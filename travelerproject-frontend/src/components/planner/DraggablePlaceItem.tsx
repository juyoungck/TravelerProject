/**
 * DraggablePlaceItem.tsx - 드래그 가능한 장소 아이템
 * React DnD를 이용한 드래그 앤 드롭 장소 카드
 * 
 * 수정: drop 시에만 검색 결과 추가
 * 수정: 드롭 위치를 정확하게 지정 가능 (위/아래 인디케이터 표시)
 */

import { useRef, useState } from 'react';
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

/** 드롭 위치 타입 */
type DropPosition = 'above' | 'below' | null;

export function DraggablePlaceItem({
  place,
  dayId,
  index,
  onMovePlace,
  onAddPlaceAtIndex,
  onRemovePlace,
}: DraggablePlaceItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // 드롭 위치 상태 (위/아래 인디케이터 표시용)
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'PLACE',
    item: { id: place.id, dayId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'PLACE',
    /**
     * drop 이벤트 - 드롭했을 때만 실행
     */
    drop: (item: { id: string; dayId: string; index: number; place?: any }, monitor) => {
      if (monitor.didDrop()) return;
      if (!ref.current) return;

      // 드롭 위치 계산
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // 위쪽 절반이면 현재 인덱스, 아래쪽 절반이면 다음 인덱스
      const insertIndex = hoverClientY < hoverMiddleY ? index : index + 1;

      // 검색 결과에서 드래그한 경우 - 해당 위치에 추가
      if (item.place) {
        onAddPlaceAtIndex(item.place, dayId, insertIndex);
        setDropPosition(null);
        return;
      }

      // 기존 아이템 이동
      const dragDayId = item.dayId;
      const dragIndex = item.index;

      // 같은 Day 내에서 이동할 때 인덱스 조정
      let targetIndex = insertIndex;
      if (dragDayId === dayId && dragIndex < insertIndex) {
        targetIndex = insertIndex - 1;
      }

      // 같은 위치면 이동하지 않음
      if (dragDayId === dayId && dragIndex === targetIndex) {
        setDropPosition(null);
        return;
      }

      onMovePlace(item.id, dragDayId, dayId, targetIndex);
      setDropPosition(null);
    },
    /**
     * hover 이벤트 - 드롭 위치 인디케이터 표시
     */
    hover: (item: { id: string; dayId: string; index: number; place?: any }, monitor) => {
      if (!ref.current) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        setDropPosition(null);
        return;
      }
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // 자기 자신을 드래그하는 경우 인디케이터 숨김
      if (!item.place && item.dayId === dayId && item.index === index) {
        setDropPosition(null);
        return;
      }

      // 위쪽 절반이면 'above', 아래쪽 절반이면 'below'
      if (hoverClientY < hoverMiddleY) {
        setDropPosition('above');
      } else {
        setDropPosition('below');
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  // 드래그가 끝나면 인디케이터 숨김
  if (!isOver && dropPosition !== null) {
    setDropPosition(null);
  }

  drag(drop(ref));

  return (
    <div className="relative">
      {/* 위쪽 드롭 인디케이터 */}
      {isOver && dropPosition === 'above' && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10">
          <div className="absolute -left-1 -top-1 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-500 rounded-full" />
        </div>
      )}
      
      <div
        ref={ref}
        className={`bg-white border rounded p-2 cursor-move flex items-center gap-2 transition-all ${
          isDragging ? 'opacity-50 scale-95' : ''
        } ${isOver ? 'border-blue-400' : 'border-gray-200'} hover:border-blue-400`}
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
            className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
            onClick={() => onRemovePlace(dayId, place.id)}
          />
        )}
      </div>

      {/* 아래쪽 드롭 인디케이터 */}
      {isOver && dropPosition === 'below' && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10">
          <div className="absolute -left-1 -top-1 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-500 rounded-full" />
        </div>
      )}
    </div>
  );
}
