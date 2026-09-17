export const childCopy = {
  home: {
    title: 'すうじさがし',
    gallery: 'ギャラリー',
    roundLabel: (round: number) => `いまは ${round}まいめ`,
    lapLabel: (round: number) => `【${round}しゅうめ】`,
  },
  trace: {
    promptFor: (numberId: number) => `${numberId}を さがそう!`,
    tutorialPrompt: 'ゆびで なぞってみよう!',
    emptyPhoto: 'まだ この すうじの しゃしんが ないよ。おうちのひとに とうろくしてもらおう!',
    backHome: 'ホームに もどる',
    undo: 'やりなおす',
    clearAll: 'ぜんぶ けす',
    colorSwatchLabel: 'いろを えらぶ',
  },
  result: {
    found: (numberId: number) => `${numberId}を みつけられたね!`,
    savedToGallery: 'ギャラリーに ほぞんしたよ',
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
