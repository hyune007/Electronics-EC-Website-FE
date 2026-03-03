import React, { useCallback, useEffect, useMemo, useState } from "react";
import DescribeProductTab from "./tab/DescribeProduct/DescribeProductTab.jsx";
import ReviewTab from "./tab/ReviewTab/ReviewTab.jsx";
import ReviewSummary from "./tab/ReviewTab/ReviewSummary.jsx";
import ReviewModal from "./tab/ReviewTab/ReviewModal.jsx";
import vi from "../../../../i18n/vi.js";
import {
  getReviewsByProductId,
  createReview,
} from "../../../../services/reviewService.js";
import { useAuth } from "../../../../hooks/useAuth";

export default function ProductTabs({ product, onRequireAuth, onStatsChange }) {
  const [activeTab, setActiveTab] = useState("desc");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { user, isAuthenticated, isCustomer } = useAuth();

  const tabClass = (tab) =>
    `px-4 py-1 border-b-2 ${
      activeTab === tab
        ? "border-primary font-bold text-primary dark:text-white"
        : "border-transparent text-slate-500 font-medium hover:text-slate-800 dark:hover:text-slate-200"
    }`;

  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    setLoadingReviews(true);
    setError("");
    try {
      const res = await getReviewsByProductId(product.id);
      setReviews(res.data || []);
    } catch (err) {
      setError("Không thể tải danh sách đánh giá.");
      setReviews([]);
      void err;
    } finally {
      setLoadingReviews(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews().catch(() => {});
  }, [fetchReviews]);

  const reviewStats = useMemo(() => {
    if (!reviews?.length) {
      return {
        average: 0,
        total: 0,
        breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((item) => {
      const rating = Number(item.rating) || 0;
      if (rating >= 1 && rating <= 5) {
        breakdown[rating] += 1;
        sum += rating;
      }
    });

    const total = reviews.length;
    const average = total ? sum / total : 0;

    return { average, total, breakdown };
  }, [reviews]);

  useEffect(() => {
    onStatsChange?.(reviewStats);
  }, [reviewStats, onStatsChange]);

  const handleWriteReview = () => {
    if (!isAuthenticated || !isCustomer) {
      onRequireAuth?.();
      setActiveTab("review");
      return;
    }
    setModalOpen(true);
  };

  const handleSubmitReview = async ({ rating, content }) => {
    if (!product?.id || !user?.id) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        rating,
        content,
        product: { id: product.id },
        customer: { id: user.id },
      };
      const res = await createReview(payload);
      setReviews((prev) => [res.data, ...prev]);
      setModalOpen(false);
    } catch (err) {
      setError("Không thể gửi đánh giá. Vui lòng thử lại.");
      void err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          className={tabClass("desc")}
          onClick={() => setActiveTab("desc")}
        >
          {vi.product.tabs.desc}
        </button>
        <button
          className={tabClass("review")}
          onClick={() => setActiveTab("review")}
        >
          {vi.product.tabs.reviews}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === "review" ? (
          <div className="lg:col-span-3">
            <ReviewTab
              reviews={reviews}
              loading={loadingReviews}
              onWriteReview={handleWriteReview}
            />
          </div>
        ) : (
          <>
            <div className="lg:col-span-2">
              <DescribeProductTab product={product} />
            </div>
            <div className="space-y-8">
              <ReviewSummary
                stats={reviewStats}
                onWriteReview={handleWriteReview}
              />
            </div>
          </>
        )}
      </div>

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitReview}
        submitting={submitting}
      />
    </>
  );
}
