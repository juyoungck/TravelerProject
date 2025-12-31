/**
 * BoardDetailPage.tsx - 게시판 상세 페이지
 * 게시글 내용 표시 및 댓글/답글 기능 (API 연동)
 */

import { useState, useEffect } from 'react';
import { Eye, Trash2, ArrowLeft } from 'lucide-react';
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

interface BoardDetailPageProps {
  bdId: number;
  onClose: () => void;
  onDelete?: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  currentUserId?: number;
  onOpenSearch?: () => void;
}

export function BoardDetailPage({ 
  bdId, 
  onClose, 
  onDelete,
  onNavigate, 
  isLoggedIn, 
  currentUserId,
  onOpenSearch 
}: BoardDetailPageProps) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  /** 날짜 포맷 */
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR');
  };

  /** 카테고리 영문 → 한글 */
  const getCategoryLabel = (cat: string): string => {
    return cat === 'COMPANION' ? '동행' : '후기';
  };

  /** 모집상태 영문 → 한글 */
  const getRecruitLabel = (status: string | null): string => {
    switch (status) {
      case 'RECRUITING': return '모집중';
      case 'CLOSED': return '모집완료';
      default: return '';
    }
  };

  /** 별점 렌더링 */
  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return '⭐'.repeat(rating);
  };

  /** 게시글 상세 조회 */
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
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러오는데 실패했습니다.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [bdId]);

  /** 게시글 삭제 */
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

  /** 모집 마감 */
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

  /** 댓글 작성 */
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
        fetchDetail();
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  /** 답글 작성 */
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
        fetchDetail();
      }
    } catch (error) {
      console.error('답글 작성 실패:', error);
      alert('답글 작성에 실패했습니다.');
    }
  };

  /** 댓글/답글 삭제 */
  const handleDeleteComment = async (cmtId: number) => {
    if (!currentUserId) return;
    
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    
    try {
      const response = await deleteComment(cmtId, currentUserId);
      if (response.status === 'success') {
        fetchDetail();
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
        {/* ★ 목록으로 버튼 */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>

        {/* 게시글 헤더 */}
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
            
            {/* ★ 조회수 + 버튼들 (오른쪽 상단) */}
            <div className="flex flex-col items-end gap-3">
              {/* 조회수 */}
              <div className="flex items-center gap-1 text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{board.bdViewCount}</span>
              </div>
              
              {/* ★ 작성자 버튼들 - 조회수 아래 */}
              {isAuthor && (
                <div className="flex items-center gap-2">
                  {/* 동행 + 모집중일 때만 모집 마감 버튼 */}
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
                  {/* 삭제 버튼 */}
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
              )}
            </div>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="mb-8">
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div 
              className="text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: board.bdContent }}
            />
          </div>

          {board.plannerTitle && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              📋 연결된 플래너: <span className="font-semibold">{board.plannerTitle}</span>
            </div>
          )}
        </div>

        {/* 댓글 */}
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
                            if (e.key === 'Enter') {
                              handleAddReply(comment.id);
                            }
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
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
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