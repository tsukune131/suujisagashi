import { useEffect, useRef, useState } from 'react';
import { childCopy } from '../copy/childCopy';
import { parentCopy } from '../copy/parentCopy';
import './ParentGateButton.css';

const LONG_PRESS_MS = 900;
const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

interface ParentGateButtonProps {
  onActivate: () => void;
}

function newQuestion(): { a: number; b: number } {
  const pick = () => 3 + Math.floor(Math.random() * 7); // 3〜9
  return { a: pick(), b: pick() };
}

/**
 * 保護者確認(パレンタルゲート)。長押しで開き、文字の読めない幼児には解けない
 * かけ算を正解した時だけ onActivate を呼ぶ(設計書「9. 非機能要件: 安全性」、
 * App Store Review Guidelines 1.3 Kids Category)。
 */
export function ParentGateButton({ onActivate }: ParentGateButtonProps) {
  const timerRef = useRef<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [question, setQuestion] = useState(newQuestion);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  useEffect(() => () => cancel(), []);

  const start = () => {
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setQuestion(newQuestion());
      setInput('');
      setWrong(false);
      setQuizOpen(true);
    }, LONG_PRESS_MS);
  };

  const cancel = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const pressKey = (key: string) => {
    if (key === 'del') {
      setInput((v) => v.slice(0, -1));
    } else if (key !== '') {
      setInput((v) => (v.length < 2 ? v + key : v));
    }
  };

  const submit = () => {
    if (Number(input) === question.a * question.b) {
      setQuizOpen(false);
      onActivate();
      return;
    }
    setWrong(true);
    setQuestion(newQuestion());
    setInput('');
  };

  return (
    <>
      <div className="parent-gate-wrap">
        <span className="parent-gate-hint">{parentCopy.gate.hint}</span>
        <button
          type="button"
          className="parent-gate-button"
          aria-label={childCopy.parentGate.ariaLabel}
          onPointerDown={start}
          onPointerUp={cancel}
          onPointerLeave={cancel}
          onPointerCancel={cancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          ⚙
        </button>
      </div>
      {quizOpen && (
        <div className="parent-gate-overlay" role="dialog" aria-modal="true">
          <div className="parent-gate-dialog">
            <h2>{parentCopy.gate.title}</h2>
            <p className="parent-gate-question">{parentCopy.gate.question(question.a, question.b)}</p>
            <div className="parent-gate-input">{input}</div>
            {wrong && <p className="parent-gate-error">{parentCopy.gate.wrong}</p>}
            <div className="parent-gate-keypad">
              {KEYPAD.map((key, i) =>
                key === '' ? (
                  <span key={i} />
                ) : (
                  <button key={i} type="button" onClick={() => pressKey(key)}>
                    {key === 'del' ? parentCopy.gate.delete : key}
                  </button>
                ),
              )}
            </div>
            <div className="parent-gate-actions">
              <button type="button" onClick={() => setQuizOpen(false)}>
                {parentCopy.gate.cancel}
              </button>
              <button type="button" onClick={submit} disabled={input === ''}>
                {parentCopy.gate.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
