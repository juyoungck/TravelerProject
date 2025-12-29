/**
 * WithdrawalModal.tsx - 회원탈퇴 모달
 * 회원탈퇴 확인 및 처리
 */

import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WithdrawalModal({ isOpen, onClose, onConfirm }: WithdrawalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h3>회원탈퇴</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            정말로 탈퇴하시겠습니까?
          </p>
          <p className="text-sm text-gray-600">
            탈퇴 시 모든 정보가 삭제되며, 복구할 수 없습니다.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            취소
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600">
            예, 탈퇴합니다
          </Button>
        </div>
      </div>
    </div>
  );
}
