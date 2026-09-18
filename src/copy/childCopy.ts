export const childCopy = {
  home: {
    title: 'すうじさがし',
    gallery: 'ギャラリー',
    roundLabel: (round: number) => `いまは ${round}まいめ`,
    lapLabel: (round: number) => `【${round}しゅうめ】`,
  },
  photoSelect: {
    title: (numberId: number) => `${numberId}の しゃしんは どれに する?`,
    emptyPhoto: 'まだ この すうじの しゃしんが ないよ。おうちのひとに とうろくしてもらおう!',
    backHome: 'ホームに もどる',
    modeTimed: '60びょう',
    modeUnlimited: 'せいげんなし',
  },
  trace: {
    promptSuffix: 'を さがそう!',
    tutorialPrompt: 'ゆびで なぞってみよう!',
    undo: 'やりなおす',
    clearAll: 'ぜんぶ けす',
    colorSwatchLabel: 'いろを えらぶ',
    penTool: 'かく',
    stampTool: 'スタンプ',
    completeButton: 'かんせい!',
  },
  result: {
    foundSuffix: 'を みつけられたね!',
    savedToGallery: 'ギャラリーに ほぞんしたよ',
    exploreMore: (numberId: number) =>
      `おうちの なかにも ${numberId}みたいな かたちが あるか さがしてみてね`,
    completeTitle: '🎉 ぜんぶの すうじが みつかったね! 🎉',
    completeSub: 'すごいすごい!',
    tutorialNext: 'じゃあ じぶんの しゃしんで やってみよう!',
  },
  gallery: {
    title: 'ギャラリー',
    all: 'すべて',
    sortNew: 'あたらしい じゅん',
    sortOld: 'ふるい じゅん',
    empty: 'まだ さくひんが ないよ。すうじを さがしに いこう!',
    backHome: 'ホームに もどる',
  },
  parentGate: {
    ariaLabel: 'せっていを ひらく',
  },
};
