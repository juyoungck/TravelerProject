/**
 * PlannerDayList.tsx - 플래너 일자별 일정 리스트
 * 각 일차별 장소 목록 및 드롭 영역
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

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PLACE",
    drop: (
      item: {
        id: string;
        dayId: string;
        index: number;
        place?: any;
      },
      monitor,
    ) => {
      if (monitor.didDrop()) return;

      // 검색 결과에서 드래그한 경우 - 맨 끝에 추가
      if (item.place) {
        onAddPlaceAtIndex(
          item.place,
          dayPlan.id,
          dayPlan.places.length,
        );
        // place 제거하여 일반 아이템처럼 취급
        delete item.place;
      } else if (item.dayId !== dayPlan.id) {
        // 다른 Day에서 드래그한 경우
        onMovePlace(
          item.id,
          item.dayId,
          dayPlan.id,
          dayPlan.places.length,
        );
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
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
        className={`min-h-[100px] p-2 ${
          isOver ? "bg-blue-50" : "bg-white"
        } transition-colors`}
      >
        {dayPlan.places.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            장소를 드래그해서 추가하세요
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