import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const tags = ['빠른 식사', '단체 식사', '혼밥', '가성비', '웨이팅 필수', '조용한', '분위기 좋은'];

export default function ReviewSheet({ name, onClose, onSubmit }) {
  const dialog = useRef(null);
  const [menu, setMenu] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(<dialog ref={dialog} className="review-sheet" aria-labelledby="review-sheet-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => event.stopPropagation()}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <form className="review-sheet-form" onSubmit={event => {
      event.preventDefault();
      if (!menu.trim() || !text.trim() || !rating) return;
      try { onSubmit({ menu: menu.trim(), rating, tags: selectedTags, review: text.trim() }); }
      catch { setError('저장하지 못했어요. 다시 시도해주세요.'); }
    }}>
      <header className="review-sheet-header">
        <div><p>{name}</p><h2 id="review-sheet-title">리뷰 쓰기</h2></div>
        <button type="button" className="review-sheet-close" aria-label="리뷰 작성 닫기" autoFocus onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
        </button>
      </header>
      <div className="review-sheet-body">
        <div className="review-field">
          <label htmlFor="review-menu">먹은 메뉴</label>
          <input id="review-menu" placeholder="예: 고기국수, 수육" value={menu} onChange={event => setMenu(event.target.value)} maxLength={100} required />
        </div>
        <fieldset className="review-field review-rating-field">
          <legend>별점</legend>
          <div className="review-rating-options">
            {[1, 2, 3, 4, 5].map(value => <label key={value} className={value <= rating ? 'is-filled' : ''}>
              <input type="radio" name="review-rating" value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`${value}점`} required />
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.4l6.3-.9Z" /></svg>
            </label>)}
            <span aria-live="polite">{rating ? `${rating}점` : '선택해주세요'}</span>
          </div>
        </fieldset>
        <fieldset className="review-field">
          <legend>이런 식당이에요 <span>여러 개 선택</span></legend>
          <div className="review-tag-options">
            {tags.map(tag => <label key={tag} className={selectedTags.includes(tag) ? 'is-selected' : ''}>
              <input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => setSelectedTags(previous => previous.includes(tag) ? previous.filter(item => item !== tag) : [...previous, tag])} />
              <span>{tag}</span>
            </label>)}
          </div>
        </fieldset>
        <div className="review-field">
          <label htmlFor="review-text">리뷰</label>
          <textarea id="review-text" placeholder="음식과 분위기는 어땠나요?" value={text} onChange={event => setText(event.target.value)} rows={4} maxLength={1000} required />
          <span className="review-character-count">{text.length} / 1,000</span>
        </div>
      </div>
      <footer className="review-sheet-footer">
        <p role={error ? 'alert' : undefined}>{error || '작성한 리뷰는 이 기기에만 저장돼요.'}</p>
        <button type="submit" disabled={!menu.trim() || !rating || !text.trim()}>등록하기</button>
      </footer>
    </form>
  </dialog>, document.body);
}
