import { FiStar } from 'react-icons/fi';

export default function StarRating({ value = 0, onChange, size = 20, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(s)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
        >
          <FiStar
            size={size}
            className={s <= value ? 'fill-campus-orange text-campus-orange' : 'text-campus-ink/20'}
          />
        </button>
      ))}
    </div>
  );
}
