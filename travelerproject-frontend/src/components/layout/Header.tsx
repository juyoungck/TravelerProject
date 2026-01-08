/**
 * Header.tsx - 메인 헤더 컴포넌트
 * 네비게이션 메뉴, 검색, 로그인/마이페이지, 언어 선택 포함
 */

import { MapPin, Menu, Search, User } from "lucide-react";
import { Button } from "../ui/button";
import { LanguageSelector } from "./LanguageSelector";

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  onOpenSearch?: () => void;
  isLoggedIn: boolean;
}

export function Header({
  onNavigate,
  onOpenSearch,
  isLoggedIn,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <MapPin className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl">어디갈래?</span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate("travel")}
              className="text-sm hover:text-blue-600 transition-colors"
            >
              여행지
            </button>
            <button
              onClick={() => onNavigate("planner")}
              className="text-sm hover:text-blue-600 transition-colors"
            >
              플래너
            </button>
            <button
              onClick={() => onNavigate("event")}
              className="text-sm hover:text-blue-600 transition-colors"
            >
              이벤트
            </button>
            <button
              onClick={() => onNavigate("board")}
              className="text-sm hover:text-blue-600 transition-colors"
            >
              게시판
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onNavigate("map")}
              className="flex items-center gap-2"
            >
              <MapPin className="h-5 w-5" />
              <span className="hidden lg:inline">지도</span>
            </Button>

            <Button
              variant="ghost"
              onClick={onOpenSearch}
              className="flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              <span className="hidden lg:inline">검색</span>
            </Button>

            {isLoggedIn ? (
              <Button
                variant="ghost"
                onClick={() => onNavigate("mypage")}
                className="flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                <span className="hidden lg:inline">
                  마이페이지
                </span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => onNavigate("login")}
                className="flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                <span className="hidden lg:inline">
                  로그인/회원가입
                </span>
              </Button>
            )}

            <LanguageSelector />

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}