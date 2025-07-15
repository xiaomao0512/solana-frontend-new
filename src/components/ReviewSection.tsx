import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useNotificationContext } from '../contexts/NotificationContext';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  listingId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewSubmit?: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  className?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  listingId,
  reviews,
  averageRating,
  totalReviews,
  onReviewSubmit,
  className = ''
}) => {
  const { isConnected, walletAddress } = useWallet();
  const { success, error: showError } = useNotificationContext();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      showError('請先連接錢包');
      return;
    }

    if (!comment.trim()) {
      showError('請輸入評論內容');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        userId: walletAddress || '',
        userName: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '匿名用戶',
        rating,
        comment: comment.trim()
      };

      if (onReviewSubmit) {
        onReviewSubmit(newReview);
      }

      // 模擬提交評論
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('評論提交成功', '您的評論已成功提交，感謝您的回饋！');
      setShowReviewForm(false);
      setRating(5);
      setComment('');
    } catch (err) {
      showError('評論提交失敗', err instanceof Error ? err.message : '請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
            disabled={!interactive}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* 評分摘要 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-500">平均評分</div>
          </div>
          <div>
            {renderStars(averageRating)}
            <div className="text-sm text-gray-500 mt-1">{totalReviews} 則評論</div>
          </div>
        </div>
        
        {isConnected && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showReviewForm ? '取消評論' : '寫評論'}
          </button>
        )}
      </div>

      {/* 評論表單 */}
      {showReviewForm && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">寫評論</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">評分</label>
              {renderStars(rating, true, setRating)}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評論內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請分享您的住宿體驗..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '提交中...' : '提交評論'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 評論列表 */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">所有評論</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-2 text-gray-500">還沒有評論</p>
            {isConnected && (
              <p className="text-sm text-gray-400">成為第一個評論的人吧！</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{review.userName}</div>
                      <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                  </div>
                </div>
                
                <div className="ml-13">
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 