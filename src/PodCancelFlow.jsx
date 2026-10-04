import React, { useCallback, useRef, useState } from 'react';
import PodWaitDialog from './PodWaitDialog';
import MessageDialog from './PodMessageDialog';

// Confirm → short wait → result, for canceling my own pod or a signup.
export default function PodCancelFlow({ pod, onConfirm, onClose }) {
  const [phase, setPhase] = useState('confirm');
  const confirm = useRef(onConfirm);
  confirm.current = onConfirm;
  const finish = useCallback(() => {
    try { confirm.current(); setPhase('done'); }
    catch { setPhase('failed'); }
  }, []);
  const text = pod.isMine
    ? { ask: '정말 약속을 취소할까요?', action: '약속 취소하기', done: '약속이 취소됐어요' }
    : { ask: '정말 참여를 취소할까요?', action: '참여 취소하기', done: '참여가 취소됐어요' };

  if (phase === 'waiting') return <PodWaitDialog title="취소하는 중이에요" cancelLabel="그만두기" duration={2000} onComplete={finish} onCancel={onClose} />;
  if (phase === 'done') return <MessageDialog title={text.done} message={pod.title}
    actions={[{ label: '확인', primary: true, onClick: onClose }]} onDismiss={onClose} />;
  if (phase === 'failed') return <MessageDialog title="취소하지 못했어요" message="잠시 후 다시 시도해주세요."
    actions={[{ label: '확인', primary: true, onClick: onClose }]} onDismiss={onClose} />;
  return <MessageDialog title={text.ask}
    message={pod.isMine ? '취소하면 팟 목록에서도 사라져요.' : pod.title}
    actions={[{ label: '돌아가기', onClick: onClose }, { label: text.action, primary: true, onClick: () => setPhase('waiting') }]}
    onDismiss={onClose} />;
}
