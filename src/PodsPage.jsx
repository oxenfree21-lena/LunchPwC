import React, { useCallback, useState } from 'react';
import { createDemoPods, formatPodDate, readSavedPods } from './data/pods';
import PodConfirmation from './PodConfirmation';
import RandomPodSearch from './RandomPodSearch';
import PodFilters from './PodFilters';
import { emptyPodFilters, filterPods, canJoinPod, pickRandomPod, countPodFilters, formatPodConditions, meetsPodConditions } from './lib/podFilters';
import { participationKey, readParticipation, joinPod as saveParticipation, cancelParticipation as removeParticipation, useLocalActivity } from './data/localActivity';

function withParticipation(pods) {
  const joined = readParticipation();
  return pods.map(pod => ({ ...pod,
    joined: !pod.isMine && joined.has(participationKey(pod)),
    participants: pod.participants + (!pod.isMine && joined.has(participationKey(pod)) ? 1 : 0),
  }));
}

function PodIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'time' ? <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>
      : type === 'place' ? <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>
        : <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></>}
  </svg>;
}

export default function PodsPage({ onCreatePod }) {
  const [demoPods] = useState(createDemoPods);
  useLocalActivity();
  const pods = [...readSavedPods(), ...demoPods];
  const [confirmedPod, setConfirmedPod] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(emptyPodFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [matchingFilters, setMatchingFilters] = useState(null);
  const displayedPods = filterPods(withParticipation(pods), filters);
  const availableCount = displayedPods.filter(pod => canJoinPod(pod)).length;
  const filterCount = countPodFilters(filters);
  const hasFilters = filterCount > 0;
  const finishRandom = useCallback(() => {
    // Re-read signups after the animation, including changes from other tabs.
    const selected = pickRandomPod(withParticipation([...readSavedPods(), ...demoPods]), matchingFilters);
    setMatchingFilters(null);
    if (!selected) {
      setError({ id: 'random', message: '조건에 맞는 참여 가능한 팟이 없어요. 필터를 바꿔보세요.' });
      return;
    }
    try {
      saveParticipation(selected);
      setError(null);
      setConfirmedPod({ ...selected, participants: selected.participants + 1, joined: true });
    } catch { setError({ id: 'random', message: '참여 내역을 저장하지 못했어요. 다시 시도해주세요.' }); }
  }, [demoPods, matchingFilters]);

  function joinPod(pod) {
    pod = withParticipation([...readSavedPods(), ...demoPods]).find(item => participationKey(item) === participationKey(pod));
    if (!pod) return;
    if (pod.joined) { setConfirmedPod(pod); return; }
    if (!canJoinPod(pod)) {
      setError({ id: pod.id, message: '지금은 참여할 수 없는 팟이에요.' });
      return;
    }
    try {
      saveParticipation(pod);
      setError(null);
      setConfirmedPod({ ...pod, participants: pod.participants + 1, joined: true });
    } catch { setError({ id: pod.id, message: '참여 내역을 저장하지 못했어요. 다시 시도해주세요.' }); }
  }
  function cancelParticipation(pod) {
    if (!pod.joined || pod.isMine) return;
    try {
      removeParticipation(pod);
      setError(null);
    } catch { setError({ id: pod.id, message: '참여를 취소하지 못했어요. 다시 시도해주세요.' }); }
  }
  return <section className="pods-page" aria-labelledby="pods-heading">
    <header className="pods-header">
      <div><h2 id="pods-heading" tabIndex={-1}>팟</h2><p>참여 가능 <span>{availableCount}</span></p></div>
      <button type="button" className="pods-create" onClick={onCreatePod}><span aria-hidden="true">+</span> 팟 만들기</button>
    </header>
    <div className="pods-discovery">
      <div className="pods-discovery-actions">
        <div className="pods-filter-summary">
          <button type="button" className={`pods-filter-trigger${hasFilters ? ' is-active' : ''}`} aria-label={hasFilters ? `필터 열기, ${filterCount}개 적용됨` : '필터 열기'} aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 7h7m6 0h3M4 17h3m6 0h7"/><circle cx="14" cy="7" r="3"/><circle cx="10" cy="17" r="3"/></svg>
            {hasFilters && <span>{filterCount}</span>}
          </button>
          <span role="status">{hasFilters ? `${displayedPods.length}개 팟` : '전체 팟'}</span>
        </div>
        <button type="button" className="pods-random" disabled={availableCount === 0 || matchingFilters !== null} onClick={() => { setError(null); setMatchingFilters({ ...filters }); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h3c4 0 8 10 12 10h3m-4-4 4 4-4 4M3 17h3c1.5 0 3-1.5 4.5-3.5M14 9c1.5-1.3 2.5-2 4-2h3m-4-4 4 4-4 4"/></svg>
          랜덤 참여하기
        </button>
      </div>
      {availableCount === 0 && displayedPods.length > 0 && <p className="pods-filter-hint">지금 참여 가능한 팟이 없어요.</p>}
      {error?.id === 'random' && <p className="pod-card-error" role="alert">{error.message}</p>}
    </div>
    {displayedPods.length === 0 && <div className="pods-no-results"><p>조건에 맞는 팟이 없어요</p><button type="button" onClick={() => { setFilters(emptyPodFilters); setError(null); }}>필터 초기화</button></div>}
    <ul className="pods-list">
      {displayedPods.map(pod => {
        const full = pod.capacity !== null && pod.participants >= pod.capacity;
        const ended = new Date(`${pod.date}T${pod.time}`).getTime() <= Date.now();
        const eligible = meetsPodConditions(pod);
        const conditions = formatPodConditions(pod);
        return <li key={pod.id} className="pod-card">
        <article aria-labelledby={`pod-name-${pod.id}`}>
          <div className="pod-card-top">
            <span className={`pod-card-status${full || ended ? ' is-full' : ''}`}>{ended ? '종료' : full ? '모집 완료' : '모집 중'}</span>{pod.isMine && <span className="pod-card-mine">내 팟</span>}
            <div className="pod-card-members"><PodIcon type="people"/>
              {pod.capacity === null ? <span><strong>{pod.participants}명</strong> · 인원 제한 없음</span>
                : <span><strong>{pod.participants}</strong> / {pod.capacity}명</span>}
            </div>
          </div>
          <h3 id={`pod-name-${pod.id}`}>{pod.title}</h3>
          {conditions.length > 0 && <ul className="pod-card-conditions" aria-label="참여 조건">{conditions.map(text => <li key={text}>{text}</li>)}</ul>}
          <div className="pod-card-details">
            <div>
              <p className="pod-card-restaurant">{pod.restaurantName}</p>
            </div>
            <div className="pod-card-meeting-row">
              <div className="pod-card-logistics">
                <div className="pod-card-meta"><PodIcon type="time"/><span>{formatPodDate(pod.date)} · {pod.time}</span></div>
                <div className="pod-card-meta"><PodIcon type="place"/><span>{pod.meeting}</span></div>
              </div>
              <div className="pod-card-action">
                <button type="button" className={`pod-join${pod.joined ? ' is-joined' : ''}`} disabled={pod.isMine || ((full || ended || !eligible) && !pod.joined)} onClick={() => joinPod(pod)}>
                  {pod.isMine ? '내가 만든 팟' : pod.joined ? '약속 보기' : ended ? '종료' : full ? '모집 완료' : !eligible ? '조건 불일치' : '참여하기'}
                </button>
                {pod.joined && <button type="button" className="pod-cancel" onClick={() => cancelParticipation(pod)}>취소하기</button>}
              </div>
            </div>
            {error?.id === pod.id && <p className="pod-card-error" role="alert">{error.message}</p>}
          </div>
        </article>
      </li>; })}
    </ul>
    {filtersOpen && <PodFilters filters={filters} pods={pods} onClose={() => setFiltersOpen(false)} onApply={next => { setFilters(next); setError(null); setFiltersOpen(false); }} />}
    {matchingFilters !== null && <RandomPodSearch onComplete={finishRandom} onCancel={() => setMatchingFilters(null)} />}
    {confirmedPod && <PodConfirmation pod={confirmedPod} onClose={() => setConfirmedPod(null)} />}
  </section>;
}
