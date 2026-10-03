import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatPodConditions } from './lib/podFilters';

export default function PodConfirmation({ pod, onClose }) {
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

  const date = new Date(`${pod.date}T12:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  return createPortal(<dialog ref={dialog} className="pod-confirm-dialog" aria-labelledby="pod-confirm-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="pod-confirm-scroll">
      <div className="pod-success-icon" aria-hidden="true">✓</div>
      <h2 id="pod-confirm-title">약속이 확정됐어요</h2>
      <p className="pod-confirm-subtitle">{pod.title}</p>
      <dl className="pod-confirm-summary">
        <div><dt>식당</dt><dd>{pod.restaurantName}</dd></div>
        <div><dt>일시</dt><dd>{date} · {pod.time}</dd></div>
        <div><dt>만남장소</dt><dd>{pod.meeting}</dd></div>
        <div><dt>참여 인원</dt><dd>{pod.participants}명{pod.capacity !== null && <span> / 최대 {pod.capacity}명</span>}</dd></div>
        {formatPodConditions(pod).length > 0 && <div><dt>참여 조건</dt><dd>{formatPodConditions(pod).join(' · ')}</dd></div>}
        {pod.note && <div><dt>참고</dt><dd>{pod.note}</dd></div>}
      </dl>
    </div>
    <footer className="pod-confirm-footer">
      <p>데모 참여 내역은 이 브라우저에만 저장돼요.</p>
      <button type="button" className="pod-primary" autoFocus onClick={onClose}>확인</button>
    </footer>
  </dialog>, document.body);
}
