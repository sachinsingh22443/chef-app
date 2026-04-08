import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

export default function Reviews() {
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const reviews = [
    {
      id: "1",
      customer: "Priya Sharma",
      rating: 5,
      date: "2 days ago",
      comment: "Absolutely delicious! The Rajasthani Thali was authentic and perfectly spiced. Will order again!",
      dish: "Rajasthani Thali",
      reply: null,
    },
    {
      id: "2",
      customer: "Amit Patel",
      rating: 4,
      date: "5 days ago",
      comment: "Good food, slightly delayed delivery but worth the wait. Packaging was excellent.",
      dish: "Dal Bati Churma",
      reply: "Thank you for your feedback! We're working on improving our delivery times. Hope to serve you again soon!",
    },
    {
      id: "3",
      customer: "Sneha Gupta",
      rating: 5,
      date: "1 week ago",
      comment: "Best homemade food I've had! Tastes just like my grandmother's cooking. Highly recommend!",
      dish: "Gatte ki Sabzi",
      reply: null,
    },
    {
      id: "4",
      customer: "Rahul Singh",
      rating: 3,
      date: "1 week ago",
      comment: "Food was okay, but quantity was less than expected for the price.",
      dish: "Rajasthani Thali",
      reply: null,
    },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 187, percentage: 80 },
    { stars: 4, count: 35, percentage: 15 },
    { stars: 3, count: 8, percentage: 3 },
    { stars: 2, count: 3, percentage: 1 },
    { stars: 1, count: 1, percentage: 1 },
  ];

  const handleReply = (reviewId: string) => {
    // In production, submit reply to backend
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-300 to-orange-500 rounded-b-[40px] p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Reviews</h1>
            <p className="text-white/90">Customer feedback</p>
          </div>
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3">
            <p className="text-3xl font-bold text-white">4.9</p>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-white text-white" />
              ))}
            </div>
            <p className="text-xs text-white/80">234 reviews</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Rating Breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {ratingBreakdown.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium text-gray-700">{rating.stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    style={{ width: `${rating.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{rating.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {review.customer.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{review.customer}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  review.rating >= 4 ? "bg-green-100 text-green-600" :
                  review.rating === 3 ? "bg-yellow-100 text-yellow-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  {review.rating >= 4 ? "Positive" : review.rating === 3 ? "Neutral" : "Negative"}
                </div>
              </div>

              {/* Dish Tag */}
              <div className="mb-3">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium">
                  {review.dish}
                </span>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {review.comment}
              </p>

              {/* Chef's Reply */}
              {review.reply && (
                <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">👨‍🍳</div>
                    <p className="font-medium text-gray-800 text-sm">Chef's Response</p>
                  </div>
                  <p className="text-gray-700 text-sm">{review.reply}</p>
                </div>
              )}

              {/* Reply Section */}
              {!review.reply && replyingTo === review.id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write your response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setReplyingTo(null)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleReply(review.id)}
                      size="sm"
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      Send Reply
                    </Button>
                  </div>
                </div>
              ) : !review.reply ? (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="mt-3 flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  Reply to customer
                </button>
              ) : null}

              {/* Helpful Button */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful feedback</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-3xl p-5">
          <h3 className="font-bold text-gray-800 mb-3">💡 Tips for Great Reviews</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Respond to all reviews, especially negative ones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Thank customers for positive feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Address concerns professionally and offer solutions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
