const PALETTE_SIZE = 8;

/** 0〜10それぞれに固有の色を割り当てる(index.cssの--candy-0〜7を巡回)。 */
export function numberColorClass(prefix: string, numberId: number): string {
  return `${prefix}--c${numberId % PALETTE_SIZE}`;
}
