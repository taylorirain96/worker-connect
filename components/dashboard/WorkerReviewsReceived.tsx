import { Star, MessageSquare, Send } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import RatingStars from '@/components/reviews/RatingStars'
import { formatRelativeDate } from '@/lib/utils'
import type { DetailedReview } from '@/types'

interface Props {
  reviews: DetailedReview[]
  loadingReviews: boolean
  respondingId: string | null
  responseText: string
  submittingResponse: boolean
  onStartResponse: (reviewId: string) => void
  onCancelResponse: () => void
  onChangeResponse: (text: string) => void
  onSubmitResponse: (reviewId: string) => void
}

export default function WorkerReviewsReceived({
  reviews,
  loadingReviews,
  respondingId,
  responseText,
  submittingResponse,
  onStartResponse,
  onCancelResponse,
  onChangeResponse,
  onSubmitResponse,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
          <CardTitle>Reviews Received</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loadingReviews ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete jobs to start receiving reviews.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.isAnonymous ? 'Anonymous' : review.reviewerName}
                    </p>
                    <p className="text-xs text-gray-500">{review.jobTitle} · {formatRelativeDate(review.createdAt)}</p>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>

                {review.response && (
                  <div className="mt-3 pl-3 border-l-2 border-primary-200 dark:border-primary-800">
                    <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Your response:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.response.text}</p>
                  </div>
                )}

                {!review.response && respondingId !== review.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => onStartResponse(review.id)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Respond
                  </Button>
                )}

                {!review.response && respondingId === review.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={3}
                      value={responseText}
                      onChange={(e) => onChangeResponse(e.target.value)}
                      placeholder="Write your response..."
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancelResponse}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        loading={submittingResponse}
                        onClick={() => onSubmitResponse(review.id)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Post Response
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
