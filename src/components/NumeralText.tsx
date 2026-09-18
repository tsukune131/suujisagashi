interface NumeralTextProps {
  value: number;
  suffix: string;
}

/** 「3を さがそう!」のような文言で、数字部分だけ専用フォント(.numeral)にする。 */
export function NumeralText({ value, suffix }: NumeralTextProps) {
  return (
    <>
      <span className="numeral">{value}</span>
      {suffix}
    </>
  );
}
