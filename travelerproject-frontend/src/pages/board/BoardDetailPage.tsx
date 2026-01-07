/**
 * BoardDetailPage.tsx - 게시판 상세 페이지 (읽기 전용)
 * ★ 편집하기 버튼 클릭 → BoardEditPage로 이동
 * ★ 플래너 카드형 표시 + 클릭 시 미리보기 이동 (새창 X)
 * ★ 레이아웃: 플래너(위) → 본문(아래)
 * ★ 댓글 작성 시 이미지 깜빡임 방지
 * ★ H1/H2/H3 태그 스타일 적용
 */

import { useState, useEffect, useMemo } from 'react';
import { Eye, Trash2, ArrowLeft, Pencil, MapPin, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Header } from '../../components/layout/Header';
import { 
  getBoardDetail, 
  deleteBoard, 
  closeRecruit,
  createComment, 
  deleteComment 
} from '../../api/boardApi';
import { getPlannerDetail } from '../../api/plannerApi';

interface Reply {
  id: number;
  mId: number;
  author: string;
  content: string;
  date: string;
}

interface Comment {
  id: number;
  mId: number;
  author: string;
  content: string;
  date: string;
  replies: Reply[];
}

interface BoardData {
  bdId: number;
  mId: number;
  authorNickname: string;
  bdCategory: string;
  bdTitle: string;
  bdContent: string;
  bdViewCount: number;
  recruitStatus: string | null;
  plnId: number | null;
  plannerTitle: string | null;
  bdRating: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PlannerDetailData {
  plnId: number;
  plnTitle: string;
  startDate: string;
  endDate: string;
  region: string;
  thumbnailUrl: string;
  authorNickname: string;
}

interface BoardDetailPageProps {
  bdId: number;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onOpenSearch?: () => void;
  onViewPlanner?: (plnId: number) => void;
}

export function BoardDetailPage({ 
  bdId, 
  onClose, 
  onDelete,
  onEdit,
  onNavigate, 
  isLoggedIn, 
  currentUserId,
  onOpenSearch,
  onViewPlanner
}: BoardDetailPageProps) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const [plannerDetail, setPlannerDetail] = useState<PlannerDetailData | null>(null);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR');
  };

  const getCategoryLabel = (cat: string): string => {
    return cat === 'COMPANION' ? '동행' : '후기';
  };

  const getRecruitLabel = (status: string | null): string => {
    switch (status) {
      case 'RECRUITING': return '모집중';
      case 'CLOSED': return '모집완료';
      default: return '';
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return '⭐'.repeat(rating);
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days}일 (${startDate} ~ ${endDate})`;
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await getBoardDetail(bdId);
      if (response.status === 'success') {
        setBoard(response.data.board);
        
        const convertedComments: Comment[] = (response.data.comments || []).map((c: any) => ({
          id: c.cmtId,
          mId: c.mId,
          author: c.authorNickname || '알 수 없음',
          content: c.cmtContent,
          date: formatDate(c.createdAt),
          replies: (c.replies || []).map((r: any) => ({
            id: r.cmtId,
            mId: r.mId,
            author: r.authorNickname || '알 수 없음',
            content: r.cmtContent,
            date: formatDate(r.createdAt)
          }))
        }));
        
        setComments(convertedComments);
        setCommentCount(response.data.commentCount || 0);
        
        if (response.data.board.plnId) {
          fetchPlannerDetailInfo(response.data.board.plnId);
        } else {
          setPlannerDetail(null);
        }
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러오는데 실패했습니다.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchPlannerDetailInfo = async (plnId: number) => {
    try {
      const response = await getPlannerDetail(plnId);
      if (response) {
        setPlannerDetail({
          plnId: response.plnId,
          plnTitle: response.plnTitle,
          startDate: response.startDate,
          endDate: response.endDate,
          region: response.regionName || '전국',
          thumbnailUrl: response.dayPlans?.[0]?.places?.[0]?.firstimage || '',
          authorNickname: response.authorNickname || ''
        });
      }
    } catch (error) {
      console.error('플래너 상세 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [bdId]);

  // ★ 본문 메모이제이션 + H1/H2/H3 스타일 적용
  const boardContent = useMemo(() => {
    if (!board) return null;
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <style>{`
          .board-content h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            padding-bottom: 0.3em;
            border-bottom: 2px solid #e5e7eb;
          }
          .board-content h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            padding-bottom: 0.2em;
            border-bottom: 1px solid #e5e7eb;
          }
          .board-content h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
          }
          .board-content h4 {
            font-size: 1.1em;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
          }
          .board-content p {
            margin: 0.5em 0;
            line-height: 1.7;
          }
          .board-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1em 0;
          }
          .board-content ul, .board-content ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          .board-content li {
            margin: 0.25em 0;
          }
          .board-content blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1em;
            margin: 1em 0;
            color: #6b7280;
            font-style: italic;
          }
          .board-content hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 1.5em 0;
          }
          .board-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .board-content strong {
            font-weight: bold;
          }
          .board-content em {
            font-style: italic;
          }
          .board-content code {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: monospace;
          }
          .board-content pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 1em;
            border-radius: 8px;
            overflow-x: auto;
          }
        `}</style>
        <div 
          className="board-content text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: board.bdContent }}
        />
      </div>
    );
  }, [board?.bdContent]);

  const fetchCommentsOnly = async () => {
    try {
      const response = await getBoardDetail(bdId);
      if (response.status === 'success') {
        const convertedComments: Comment[] = (response.data.comments || []).map((c: any) => ({
          id: c.cmtId,
          mId: c.mId,
          author: c.authorNickname || '알 수 없음',
          content: c.cmtContent,
          date: formatDate(c.createdAt),
          replies: (c.replies || []).map((r: any) => ({
            id: r.cmtId,
            mId: r.mId,
            author: r.authorNickname || '알 수 없음',
            content: r.cmtContent,
            date: formatDate(r.createdAt)
          }))
        }));
        
        setComments(convertedComments);
        setCommentCount(response.data.commentCount || 0);
      }
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  const handleViewPlanner = () => {
    if (!board?.plnId) return;
    if (onViewPlanner) {
      onViewPlanner(board.plnId);
    }
  };

  const handleDeletePost = async () => {
    if (!currentUserId || !board) return;
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    try {
      const response = await deleteBoard(bdId, currentUserId);
      if (response.status === 'success') {
        alert('게시글이 삭제되었습니다.');
        onDelete?.();
      }
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleCloseRecruit = async () => {
    if (!currentUserId || !board) return;
    if (!confirm('모집을 마감하시겠습니까?')) return;
    
    try {
      const response = await closeRecruit(bdId, currentUserId);
      if (response.status === 'success') {
        alert('모집이 마감되었습니다.');
        fetchDetail();
      }
    } catch (error) {
      console.error('모집 마감 실패:', error);
      alert('모집 마감에 실패했습니다.');
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn || !currentUserId) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (!newComment.trim()) return;
    
    try {
      const response = await createComment({
        bdId: bdId,
        mId: currentUserId,
        cmtContent: newComment.trim()
      });
      
      if (response.status === 'success') {
        setNewComment('');
        fetchCommentsOnly();
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleAddReply = async (commentId: number) => {
    if (!isLoggedIn || !currentUserId) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (!replyContent.trim()) return;
    
    try {
      const response = await createComment({
        bdId: bdId,
        mId: currentUserId,
        parentId: commentId,
        cmtContent: replyContent.trim()
      });
      
      if (response.status === 'success') {
        setReplyContent('');
        setReplyingTo(null);
        fetchCommentsOnly();
      }
    } catch (error) {
      console.error('답글 작성 실패:', error);
      alert('답글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (cmtId: number) => {
    if (!currentUserId) return;
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    
    try {
      const response = await deleteComment(cmtId, currentUserId);
      if (response.status === 'success') {
        fetchCommentsOnly();
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <p>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isAuthor = currentUserId !== undefined && currentUserId === board.mId;
  const categoryLabel = getCategoryLabel(board.bdCategory);

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          onOpenSearch={onOpenSearch}
          isLoggedIn={isLoggedIn || false}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          onClick={onClose}
          variant="ghost"
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>

        <div className="mb-6 pb-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                    board.bdCategory === 'COMPANION'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  [{categoryLabel}]
                </span>
                
                {board.bdCategory === 'COMPANION' && board.recruitStatus && (
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                      board.recruitStatus === 'RECRUITING'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {getRecruitLabel(board.recruitStatus)}
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{board.bdTitle}</h1>
              
              {board.bdCategory === 'REVIEW' && board.bdRating && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{renderStars(board.bdRating)}</span>
                  <span className="text-sm text-gray-600">{board.bdRating}/5</span>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>작성자: {board.authorNickname}</span>
                <span>작성일: {formatDate(board.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{board.bdViewCount}</span>
              </div>
              
              {isAuthor && (
                <>
                  <div className="flex items-center gap-2">
                    {board.bdCategory === 'COMPANION' && board.recruitStatus === 'RECRUITING' && (
                      <Button 
                        onClick={handleCloseRecruit} 
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        모집 마감
                      </Button>
                    )}
                    <Button 
                      onClick={handleDeletePost} 
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={onEdit}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    편집하기
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          {(board.plnId && plannerDetail) && (
            <div className="mb-6">
              <div 
                className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow max-w-sm"
                onClick={handleViewPlanner}
              >
                <div className="relative h-28 bg-gray-200">
                  {plannerDetail.thumbnailUrl ? (
                    <img 
                      src={plannerDetail.thumbnailUrl} 
                      alt={plannerDetail.plnTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <MapPin className="h-6 w-6" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    연결된 플래너
                  </span>
                </div>
                
                <div className="p-2">
                  <h4 className="font-bold text-sm mb-1 line-clamp-1">{plannerDetail.plnTitle}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{plannerDetail.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatPeriod(plannerDetail.startDate, plannerDetail.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {boardContent}
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">댓글 ({commentCount})</h3>
          
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div key={comment.id}>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.author}</span>
                      {comment.mId === board.mId && (
                        <span className="text-xl" title="작성자">👑</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{comment.date}</span>
                      {currentUserId === comment.mId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        alert('로그인이 필요한 서비스입니다.');
                        return;
                      }
                      setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    답글 달기
                  </button>

                  {replyingTo === comment.id && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-300">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="답글을 입력하세요..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleAddReply(comment.id);
                          }}
                          className="flex-1"
                        />
                        <Button onClick={() => handleAddReply(comment.id)} size="sm">
                          작성
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {comment.replies.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{reply.author}</span>
                            {reply.mId === board.mId && (
                              <span className="text-lg" title="작성자">👑</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{reply.date}</span>
                            {currentUserId === reply.mId && (
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인이 필요합니다"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
                disabled={!isLoggedIn}
                className="flex-1"
              />
              <Button onClick={handleAddComment} disabled={!isLoggedIn}>
                작성
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
