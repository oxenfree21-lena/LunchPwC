import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Short waiting dialog shown before a random match or a signup completes.
export default function PodWaitDialog({ title, message = '잠시만 기다려주세요', cancelLabel, duration, onComplete, onCancel }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    const timer = window.setTimeout(onComplete, duration);
    return () => {
      window.clearTimeout(timer);
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onComplete, duration]);

  return createPortal(<dialog ref={dialog} className="pod-search-dialog" aria-labelledby="pod-wait-heading"
    onCancel={event => { event.preventDefault(); onCancel(); }}
    onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation(); }}>
    <div className="pod-search-animation" aria-hidden="true"><span/><span/><span/></div>
    <h2 id="pod-wait-heading" role="status">{title}</h2>
    <p>{message}</p>
    <button type="button" className="pod-cancel" onClick={onCancel}>{cancelLabel}</button>
  </dialog>, document.body);
}
