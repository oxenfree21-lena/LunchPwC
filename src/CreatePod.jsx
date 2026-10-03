import React, { useEffect, useRef, useState } from 'react';
import { restaurantDetails } from './data/restaurantDetails';
import { PODS_STORAGE_KEY } from './data/pods';
import { LATEST_COHORT } from './data/profile';
import { formatCohortRange, genderOptions } from './lib/podFilters';

function dateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function nextLunchDate() {
  const date = new Date();
  if (date.getHours() >= 12) date.setDate(date.getDate() + 1);
  return dateValue(date);
}

const steps = ['식당', '일정·조건', '만남장소'];

export default function CreatePod({ initialPlace, places, onClose, onCreated, onComplete }) {
  const firstStep = initialPlace ? 1 : 0;
  const [step, setStep] = useState(firstStep);
  const [place, setPlace] = useState(initialPlace);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(nextLunchDate);
  const [time, setTime] = useState('12:00');
  const [capacity, setCapacity] = useState('4');
  const [unlimited, setUnlimited] = useState(false);
  const [meeting, setMeeting] = useState('');
  const [podTitle, setPodTitle] = useState('');
  const [gender, setGender] = useState('any');
  const [cohortMin, setCohortMin] = useState('');
  const [cohortMax, setCohortMax] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const submitted = useRef(false);
  const title = useRef(null);
  const content = useRef(null);

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    content.current?.scrollTo(0, 0);
  }, [step, created]);

  function goTo(next) { setError(''); setStep(next); }
  function validSchedule() {
    return date && time && new Date(`${date}T${time}`).getTime() > Date.now()
      && (unlimited || (Number.isInteger(Number(capacity)) && Number(capacity) >= 2));
  }
  const cohortValue = value => value.trim() === '' ? null : Number(value);
  function validConditions() {
    const [min, max] = [cohortValue(cohortMin), cohortValue(cohortMax)];
    const valid = value => value === null || (Number.isInteger(value) && value >= 1 && value <= LATEST_COHORT);
    return valid(min) && valid(max) && (min === null || max === null || min <= max);
  }
  function advance(event) {
    event.preventDefault();
    if (step === 0 && !place) return;
    if (step >= 1 && !podTitle.trim()) { setStep(1); setError('제목을 입력해주세요.'); return; }
    if (step >= 1 && !validSchedule()) {
      setError('앞으로의 날짜·시간과 2명 이상의 인원을 선택해주세요.');
      setStep(1);
      return;
    }
    if (step >= 1 && !validConditions()) {
      setError(`사번은 1~${LATEST_COHORT} 사이로, 시작 사번이 끝 사번보다 크지 않게 입력해주세요.`);
      setStep(1);
      return;
    }
    if (step >= 2 && !meeting.trim()) { setStep(2); setError('만남장소를 입력해주세요.'); return; }
    if (step < 3) { goTo(step + 1); return; }
    if (submitted.current) return;
    try {
      const previous = JSON.parse(localStorage.getItem(PODS_STORAGE_KEY) || '[]');
      const pod = { id: crypto.randomUUID(), title: podTitle.trim(), restaurantId: place.id, restaurantName: place.name,
        date, time, capacity: unlimited ? null : Number(capacity), gender, cohortMin: cohortValue(cohortMin), cohortMax: cohortValue(cohortMax), meeting: meeting.trim(), createdAt: new Date().toISOString() };
      localStorage.setItem(PODS_STORAGE_KEY, JSON.stringify([pod, ...(Array.isArray(previous) ? previous : [])]));
      submitted.current = true;
      setCreated(true);
      onCreated();
    } catch { setError('저장하지 못했어요. 다시 시도해주세요.'); }
  }

  const cohortText = formatCohortRange(cohortValue(cohortMin), cohortValue(cohortMax)) || '제한 없음';
  const formattedDate = new Date(`${date}T12:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  const heading = created ? '팟을 만들었어요' : ['어디서 먹을까요?', '언제 만날까요?', '어디서 만날까요?', '최종 확인'][step];
  return <section className="pod-page" aria-labelledby="pod-title">
    <div className="pod-layout">
      <header className="pod-toolbar">
        <button type="button" className="detail-back" aria-label={created || step === firstStep ? '팟 만들기 나가기' : '이전 단계'} onClick={() => created ? onComplete() : step === firstStep ? onClose() : goTo(step - 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span>팟 만들기</span>
        {!created && <button type="button" className="pod-close" onClick={onClose}>취소</button>}
      </header>
      <form className="pod-form" onSubmit={advance}>
        <div className="pod-content" ref={content}>
          {!created && <ol className="pod-steps" aria-label="팟 만들기 단계">
            {steps.map((label, index) => <li key={label} className={step >= index ? 'is-active' : ''} aria-current={step === index ? 'step' : undefined}>
              <span>{step > index ? '✓' : index + 1}</span>{label}
            </li>)}
          </ol>}
          {created && <div className="pod-success-icon" aria-hidden="true">✓</div>}
          <h2 id="pod-title" ref={title} tabIndex={-1}>{heading}</h2>
          {place && step > 0 && step < 3 && !created && <p className="pod-selected-place">{place.name}</p>}
          {!created && step === 0 && <>
            <label className="visually-hidden" htmlFor="pod-search">식당 검색</label>
            <input id="pod-search" className="pod-search" type="search" placeholder="식당 이름 검색" value={query} onChange={event => setQuery(event.target.value)} />
            <fieldset className="pod-restaurants"><legend className="visually-hidden">식당 선택</legend>
              {places.filter(item => item.name.includes(query.trim())).map(item => <label key={item.id} className={`pod-restaurant-option${place?.id === item.id ? ' is-selected' : ''}`}>
                <input type="radio" name="pod-restaurant" value={item.id} checked={place?.id === item.id} onChange={() => setPlace(item)} required />
                <span><strong>{item.name}</strong><small>{restaurantDetails[item.id]?.category ?? '종류 확인 중'}</small></span>
                <span className="pod-option-rating">★ {item.rating.toFixed(1)}</span>
              </label>)}
              {!places.some(item => item.name.includes(query.trim())) && <p className="pod-empty">검색 결과가 없어요.</p>}
            </fieldset>
          </>}
          {!created && step === 1 && <div className="pod-fields">
            <label htmlFor="pod-post-title">제목<input id="pod-post-title" type="text" value={podTitle} placeholder="예: 오늘 점심 같이 드실 분!" maxLength={80} required onChange={event => setPodTitle(event.target.value)} /></label>
            <label htmlFor="pod-date">날짜<input id="pod-date" type="date" value={date} min={dateValue(new Date())} required onChange={event => setDate(event.target.value)} /></label>
            <label htmlFor="pod-time">시간<input id="pod-time" type="time" value={time} required onChange={event => setTime(event.target.value)} /></label>
            <label htmlFor="pod-capacity">최대 인원수 <small>본인 포함</small><div className="pod-capacity"><input id="pod-capacity" type="number" inputMode="numeric" min="2" step="1" value={unlimited ? '' : capacity} placeholder={unlimited ? '제한 없음' : undefined} disabled={unlimited} required={!unlimited} onChange={event => setCapacity(event.target.value)} />{!unlimited && <span>명</span>}</div></label>
            <label className="pod-unlimited"><input type="checkbox" checked={unlimited} onChange={event => setUnlimited(event.target.checked)} />인원 제한 없음</label>
            <fieldset className="pod-conditions">
              <legend>참여 조건</legend>
              <fieldset className="pod-condition-group"><legend>성별</legend>
                <div className="pod-segmented">
                  {genderOptions.map(([key, label]) => <label key={key}><input type="radio" name="pod-gender" value={key} checked={gender === key} onChange={() => setGender(key)} /><span>{label}</span></label>)}
                </div>
              </fieldset>
              <fieldset className="pod-condition-group"><legend>사번 범위 <small>비워두면 제한 없음 · 신입 {LATEST_COHORT}사번</small></legend>
                <div className="pod-cohort-range">
                  <label className="pod-capacity"><span className="visually-hidden">시작 사번</span><input type="number" inputMode="numeric" min="1" max={LATEST_COHORT} step="1" placeholder="예: 30" value={cohortMin} onChange={event => setCohortMin(event.target.value)} /><span aria-hidden="true">사번</span></label>
                  <span aria-hidden="true">~</span>
                  <label className="pod-capacity"><span className="visually-hidden">끝 사번</span><input type="number" inputMode="numeric" min="1" max={LATEST_COHORT} step="1" placeholder="예: 34" value={cohortMax} onChange={event => setCohortMax(event.target.value)} /><span aria-hidden="true">사번</span></label>
                </div>
              </fieldset>
            </fieldset>
          </div>}
          {!created && step === 2 && <div className="pod-fields">
            <label htmlFor="pod-meeting">만남장소<textarea id="pod-meeting" value={meeting} onChange={event => setMeeting(event.target.value)} placeholder="예: 회사 1층 로비, 식당 입구 앞" maxLength={200} rows={4} required /></label>
            <span className="pod-count">{meeting.length} / 200</span>
          </div>}
          {(step === 3 || created) && <div className="pod-confirmation">
            <div className="pod-confirm-place"><small>{restaurantDetails[place.id]?.category ?? '식당'}</small><h3>{place.name}</h3>{!created && !initialPlace && <button type="button" onClick={() => goTo(0)}>변경</button>}</div>
            <dl>
              <div><dt>제목</dt><dd>{podTitle}</dd></div>
              <div><dt>날짜</dt><dd>{formattedDate}</dd></div>
              <div><dt>시간</dt><dd>{time}</dd></div>
              <div><dt>인원</dt><dd>{unlimited ? '제한 없음' : <>최대 {capacity}명 <small>본인 포함</small></>}</dd></div>
              <div><dt>성별</dt><dd>{genderOptions.find(([key]) => key === gender)[1]}</dd></div>
              <div><dt>사번</dt><dd>{cohortText}</dd></div>
              <div><dt>만남장소</dt><dd>{meeting}</dd></div>
            </dl>
          </div>}
          {error && <p className="pod-error" role="alert">{error}</p>}
        </div>
        <footer className="pod-footer">
          {(step === 3 || created) && <p>데모 팟은 이 브라우저에만 저장돼요.</p>}
          {created ? <button type="button" className="pod-primary" onClick={onComplete}>팟 목록 보기</button>
            : <button type="submit" className="pod-primary" disabled={(step === 0 && !place) || (step === 2 && !meeting.trim())}>{step === 3 ? '팟 만들기' : step === 2 ? '확인하기' : '다음'}</button>}
        </footer>
      </form>
    </div>
  </section>;
}
