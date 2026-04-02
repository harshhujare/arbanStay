import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, Send, LogIn } from "lucide-react";
import { getReviews, createReview, deleteReview } from "../../api/reviewService";
import { useAuth } from "../../context/AuthContext";

const StarRating = ({ rating, onRate, interactive = false, size = 20 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        onClick={interactive ? () => onRate(star) : undefined}
        className={`transition-colors ${
          interactive ? "cursor-pointer" : ""
        } ${
          star <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-none text-gray-300"
        }`}
      />
    ))}
  </div>
);

export default function ReviewSection({ propertyId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getReviews(propertyId);
      setReviews(res.data || []);
      setMeta(res.meta || { total: 0, avgRating: 0 });
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const hasUserReviewed = reviews.some(
    (r) => r.userId?._id === user?.id || r.userId?._id === user?._id
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    try {
      setSubmitting(true);
      await createReview(propertyId, { rating, comment: comment.trim() });
      setRating(0);
      setComment("");
      setSuccessMsg("Review submitted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchReviews();
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(reviewId);
      fetchReviews();
    } catch {
      setError("Failed to delete review.");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="py-8 border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
        <h2 className="text-2xl font-semibold text-gray-900">
          {meta.total > 0
            ? `${meta.avgRating} · ${meta.total} Review${meta.total !== 1 ? "s" : ""}`
            : "No Reviews Yet"}
        </h2>
      </div>

      {/* Write Review Form */}
      {isAuthenticated ? (
        hasUserReviewed ? (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            ✓ You've already reviewed this property.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Write a Review
            </h3>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <StarRating rating={rating} onRate={setRating} interactive />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {comment.length}/1000
              </p>
            </div>

            {/* Error & Success */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {successMsg && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {successMsg}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </form>
        )
      ) : (
        <div className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
          <LogIn className="w-5 h-5 text-gray-500" />
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">Log in</span> to write
            a review.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#FF5A5F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Be the first to review this property!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="flex gap-4 p-5 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#FF5A5F] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {review.userId?.profilePhoto ? (
                  <img
                    src={review.userId.profilePhoto}
                    alt={review.userId.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  review.userId?.name?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {review.userId?.name || "Anonymous"}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <StarRating rating={review.rating} size={14} />
                <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                  {review.comment}
                </p>

                {/* Delete if own review or admin */}
                {(review.userId?._id === user?.id ||
                  review.userId?._id === user?._id ||
                  user?.role === "admin") && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
