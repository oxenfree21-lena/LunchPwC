import React, { useEffect, useRef, useState } from 'react';
import { restaurantDetails } from './data/restaurantDetails';
import { PODS_STORAGE_KEY } from './data/pods';
import { myProfile } from './data/profile';
import { CUSTOM_MEETING, MEETING_MAX, meetingPlaces, podCapacityOptions, podDayLabels, podTimeGroups, POD_NOTE_MAX, POD_RULE } from './data/podOptions';

function dateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function podDates() {
  return podDayLabels.map((label, offset) => {
    const day = new Date();
    day.setDate(day.getDate() + offset);
    return [dateValue(day), label, `${day.getMonth() + 1}.${day.getDate()} (${'일월화수목금토'[day.getDay()]})`];
  });
}

function nextLunchDate() {
  const date = new Date();
  if (date.getHours() >= 12) date.setDate(date.getDate() + 1);
  return dateValue(date);
}

const steps = ['식당', '일정', '만남장소'];

export default function CreatePod({ initialPlace, places, onClose, onCreated, onComplete, onDirtyChange }) {
  const firstStep = initialPlace ? 1 : 0;
  const [step, setStep] = useState(firstStep);
  const [place, setPlace] = useState(initialPlace);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(nextLunchDate);
  const [time, setTime] = useState('12:00');
  const [capacity, setCapacity] = useState(4);
  const [meetingChoice, setMeetingChoice] = useState('');
  const [customMeeting, setCustomMeeting] = useState('');
  const meeting = meetingChoice === CUSTOM_MEETING ? customMeeting.trim() : meetingChoice;
  const [note, setNote] = useState('');
  const [podTitle, setPodTitle] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const submitted = useRef(false);
  const title = useRef(null);
  const content = useRef(null);

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    content.current?.scrollTo(0, 0);
  }, [step, created]);

  // Lets the app confirm before a tab change throws away what was entered.
  const dirty = !created && Boolean(podTitle.trim() || meetingChoice || note.trim() || place?.id !== initialPlace?.id);
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);

  function goTo(next) { setError(''); setStep(next); }
  function validSchedule() {
    return podDates().some(([value]) => value === date) && podTimeGroups.some(([, options]) => options.includes(time))
      && new Date(`${date}T${time}`).getTime() > Date.now() && podCapacityOptions.includes(capacity);
  }
  function advance(event) {
    event.preventDefault();
    if (step === 0 && !place) return;
    if (step >= 1 && !podTitle.trim()) { setStep(1); setError('제목을 입력해주세요.'); return; }
    if (step >= 1 && !validSchedule()) {
      setError('지나지 않은 날짜와 시간을 골라주세요.');
      setStep(1);
      return;
    }
    if (step >= 2 && !meeting) { setStep(2); setError(meetingChoice === CUSTOM_MEETING ? '만남장소를 입력해주세요.' : '만남장소를 골라주세요.'); return; }
    if (step < 3) { goTo(step + 1); return; }
    if (submitted.current) return;
    try {
      const previous = JSON.parse(localStorage.getItem(PODS_STORAGE_KEY) || '[]');
      const pod = { id: crypto.randomUUID(), title: podTitle.trim(), host: myProfile.nickname, restaurantId: place.id, restaurantName: place.name,
        date, time, capacity, meeting, note: note.trim(), createdAt: new Date().toISOString() };
      localStorage.setItem(PODS_STORAGE_KEY, JSON.stringify([pod, ...(Array.isArray(previous) ? previous : [])]));
      submitted.current = true;
      setCreated(true);
      onCreated();
    } catch { setError('저장하지 못했어요. 다시 시도해주세요.'); }
  }

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
          {(step === 3 || created) && <p className="pod-rule">{POD_RULE}</p>}
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
            <fieldset className="pod-choice-group"><legend>날짜</legend>
              <div className="pod-choices pod-date-choices">
                {podDates().map(([value, label, detail]) => <label key={value}><input type="radio" name="pod-date" value={value} checked={date === value} onChange={() => setDate(value)} /><span>{label}<small>{detail}</small></span></label>)}
              </div>
            </fieldset>
            <fieldset className="pod-choice-group"><legend>시간</legend>
              {podTimeGroups.map(([label, options]) => <div key={label} className="pod-time-group">
                <span className="pod-time-label">{label}</span>
                <div className="pod-choices pod-time-choices">
                  {options.map(option => <label key={option}><input type="radio" name="pod-time" value={option} checked={time === option} onChange={() => setTime(option)} /><span>{option}</span></label>)}
                </div>
              </div>)}
            </fieldset>
            <fieldset className="pod-choice-group"><legend>최대 인원 <small>본인 포함 · {POD_RULE}</small></legend>
              <div className="pod-choices pod-capacity-choices">
                {podCapacityOptions.map(option => <label key={option ?? 'unlimited'}><input type="radio" name="pod-capacity" value={option ?? 'unlimited'} checked={capacity === option} onChange={() => setCapacity(option)} /><span>{option === null ? '제한 없음' : `${option}명`}</span></label>)}
              </div>
            </fieldset>
          </div>}
          {!created && step === 2 && <div className="pod-fields">
            <fieldset className="pod-choice-group"><legend>만남장소</legend>
              <div className="pod-choices pod-meeting-choices">
                {[...meetingPlaces, CUSTOM_MEETING].map(option => <label key={option}><input type="radio" name="pod-meeting" value={option} checked={meetingChoice === option} onChange={() => setMeetingChoice(option)} /><span>{option}</span></label>)}
              </div>
            </fieldset>
            {meetingChoice === CUSTOM_MEETING && <label htmlFor="pod-meeting-custom">만남장소 입력<input id="pod-meeting-custom" type="text" value={customMeeting} placeholder="예: 신용산역 1번출구 앞" maxLength={MEETING_MAX} autoFocus onChange={event => setCustomMeeting(event.target.value)} /></label>}
            <label htmlFor="pod-note">한 줄 메모 <small>선택</small><input id="pod-note" type="text" value={note} placeholder="예: 처음 보는 분도 환영해요" maxLength={POD_NOTE_MAX} onChange={event => setNote(event.target.value)} /></label>
            <span className="pod-count">{note.length} / {POD_NOTE_MAX}</span>
          </div>}
          {(step === 3 || created) && <div className="pod-confirmation">
            <div className="pod-confirm-place"><small>{restaurantDetails[place.id]?.category ?? '식당'}</small><h3>{place.name}</h3>{!created && !initialPlace && <button type="button" onClick={() => goTo(0)}>변경</button>}</div>
            <dl>
              <div><dt>제목</dt><dd>{podTitle}</dd></div>
              <div><dt>날짜</dt><dd>{formattedDate}</dd></div>
              <div><dt>시간</dt><dd>{time}</dd></div>
              <div><dt>인원</dt><dd>{capacity === null ? '제한 없음' : <>최대 {capacity}명 <small>본인 포함</small></>}</dd></div>
              <div><dt>만남장소</dt><dd>{meeting}</dd></div>
              {note.trim() && <div><dt>메모</dt><dd>{note.trim()}</dd></div>}
            </dl>
          </div>}
          {error && <p className="pod-error" role="alert">{error}</p>}
        </div>
        <footer className="pod-footer">
          {(step === 3 || created) && <p>데모 팟은 이 브라우저에만 저장돼요.</p>}
          {created ? <button type="button" className="pod-primary" onClick={onComplete}>팟 목록 보기</button>
            : <button type="submit" className="pod-primary" disabled={(step === 0 && !place) || (step === 2 && !meeting)}>{step === 3 ? '팟 만들기' : step === 2 ? '확인하기' : '다음'}</button>}
        </footer>
      </form>
    </div>
  </section>;
}
