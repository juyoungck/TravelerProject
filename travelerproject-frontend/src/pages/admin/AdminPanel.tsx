/**
 * AdminPanel.tsx - 관리자 패널
 * * 회원 관리, 게시판 관리, 리뷰 관리, 플래너 관리 기능
 * 수정: 플래너 제목 클릭 시 현재 창에서 페이지 이동 (window.location 사용)
 * * @author TravelerProject
 */

import { useState, useEffect } from 'react';
import { 
  Users, FileText, MessageSquare, BarChart3, Calendar,
  Search, Trash2, Eye, EyeOff, UserX, UserCheck,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  adminApi,
  type AdminMember,
  type AdminBoard,
  type AdminReview,
  type AdminPlanner,
  type DashboardStats
} from '../../api/adminApi';

type AdminTab = 'dashboard' | 'members' | 'boards' | 'reviews' | 'planners';

interface AdminPanelProps {
  onClose?: () => void;
  onNavigateToDestination?: (contentid: string) => void;
  onNavigateToBoard?: (bdId: number) => void;
  onNavigateToPlanner?: (plnId: number) => void;
}

export function AdminPanel({ onClose, onNavigateToDestination, onNavigateToBoard, onNavigateToPlanner }: AdminPanelProps) {
  // ============================================
  // 상태 관리
  // ============================================
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // 대시보드 상태
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // 회원 관리 상태
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('');

  // 게시판 관리 상태
  const [boards, setBoards] = useState<AdminBoard[]>([]);
  const [boardPage, setBoardPage] = useState(1);
  const [boardTotalPages, setBoardTotalPages] = useState(1);
  const [boardSearch, setBoardSearch] = useState('');
  const [boardStatusFilter, setBoardStatusFilter] = useState('');

  // 리뷰 관리 상태
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewSearch, setReviewSearch] = useState('');

  // 플래너 관리 상태
  const [planners, setPlanners] = useState<AdminPlanner[]>([]);
  const [plannerPage, setPlannerPage] = useState(1);
  const [plannerTotalPages, setPlannerTotalPages] = useState(1);
  const [plannerSearch, setPlannerSearch] = useState('');
  const [plannerStatusFilter, setPlannerStatusFilter] = useState('');

  // ============================================
  // 데이터 로드
  // ============================================

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'members') {
      fetchMembers();
    } else if (activeTab === 'boards') {
      fetchBoards();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'planners') {
      fetchPlanners();
    }
  }, [activeTab]);

  /** 대시보드 통계 조회 */
  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getDashboardStats();
      if (response.status === 'success') {
        setStats(response.data);
      }
    } catch (error) {
      console.error('대시보드 조회 오류:', error);
      alert('통계 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /** 회원 목록 조회 */
  const fetchMembers = async (page: number = memberPage) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getMembers(
        page, 
        20, 
        memberSearch || undefined, 
        memberStatusFilter || undefined
      );
      if (response.status === 'success') {
        setMembers(response.data || []);
        setMemberTotalPages(response.totalPages || 1);
        setMemberPage(page);
      }
    } catch (error) {
      console.error('회원 목록 조회 오류:', error);
      alert('회원 목록 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /** 게시글 목록 조회 */
  const fetchBoards = async (page: number = boardPage) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getBoards(
        page, 
        20, 
        boardSearch || undefined, 
        boardStatusFilter || undefined
      );
      if (response.status === 'success') {
        setBoards(response.data || []);
        setBoardTotalPages(response.totalPages || 1);
        setBoardPage(page);
      }
    } catch (error) {
      console.error('게시글 목록 조회 오류:', error);
      alert('게시글 목록 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /** 리뷰 목록 조회 */
  const fetchReviews = async (page: number = reviewPage) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getReviews(
        page, 
        20, 
        reviewSearch || undefined
      );
      if (response.status === 'success') {
        setReviews(response.data || []);
        setReviewTotalPages(response.totalPages || 1);
        setReviewPage(page);
      }
    } catch (error) {
      console.error('리뷰 목록 조회 오류:', error);
      alert('리뷰 목록 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 회원 관리 핸들러
  // ============================================

  /** 회원 상태 변경 */
  const handleMemberStatusChange = async (mId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DELETED' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? '활성화' : '비활성화';
    
    if (!confirm(`이 회원을 ${action}하시겠습니까?`)) return;

    try {
      const response = await adminApi.updateMemberStatus(mId, newStatus);
      if (response.status === 'success') {
        alert(response.message);
        fetchMembers();
      } else {
        alert(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  /** 회원 삭제 */
  const handleDeleteMember = async (mId: number, nickname: string) => {
    if (!confirm(`"${nickname}" 회원을 완전히 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 회원의 모든 데이터가 삭제됩니다.`)) {
      return;
    }

    try {
      const response = await adminApi.deleteMember(mId);
      if (response.status === 'success') {
        alert(response.message);
        fetchMembers();
      } else {
        alert(response.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // ============================================
  // 게시판 관리 핸들러
  // ============================================

  /** 게시글 상태 변경 */
  const handleBoardStatusChange = async (bdId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLIC' ? 'HIDDEN' : 'PUBLIC';
    const action = newStatus === 'PUBLIC' ? '공개' : '숨김';
    
    if (!confirm(`이 게시글을 ${action} 처리하시겠습니까?`)) return;

    try {
      const response = await adminApi.updateBoardStatus(bdId, newStatus);
      if (response.status === 'success') {
        alert(response.message);
        fetchBoards();
      } else {
        alert(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  /** 게시글 삭제 */
  const handleDeleteBoard = async (bdId: number, title: string) => {
    if (!confirm(`"${title}" 게시글을 삭제하시겠습니까?\n\n댓글도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const response = await adminApi.deleteBoard(bdId);
      if (response.status === 'success') {
        alert(response.message);
        fetchBoards();
      } else {
        alert(response.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // ============================================
  // 리뷰 관리 핸들러
  // ============================================

  /** 리뷰 삭제 */
  const handleDeleteReview = async (rvId: number) => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return;

    try {
      const response = await adminApi.deleteReview(rvId);
      if (response.status === 'success') {
        alert(response.message);
        fetchReviews();
      } else {
        alert(response.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // ============================================
  // 플래너 관리 함수
  // ============================================

  /** 플래너 목록 조회 */
  const fetchPlanners = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getPlanners(page, 10, plannerSearch, plannerStatusFilter);
      if (response.status === 'success') {
        setPlanners(response.data);
        setPlannerPage(response.currentPage);
        setPlannerTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('플래너 목록 조회 오류:', error);
      alert('플래너 목록 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /** 플래너 상태 변경 (공개/비공개) */
  const handlePlannerStatusChange = async (plnId: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 'PRIVATE' : 'PUBLIC';
    const confirmMsg = currentStatus === 1 ? '비공개로 변경하시겠습니까?' : '공개로 변경하시겠습니까?';
    
    if (!confirm(confirmMsg)) return;

    try {
      const response = await adminApi.updatePlannerStatus(plnId, newStatus);
      if (response.status === 'success') {
        alert(response.message);
        fetchPlanners(plannerPage);
      } else {
        alert(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('플래너 상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  /** 플래너 삭제 */
  const handleDeletePlanner = async (plnId: number, plnTitle: string) => {
    if (!confirm(`"${plnTitle}" 플래너를 삭제하시겠습니까?\n플래너의 모든 일정이 함께 삭제됩니다.`)) return;

    try {
      const response = await adminApi.deletePlanner(plnId);
      if (response.status === 'success') {
        alert(response.message);
        fetchPlanners(plannerPage);
      } else {
        alert(response.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('플래너 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // ============================================
  // 유틸리티 함수
  // ============================================

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // ============================================
  // 렌더링
  // ============================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">관리자 패널</h1>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                마이페이지로 돌아가기
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 사이드바 */}
          <div className="w-64 bg-white rounded-lg shadow p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                대시보드
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'members'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5" />
                회원 관리
              </button>
              <button
                onClick={() => setActiveTab('boards')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'boards'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-5 w-5" />
                게시판 관리
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                리뷰 관리
              </button>
              <button
                onClick={() => setActiveTab('planners')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'planners'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="h-5 w-5" />
                플래너 관리
              </button>
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 로딩 */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* ============================================ */}
            {/* 대시보드 */}
            {/* ============================================ */}
            {!isLoading && activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">대시보드</h2>
                
                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">전체 회원</p>
                        <p className="text-3xl font-bold">{stats.totalMembers}</p>
                      </div>
                      <Users className="h-12 w-12 text-blue-500 opacity-50" />
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-green-600">활성: {stats.activeMembers}</span>
                      <span className="text-gray-400 mx-2">|</span>
                      <span className="text-red-600">비활성: {stats.inactiveMembers}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">전체 게시글</p>
                        <p className="text-3xl font-bold">{stats.totalBoards}</p>
                      </div>
                      <FileText className="h-12 w-12 text-green-500 opacity-50" />
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-green-600">공개: {stats.publicBoards}</span>
                      <span className="text-gray-400 mx-2">|</span>
                      <span className="text-orange-600">숨김: {stats.hiddenBoards}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">전체 리뷰</p>
                        <p className="text-3xl font-bold">{stats.totalReviews}</p>
                      </div>
                      <MessageSquare className="h-12 w-12 text-yellow-500 opacity-50" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">전체 플래너</p>
                        <p className="text-3xl font-bold">{stats.totalPlanners}</p>
                      </div>
                      <Calendar className="h-12 w-12 text-purple-500 opacity-50" />
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-green-600">공개: {stats.publicPlanners || 0}</span>
                      <span className="mx-2">|</span>
                      <span className="text-gray-600">비공개: {stats.privatePlanners || 0}</span>
                    </div>
                  </div>
                </div>

                {/* 오늘 통계 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">오늘의 활동</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{stats.todayNewMembers}</p>
                      <p className="text-gray-600">신규 가입</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{stats.todayNewPlanners || 0}</p>
                      <p className="text-gray-600">새 플래너</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{stats.todayNewBoards}</p>
                      <p className="text-gray-600">새 게시글</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* 회원 관리 */}
            {/* ============================================ */}
            {!isLoading && activeTab === 'members' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">회원 관리</h2>
                
                {/* 검색 & 필터 */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="아이디, 닉네임, 이메일 검색..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && fetchMembers(1)}
                      />
                    </div>
                    <select
                      value={memberStatusFilter}
                      onChange={(e) => setMemberStatusFilter(e.target.value)}
                      className="border rounded-lg px-4 py-2"
                    >
                      <option value="">전체 상태</option>
                      <option value="ACTIVE">활성</option>
                      <option value="DELETED">비활성</option>
                    </select>
                    <Button onClick={() => fetchMembers(1)}>검색</Button>
                  </div>
                </div>

                {/* 회원 목록 테이블 */}
                <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                  <table className="w-full table-fixed min-w-[900px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-[50px] px-2 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                        <th className="w-[180px] px-2 py-3 text-left text-sm font-medium text-gray-600">아이디</th>
                        <th className="w-[100px] px-2 py-3 text-left text-sm font-medium text-gray-600">닉네임</th>
                        <th className="w-[200px] px-2 py-3 text-left text-sm font-medium text-gray-600">이메일</th>
                        <th className="w-[80px] px-2 py-3 text-center text-sm font-medium text-gray-600">가입유형</th>
                        <th className="w-[70px] px-2 py-3 text-center text-sm font-medium text-gray-600">상태</th>
                        <th className="w-[90px] px-2 py-3 text-center text-sm font-medium text-gray-600">가입일</th>
                        <th className="w-[80px] px-2 py-3 text-center text-sm font-medium text-gray-600">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {members.map((member) => (
                        <tr key={member.mId} className="hover:bg-gray-50">
                          <td className="px-2 py-3 text-sm">{member.mId}</td>
                          <td className="px-2 py-3 text-sm truncate max-w-[180px]" title={member.mUsername}>
                            {member.mUsername}
                          </td>
                          <td className="px-2 py-3 text-sm font-medium truncate max-w-[100px]" title={member.mNickname}>
                            {member.mNickname}
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-600 truncate max-w-[200px]" title={member.mEmail}>
                            {member.mEmail}
                          </td>
                          <td className="px-2 py-3 text-sm text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              member.mLoginType === 'LOCAL' ? 'bg-gray-100' :
                              member.mLoginType === 'SOCIAL' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {member.mLoginType}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-sm text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              member.mStatus === 'ACTIVE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {member.mStatus === 'ACTIVE' ? '활성' : '비활성'}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-sm text-gray-600 text-center">
                            {formatDate(member.mRegdate)}
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMemberStatusChange(member.mId, member.mStatus)}
                                title={member.mStatus === 'ACTIVE' ? '비활성화' : '활성화'}
                              >
                                {member.mStatus === 'ACTIVE' ? (
                                  <UserX className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMember(member.mId, member.mNickname)}
                                title="삭제"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {members.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                            회원이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={memberPage === 1}
                    onClick={() => fetchMembers(1)}
                  >
                    처음
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={memberPage === 1}
                    onClick={() => fetchMembers(memberPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* 페이지 번호 */}
                  {Array.from({ length: Math.min(5, memberTotalPages) }, (_, i) => {
                    let pageNum;
                    if (memberTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (memberPage <= 3) {
                      pageNum = i + 1;
                    } else if (memberPage >= memberTotalPages - 2) {
                      pageNum = memberTotalPages - 4 + i;
                    } else {
                      pageNum = memberPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={memberPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchMembers(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={memberPage === memberTotalPages || memberTotalPages === 0}
                    onClick={() => fetchMembers(memberPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={memberPage === memberTotalPages || memberTotalPages === 0}
                    onClick={() => fetchMembers(memberTotalPages)}
                  >
                    마지막
                  </Button>
                  <span className="ml-4 text-sm text-gray-600">
                    ({memberPage} / {memberTotalPages || 1} 페이지)
                  </span>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* 게시판 관리 */}
            {/* ============================================ */}
            {!isLoading && activeTab === 'boards' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">게시판 관리</h2>
                
                {/* 검색 & 필터 */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="제목, 내용, 작성자 검색..."
                        value={boardSearch}
                        onChange={(e) => setBoardSearch(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && fetchBoards(1)}
                      />
                    </div>
                    <select
                      value={boardStatusFilter}
                      onChange={(e) => setBoardStatusFilter(e.target.value)}
                      className="border rounded-lg px-4 py-2"
                    >
                      <option value="">전체 상태</option>
                      <option value="PUBLIC">공개</option>
                      <option value="HIDDEN">숨김</option>
                    </select>
                    <Button onClick={() => fetchBoards(1)}>검색</Button>
                  </div>
                </div>

                {/* 게시글 목록 테이블 */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">제목</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성자</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">카테고리</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">조회수</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성일</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {boards.map((board) => (
                        <tr key={board.bdId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{board.bdId}</td>
                          <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">
                            <button
                              onClick={() => onNavigateToBoard?.(board.bdId)}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                              title="게시글 상세 페이지로 이동"
                            >
                              {board.bdTitle}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">{board.authorNickname}</td>
                          <td className="px-4 py-3 text-sm">{board.bdCategory}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              board.isDeleted === 0 || board.isDeleted === null
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {board.isDeleted === 0 || board.isDeleted === null ? '공개' : '숨김'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{board.bdViewCount}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(board.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBoardStatusChange(board.bdId, board.isDeleted === 1 ? 'HIDDEN' : 'PUBLIC')}
                                title={board.isDeleted === 0 || board.isDeleted === null ? '숨김 처리' : '공개'}
                              >
                                {board.isDeleted === 0 || board.isDeleted === null ? (
                                  <EyeOff className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBoard(board.bdId, board.bdTitle)}
                                title="삭제"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {boards.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                            게시글이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={boardPage === 1}
                    onClick={() => fetchBoards(1)}
                  >
                    처음
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={boardPage === 1}
                    onClick={() => fetchBoards(boardPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* 페이지 번호 */}
                  {Array.from({ length: Math.min(5, boardTotalPages) }, (_, i) => {
                    let pageNum;
                    if (boardTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (boardPage <= 3) {
                      pageNum = i + 1;
                    } else if (boardPage >= boardTotalPages - 2) {
                      pageNum = boardTotalPages - 4 + i;
                    } else {
                      pageNum = boardPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={boardPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchBoards(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={boardPage === boardTotalPages || boardTotalPages === 0}
                    onClick={() => fetchBoards(boardPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={boardPage === boardTotalPages || boardTotalPages === 0}
                    onClick={() => fetchBoards(boardTotalPages)}
                  >
                    마지막
                  </Button>
                  <span className="ml-4 text-sm text-gray-600">
                    ({boardPage} / {boardTotalPages || 1} 페이지)
                  </span>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* 리뷰 관리 */}
            {/* ============================================ */}
            {!isLoading && activeTab === 'reviews' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">리뷰 관리</h2>
                
                {/* 검색 */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="리뷰 내용, 작성자, 여행지 ID 검색..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && fetchReviews(1)}
                      />
                    </div>
                    <Button onClick={() => fetchReviews(1)}>검색</Button>
                  </div>
                </div>

                {/* 리뷰 목록 테이블 */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">여행지 ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성자</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">내용</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">평점</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성일</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reviews.map((review) => (
                        <tr key={review.rvId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{review.rvId}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => onNavigateToDestination?.(review.contentid)}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              title="여행지 상세 페이지로 이동"
                            >
                              {review.contentid}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">{review.authorNickname}</td>
                          <td className="px-4 py-3 text-sm max-w-xs truncate">
                            {review.rvContent}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="text-yellow-500">★</span> {review.rvRating}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDateTime(review.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReview(review.rvId)}
                                title="삭제"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {reviews.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                            리뷰가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviewPage === 1}
                    onClick={() => fetchReviews(1)}
                  >
                    처음
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviewPage === 1}
                    onClick={() => fetchReviews(reviewPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* 페이지 번호 */}
                  {Array.from({ length: Math.min(5, reviewTotalPages) }, (_, i) => {
                    let pageNum;
                    if (reviewTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (reviewPage <= 3) {
                      pageNum = i + 1;
                    } else if (reviewPage >= reviewTotalPages - 2) {
                      pageNum = reviewTotalPages - 4 + i;
                    } else {
                      pageNum = reviewPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={reviewPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchReviews(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviewPage === reviewTotalPages || reviewTotalPages === 0}
                    onClick={() => fetchReviews(reviewPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviewPage === reviewTotalPages || reviewTotalPages === 0}
                    onClick={() => fetchReviews(reviewTotalPages)}
                  >
                    마지막
                  </Button>
                  <span className="ml-4 text-sm text-gray-600">
                    ({reviewPage} / {reviewTotalPages || 1} 페이지)
                  </span>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* 플래너 관리 */}
            {/* ============================================ */}
            {!isLoading && activeTab === 'planners' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">플래너 관리</h2>
                
                {/* 검색 & 필터 */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="제목, 설명, 작성자 검색..."
                        value={plannerSearch}
                        onChange={(e) => setPlannerSearch(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && fetchPlanners(1)}
                      />
                    </div>
                    <select
                      value={plannerStatusFilter}
                      onChange={(e) => {
                        setPlannerStatusFilter(e.target.value);
                        setTimeout(() => fetchPlanners(1), 0);
                      }}
                      className="border rounded-md px-3 py-2"
                    >
                      <option value="">전체 상태</option>
                      <option value="PUBLIC">공개</option>
                      <option value="PRIVATE">비공개</option>
                    </select>
                    <Button onClick={() => fetchPlanners(1)}>검색</Button>
                  </div>
                </div>

                {/* 플래너 목록 테이블 */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">제목</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성자</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">기간</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성일</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {planners.map((planner) => (
                        <tr key={planner.plnId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{planner.plnId}</td>
                          {/* ✅ 제목 클릭 시 현재 창에서 이동하도록 수정 */}
                          <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">
                            <span
                              onClick={() => window.location.href = `/?page=planner-detail&plnId=${planner.plnId}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block truncate"
                            title="플래너 상세 보기"
                            >
                              {planner.plnTitle}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{planner.authorNickname}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(planner.startDate)} ~ {formatDate(planner.endDate)}
                            <span className="ml-1 text-xs text-gray-400">({planner.totalDays}일)</span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              planner.isPublic === 1
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {planner.isPublic === 1 ? '공개' : '비공개'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(planner.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlannerStatusChange(planner.plnId, planner.isPublic)}
                                title={planner.isPublic === 1 ? '비공개로 변경' : '공개로 변경'}
                              >
                                {planner.isPublic === 1 ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePlanner(planner.plnId, planner.plnTitle)}
                                title="삭제"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {planners.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            플래너가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={plannerPage === 1}
                    onClick={() => fetchPlanners(1)}
                  >
                    처음
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={plannerPage === 1}
                    onClick={() => fetchPlanners(plannerPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* 페이지 번호 */}
                  {Array.from({ length: Math.min(5, plannerTotalPages) }, (_, i) => {
                    let pageNum;
                    if (plannerTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (plannerPage <= 3) {
                      pageNum = i + 1;
                    } else if (plannerPage >= plannerTotalPages - 2) {
                      pageNum = plannerTotalPages - 4 + i;
                    } else {
                      pageNum = plannerPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={plannerPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchPlanners(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={plannerPage === plannerTotalPages || plannerTotalPages === 0}
                    onClick={() => fetchPlanners(plannerPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={plannerPage === plannerTotalPages || plannerTotalPages === 0}
                    onClick={() => fetchPlanners(plannerTotalPages)}
                  >
                    마지막
                  </Button>
                  <span className="ml-4 text-sm text-gray-600">
                    ({plannerPage} / {plannerTotalPages || 1} 페이지)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;