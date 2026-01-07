/**
 * PlannerDayList.tsx - 플래너 일자별 일정 리스트
 * 각 일차별 장소 목록 및 드롭 영역
 * 
 * 수정: DAY 간 이동 및 DAY 내 순서 변경 지원
 */

import { useRef } from 'react';
import { useDrop } from "react-dnd";
import { DraggablePlaceItem } from "./DraggablePlaceItem";
import { Input } from "../ui/input";

interface Place {
  id: string;
  name: string;
  category: string;
  region: string;
  image: string;
  mapx?: number;
  mapy?: number;
  contentid?: string;
}

interface DayPlan {
  id: string;
  day: number;
  places: Place[];
  memo: string;
}

interface PlannerDayListProps {
  dayPlans: DayPlan[];
  onMovePlace: (placeId: string, fromDayId: string, toDayId: string, toIndex: number) => void;
  onAddPlaceAtIndex: (place: Place, dayId: string, index: number) => void;
  onUpdateMemo: (dayId: string, memo: string) => void;
  onDeleteDay: (dayId: string) => void;
  onRemovePlace: (dayId: string, placeId: string) => void;
}

export function PlannerDayList({
  dayPlans,
  onMovePlace,
  onAddPlaceAtIndex,
  onUpdateMemo,
  onDeleteDay,
  onRemovePlace,
}: PlannerDayListProps) {
  return (
    <div className="space-y-4">
      {dayPlans.map((dayPlan) => (
        <DaySection
          key={dayPlan.id}
          dayPlan={dayPlan}
          onMovePlace={onMovePlace}
          onAddPlaceAtIndex={onAddPlaceAtIndex}
          onUpdateMemo={onUpdateMemo}
          onDeleteDay={onDeleteDay}
          onRemovePlace={onRemovePlace}
        />
      ))}
    </div>
  );
}

interface DaySectionProps {
  dayPlan: DayPlan;
  onMovePlace: (placeId: string, fromDayId: string, toDayId: string, toIndex: number) => void;
  onAddPlaceAtIndex: (place: Place, dayId: string, index: number) => void;
  onUpdateMemo: (dayId: string, memo: string) => void;
  onDeleteDay: (dayId: string) => void;
  onRemovePlace: (dayId: string, placeId: string) => void;
}

function DaySection({
  dayPlan,
  onMovePlace,
  onAddPlaceAtIndex,
  onUpdateMemo,
  onDeleteDay,
  onRemovePlace,
}: DaySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 빈 영역에 드롭할 때 처리
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "PLACE",
    drop: (item: { id: string; dayId: string; index: number; place?: Place; isExisting?: boolean }, monitor) => {
      // 다른 드롭 타겟이 이미 처리했으면 무시
      if (monitor.didDrop()) return;

      // 검색 결과에서 드래그한 경우 - 맨 끝에 추가
      if (item.place) {
        onAddPlaceAtIndex(item.place, dayPlan.id, dayPlan.places.length);
        delete item.place;
        return;
      }
      
      // 기존 아이템을 다른 DAY로 이동하는 경우
      if (item.isExisting && item.dayId !== dayPlan.id) {
        onMovePlace(item.id, item.dayId, dayPlan.id, dayPlan.places.length);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [dayPlan.id, dayPlan.places.length, onAddPlaceAtIndex, onMovePlace]);

  drop(ref);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-blue-50 px-3 py-2 border-b flex items-center gap-2">
        <h4 className="text-sm font-semibold text-blue-700">
          DAY {dayPlan.day}
        </h4>
        <Input
          value={dayPlan.memo}
          onChange={(e) => onUpdateMemo(dayPlan.id, e.target.value)}
          placeholder="메모를 입력하세요..."
          className="flex-1 h-8 text-xs bg-white"
        />
      </div>
      <div
        ref={ref}
        className={`min-h-[100px] p-2 transition-colors ${
          isOver && canDrop 
            ? "bg-blue-100 border-2 border-dashed border-blue-400" 
            : "bg-white"
        }`}
      >
        {dayPlan.places.length === 0 ? (
          <div className={`text-center text-sm py-8 ${
            isOver && canDrop ? "text-blue-600 font-medium" : "text-gray-400"
          }`}>
            {isOver && canDrop 
              ? "여기에 드롭하세요!" 
              : "장소를 드래그해서 추가하세요"}
          </div>
        ) : (
          <div className="space-y-2">
            {dayPlan.places.map((place, index) => (
              <DraggablePlaceItem
                key={place.id}
                place={place}
                dayId={dayPlan.id}
                index={index}
                onMovePlace={onMovePlace}
                onAddPlaceAtIndex={onAddPlaceAtIndex}
                onRemovePlace={onRemovePlace}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
