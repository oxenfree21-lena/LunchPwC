import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Small centered dialog with a title, optional message or content, and buttons.
// With three buttons the primary one takes the first row on its own.
export default function MessageDialog({ title, message, children, actions, onDismiss }) {
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

  return createPortal(<dialog ref={dialog} className="pod-search-dialog pod-message-dialog" aria-labelledby="pod-message-heading"
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation(); }}>
    <h2 id="pod-message-heading">{title}</h2>
    {message && <p>{message}</p>}
    {children}
    <div className={`pod-dialog-actions${actions.length > 2 ? ' is-stacked' : ''}`}>
      {actions.map(({ label, primary, onClick }, index) => <button type="button" key={label} className={primary ? 'pod-primary' : 'pod-dialog-secondary'}
        autoFocus={index === actions.findIndex(action => !action.primary)} onClick={onClick}>{label}</button>)}
    </div>
  </dialog>, document.body);
}
