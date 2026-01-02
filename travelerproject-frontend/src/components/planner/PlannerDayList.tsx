/**
 * PlannerDayList.tsx - 플래너 일자별 일정 리스트
 * 각 일차별 장소 목록 및 드롭 영역
 * 
 * 수정: drop 이벤트에서만 검색 결과 추가되도록 변경
 */

import { useRef } from 'react';
import { useDrop } from "react-dnd";
import { X } from "lucide-react";
import { DraggablePlaceItem } from "./DraggablePlaceItem";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

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
  memo: string;
}

interface PlannerDayListProps {
  dayPlans: DayPlan[];
  onMovePlace: (
    placeId: string,
    fromDayId: string,
    toDayId: string,
    toIndex: number,
  ) => void;
  onAddPlaceAtIndex: (
    place: Place,
    dayId: string,
    index: number,
  ) => void;
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
  onMovePlace: (
    placeId: string,
    fromDayId: string,
    toDayId: string,
    toIndex: number,
  ) => void;
  onAddPlaceAtIndex: (
    place: Place,
    dayId: string,
    index: number,
  ) => void;
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

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "PLACE",
    /**
     * drop 이벤트 - 드롭했을 때만 실행
     * 검색 결과에서 드래그한 경우 여기서 추가
     */
    drop: (
      item: {
        id: string;
        dayId: string;
        index: number;
        place?: any;
      },
      monitor,
    ) => {
      // 다른 드롭 타겟(DraggablePlaceItem)이 이미 처리했으면 무시
      if (monitor.didDrop()) return;

      // 검색 결과에서 드래그한 경우 - 맨 끝에 추가
      if (item.place) {
        onAddPlaceAtIndex(
          item.place,
          dayPlan.id,
          dayPlan.places.length,
        );
        return;
      }
      
      // 다른 Day에서 드래그한 경우 - 맨 끝으로 이동
      if (item.dayId !== dayPlan.id) {
        onMovePlace(
          item.id,
          item.dayId,
          dayPlan.id,
          dayPlan.places.length,
        );
      }
    },
    /**
     * hover에서는 아무것도 하지 않음 - 스쳐 지나가도 추가 안 됨
     */
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  drop(ref);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-blue-50 px-3 py-2 border-b flex items-center gap-2">
        <h4 className="text-sm font-semibold">
          DAY {dayPlan.day}
        </h4>
        <Input
          value={dayPlan.memo}
          onChange={(e) =>
            onUpdateMemo(dayPlan.id, e.target.value)
          }
          placeholder="메모를 입력하세요..."
          className="flex-1 h-8 text-xs bg-white"
        />
      </div>
      <div
        ref={ref}
        className={`min-h-[100px] p-2 transition-colors ${
          isOver && canDrop ? "bg-blue-100 border-2 border-dashed border-blue-400" : "bg-white"
        }`}
      >
        {dayPlan.places.length === 0 ? (
          <div className={`text-center text-sm py-8 ${
            isOver && canDrop ? "text-blue-600 font-medium" : "text-gray-400"
          }`}>
            {isOver && canDrop ? "여기에 드롭하세요!" : "장소를 드래그해서 추가하세요"}
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
