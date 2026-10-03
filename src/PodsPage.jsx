import React, { useState } from 'react';
import { createDemoPods, formatPodDate, readSavedPods } from './data/pods';
import PodConfirmation from './PodConfirmation';

const JOINED_PODS_KEY = 'lunchpwc:joined-pods';
const participationKey = pod => `${pod.id}:${pod.date}:${pod.time}`;

function readParticipation() {
  try {
    const saved = JSON.parse(localStorage.getItem(JOINED_PODS_KEY) || '[]');
    return new Set(Array.isArray(saved) ? saved.filter(key => typeof key === 'string') : []);
  } catch { return new Set(); }
}

function PodIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'time' ? <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>
      : type === 'place' ? <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>
        : <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></>}
  </svg>;
}

export default function PodsPage({ onCreatePod }) {
  const [pods] = useState(() => [...readSavedPods(), ...createDemoPods()]);
  const [joined, setJoined] = useState(readParticipation);
  const [confirmedPod, setConfirmedPod] = useState(null);
  const [error, setError] = useState(null);
  const displayedPods = pods.map(pod => ({ ...pod,
    joined: !pod.isMine && joined.has(participationKey(pod)),
    participants: pod.participants + (!pod.isMine && joined.has(participationKey(pod)) ? 1 : 0),
  }));
  function joinPod(pod) {
    if (pod.joined) { setConfirmedPod(pod); return; }
    if (pod.isMine || (pod.capacity !== null && pod.participants >= pod.capacity)) return;
    try {
      const next = new Set([...readParticipation(), ...joined, participationKey(pod)]);
      localStorage.setItem(JOINED_PODS_KEY, JSON.stringify([...next]));
      setJoined(next);
      setError(null);
      setConfirmedPod({ ...pod, participants: pod.participants + 1, joined: true });
    } catch { setError({ id: pod.id, message: '참여 내역을 저장하지 못했어요. 다시 시도해주세요.' }); }
  }
  function cancelParticipation(pod) {
    if (!pod.joined || pod.isMine) return;
    try {
      const next = new Set([...readParticipation(), ...joined]);
      next.delete(participationKey(pod));
      localStorage.setItem(JOINED_PODS_KEY, JSON.stringify([...next]));
      setJoined(next);
      setError(null);
    } catch { setError({ id: pod.id, message: '참여를 취소하지 못했어요. 다시 시도해주세요.' }); }
  }
  return <section className="pods-page" aria-labelledby="pods-heading">
    <header className="pods-header">
      <div><h2 id="pods-heading" tabIndex={-1}>팟</h2><p>모집 중 <span>{displayedPods.filter(pod => pod.capacity === null || pod.participants < pod.capacity).length}</span></p></div>
      <button type="button" className="pods-create" onClick={onCreatePod}><span aria-hidden="true">+</span> 팟 만들기</button>
    </header>
    <ul className="pods-list">
      {displayedPods.map(pod => {
        const full = pod.capacity !== null && pod.participants >= pod.capacity;
        return <li key={pod.id} className="pod-card">
        <article aria-labelledby={`pod-name-${pod.id}`}>
          <div className="pod-card-top">
            <span className={`pod-card-status${full ? ' is-full' : ''}`}>{full ? '모집 완료' : '모집 중'}</span>{pod.isMine && <span className="pod-card-mine">내 팟</span>}
            <div className="pod-card-members"><PodIcon type="people"/>
              {pod.capacity === null ? <span><strong>{pod.participants}명</strong> · 인원 제한 없음</span>
                : <span><strong>{pod.participants}</strong> / {pod.capacity}명</span>}
            </div>
          </div>
          <h3 id={`pod-name-${pod.id}`}>{pod.title}</h3>
          <div className="pod-card-details">
            <div>
              <p className="pod-card-restaurant">{pod.restaurantName}</p>
              {pod.note && <p className="pod-card-note">{pod.note}</p>}
            </div>
            <div className="pod-card-meeting-row">
              <div className="pod-card-logistics">
                <div className="pod-card-meta"><PodIcon type="time"/><span>{formatPodDate(pod.date)} · {pod.time}</span></div>
                <div className="pod-card-meta"><PodIcon type="place"/><span>{pod.meeting}</span></div>
              </div>
              <div className="pod-card-action">
                <button type="button" className={`pod-join${pod.joined ? ' is-joined' : ''}`} disabled={pod.isMine || (full && !pod.joined)} onClick={() => joinPod(pod)}>
                  {pod.isMine ? '내가 만든 팟' : pod.joined ? '약속 보기' : full ? '모집 완료' : '참여하기'}
                </button>
                {pod.joined && <button type="button" className="pod-cancel" onClick={() => cancelParticipation(pod)}>취소하기</button>}
              </div>
            </div>
            {error?.id === pod.id && <p className="pod-card-error" role="alert">{error.message}</p>}
          </div>
        </article>
      </li>; })}
    </ul>
    {confirmedPod && <PodConfirmation pod={confirmedPod} onClose={() => setConfirmedPod(null)} />}
  </section>;
}
