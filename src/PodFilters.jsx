import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatPodDate } from './data/pods';
import { emptyPodFilters, foodTypes, timeSlots, filterPods } from './lib/podFilters';

function Choices({ label, value, options, onChange, className = '' }) {
  return <fieldset className={`pod-filter-group ${className}`}>
    <legend>{label}</legend>
    <div className="pod-filter-choices">
      {options.map(([key, text, detail]) => <button type="button" key={key} aria-pressed={value === key}
        onClick={() => onChange(value === key ? '' : key)}>
        {text}{detail && <small>{detail}</small>}
      </button>)}
    </div>
  </fieldset>;
}

export default function PodFilters({ filters, pods, onApply, onClose }) {
  const [draft, setDraft] = useState(filters);
  const dialog = useRef(null);
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
  const set = key => value => setDraft(current => ({ ...current, [key]: value }));
  const dates = [...new Set(pods.map(pod => pod.date).concat(draft.date || []))].sort();
  const count = filterPods(pods, draft).length;

  return createPortal(<dialog ref={dialog} id="pod-filter-dialog" className="pod-filter-dialog" aria-labelledby="pod-filter-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="pod-filter-handle" aria-hidden="true" />
    <header className="pod-filter-header"><h2 id="pod-filter-title">필터</h2>
      <button type="button" onClick={onClose} aria-label="필터 닫기" autoFocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </header>
    <div className="pod-filter-body">
      <Choices label="음식 종류" value={draft.food} options={['', ...foodTypes].map(food => [food, food || '전체'])} onChange={set('food')} />
      <Choices label="날짜" value={draft.date} className="pod-filter-dates" options={[
        ['', '전체'], ...dates.map(date => [date, formatPodDate(date)]),
      ]} onChange={set('date')} />
      <label className="pod-filter-calendar"><span>직접 선택</span><input type="date" aria-label="날짜 직접 선택" value={draft.date} onChange={event => set('date')(event.target.value)} /></label>
      <Choices label="시간대" value={draft.time} className="pod-filter-times" options={[
        ['', '전체'], ...timeSlots.map(([key, label]) => [key, ...label.split(' · ')]),
      ]} onChange={set('time')} />
      <Choices label="모집 인원" value={draft.capacity} options={[
        ['', '전체'], ['small', '2–4명'], ['medium', '5–6명'], ['large', '7–8명'], ['unlimited', '제한 없음'],
      ]} onChange={set('capacity')} />
    </div>
    <footer className="pod-filter-footer">
      <button type="button" className="pod-filter-reset" onClick={() => setDraft(emptyPodFilters)}>초기화</button>
      <button type="button" className="pod-primary" onClick={() => onApply(draft)}>{count}개 팟 보기</button>
    </footer>
  </dialog>, document.body);
}
