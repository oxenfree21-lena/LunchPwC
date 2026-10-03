import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function RandomPodSearch({ onComplete, onCancel }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    const timer = window.setTimeout(onComplete, 3500);
    return () => {
      window.clearTimeout(timer);
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onComplete]);

  return createPortal(<dialog ref={dialog} className="pod-search-dialog" aria-labelledby="random-pod-heading"
    onCancel={event => { event.preventDefault(); onCancel(); }}>
    <div className="pod-search-animation" aria-hidden="true"><span/><span/><span/></div>
    <h2 id="random-pod-heading" role="status">참여 가능한 팟을 찾고 있어요</h2>
    <p>잠시만 기다려주세요</p>
    <button type="button" className="pod-cancel" onClick={onCancel}>그만 찾기</button>
  </dialog>, document.body);
}
