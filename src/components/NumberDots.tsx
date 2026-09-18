import './NumberDots.css';

interface NumberDotsProps {
  count: number;
  className?: string;
}

/**
 * 数字の横に量(ドット)を添えて、記号(数字)と実際の数量を毎回セットで
 * 目にできるようにする(数字と量の対応=基数性の土台づくり)。
 * 0は「なにもない」ことを示す小さな輪だけを表示する。
 */
export function NumberDots({ count, className }: NumberDotsProps) {
  if (count <= 0) {
    return (
      <span className={`number-dots number-dots--empty ${className ?? ''}`} aria-hidden="true" />
    );
  }
  return (
    <span className={`number-dots ${className ?? ''}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="number-dots__dot" />
      ))}
    </span>
  );
}
