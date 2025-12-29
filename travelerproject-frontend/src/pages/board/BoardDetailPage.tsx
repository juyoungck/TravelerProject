/**
 * BoardDetailPage.tsx - 게시판 상세 페이지
 * 게시글 내용 표시 및 댓글/답글 기능
 */

import { useState } from 'react';
import { Eye, X, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Header } from '../../components/layout/Header';
import type { BoardPost } from './BoardListPage';

interface Reply {
  id: number;
  author: string;
  content: string;
  date: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  replies: Reply[];
}

interface BoardDetailPageProps {
  post: BoardPost;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onOpenSearch?: () => void;
}

export function BoardDetailPage({ post, onClose, onNavigate, isLoggedIn, onOpenSearch }: BoardDetailPageProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '김철수',
      content: '저도 함께하고 싶어요!',
      date: '2025/12/18 14:30',
      replies: [
        {
          id: 1,
          author: post.author,
          content: '감사합니다! 연락 주세요.',
          date: '2025/12/18 14:45',
        },
      ],
    },
    {
      id: 2,
      author: '이영희',
      content: '일정 조율 가능한가요?',
      date: '2025/12/18 15:20',
      replies: [],
    },
    {
      id: 3,
      author: post.author,
      content: '많은 관심 감사드립니다!',
      date: '2025/12/18 16:10',
      replies: [],
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<number[]>([1]);

  const handleAddComment = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: comments.length + 1,
      author: '사용자',
      content: newComment,
      date: new Date().toLocaleString('ko-KR'),
      replies: [],
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleAddReply = (commentId: number) => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (!replyContent.trim()) return;
    
    setComments(comments.map((comment) => {
      if (comment.id === commentId) {
        const newReply: Reply = {
          id: comment.replies.length + 1,
          author: '사용자',
          content: replyContent,
          date: new Date().toLocaleString('ko-KR'),
        };
        return {
          ...comment,
          replies: [...comment.replies, newReply],
        };
      }
      return comment;
    }));
    
    setReplyContent('');
    setReplyingTo(null);
    
    // 답글을 추가하면 자동으로 펼치기
    if (!expandedComments.includes(commentId)) {
      setExpandedComments([...expandedComments, commentId]);
    }
  };

  const toggleExpanded = (commentId: number) => {
    if (expandedComments.includes(commentId)) {
      setExpandedComments(expandedComments.filter((id) => id !== commentId));
    } else {
      setExpandedComments([...expandedComments, commentId]);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = (commentId: number) => {
    if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      setComments(comments.filter((comment) => comment.id !== commentId));
    }
  };

  // 답글 삭제
  const handleDeleteReply = (commentId: number, replyId: number) => {
    if (confirm('정말로 이 답글을 삭제하시겠습니까?')) {
      setComments(comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== replyId),
          };
        }
        return comment;
      }));
    }
  };

  // 현재 로그인한 사용자 (임시로 '사용자'로 설정)
  const currentUser = '사용자';

  // Mock 게시글 내용
  const mockContent = post.category === '동행'
    ? `안녕하세요! 12월 25일에 독도를 방문하려고 하는데, 함께 가실 분 계신가요?\n\n일정:\n- 날짜: 2025년 12월 25일\n- 출발: 강릉항 또는 묵호항\n- 인원: 2~4명\n\n관심 있으신 분은 댓글 남겨주세요!`
    : `제주도 3박 4일 여행 다녀왔습니다!\n\n너무 좋은 경험이었어요. 날씨도 좋고 경치도 아름다웠습니다.\n특히 성산일출봉에서 본 일출은 정말 잊을 수 없을 것 같아요.\n\n다음에 또 가고 싶네요!`;

  const mockImages = post.category === '후기' ? [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
  ] : [];

  // 별점 렌더링 (예시로 4.5점)
  const rating = post.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 - 네비게이션 포함 */}
      {onNavigate && (
        <Header
          onSearch={() => {}}
          onNavigate={onNavigate}
          onOpenSearch={onOpenSearch}
          isLoggedIn={isLoggedIn || false}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* 게시글 헤더 */}
        <div className="mb-6 pb-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1 text-sm rounded ${
                  post.category === '동행'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-purple-100 text-purple-600'
                }`}
              >
                [{post.category}]
              </span>
              <h1>{post.title}</h1>
              {post.category === '후기' && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">{renderStars()}</span>
                  <span className="text-sm text-gray-600">{rating}/5</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="h-4 w-4" />
              <span>{post.views}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>작성자: {post.author}</span>
            <span>작성일: {post.date}</span>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="mb-8">
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {mockContent}
            </p>
          </div>

          {/* 사진 (후기인 경우) */}
          {mockImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {mockImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`첨부 이미지 ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        {/* 댓글 */}
        <div className="mb-8">
          <h3 className="mb-4">댓글 ({comments.length})</h3>
          
          {/* 댓글 목록 */}
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div key={comment.id}>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.author}</span>
                      {comment.author === post.author && (
                        <span className="text-xl" title="작성자">👑</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{comment.date}</span>
                      {/* 작성자 본인만 삭제 버튼 표시 */}
                      {comment.author === currentUser && (
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
                  
                  {/* 답글 버튼 */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      답글 달기
                    </button>
                  </div>

                  {/* 답글 입력 */}
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

                {/* 답글 목록 - 항상 표시 */}
                {comment.replies.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{reply.author}</span>
                            {reply.author === post.author && (
                              <span className="text-lg" title="작성자">👑</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{reply.date}</span>
                            {/* 답글 작성자 본인만 삭제 버튼 표시 */}
                            {reply.author === currentUser && (
                              <button
                                onClick={() => handleDeleteReply(comment.id, reply.id)}
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

          {/* 댓글 작성 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleAddComment}>작성</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
