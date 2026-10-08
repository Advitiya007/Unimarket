import { useState } from 'react';
import toast from 'react-hot-toast';
import StarRating from './StarRating';
import axios from 'axios';

export default function RatingModal({ transaction, onClose, onSubmitted }) {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/ratings`, { transactionId: transaction._id, stars, review }, { withCredentials: true });
      toast.success('Rating submitted — thank you!');
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <h3 className="h-display text-xl text-campus-ink">Rate this trade</h3>
        <p className="mt-1 text-sm text-campus-ink/50">{transaction.listing?.title}</p>
        <div className="mt-5 flex justify-center">
          <StarRating value={stars} onChange={setStars} size={28} />
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Optional review…"
          rows={3}
          className="input-field mt-4 resize-none"
        />
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
