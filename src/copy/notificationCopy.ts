/**
 * ローカル通知の文言。設計書「11. リテンション施策」の例文をそのまま使う
 * (親向けだがかな中心で可、との方針)。
 */
export const notificationCopy = {
  registerEncourage: {
    title: 'すうじさがし',
    body: 'あなたのしゃしんで すうじさがしを してみませんか?',
  },
  newRegisterEncourage: {
    title: 'すうじさがし',
    body: '新しい しゃしんを とうろくして、スタンプを ふやしてみよう!',
  },
  nearComplete: {
    title: 'すうじさがし',
    body: (remaining: number) => `あと ${remaining}こ で コンプリート!`,
  },
};
