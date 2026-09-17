/**
 * 親向けの設定・登録画面の文言。設計書「4-3. 文言(コピー)ガイドライン」の通り、
 * こちらは通常の漢字仮名交じり文でよい(かな限定チェックの対象外)。
 */
export const parentCopy = {
  register: {
    title: 'しゃしんの とうろく',
    pickFromLibrary: 'あるものから えらぶ',
    takePhoto: 'しゃしんを とる',
    back: 'もどる',
    taggingTitle: 'どの すうじに する?',
    taggingCount: (count: number) => `${count}まい の しゃしんを とうろくします`,
    saving: 'とうろく しています…',
    done: 'とうろく できたよ!',
    continueRegistering: 'つづけて とうろくする',
    backToHome: 'ホームに もどる',
  },
  settings: {
    title: 'せってい',
    placeholderNote: '写真管理・音量は後続Stepで実装する',
    replayTutorial: 'あそびかたを もういちど みる',
    back: 'もどる',
  },
  notifications: {
    heading: 'おしらせ',
    description: '写真登録やコンプリートまであと少しの時に、控えめにお知らせします。',
    toggleOn: 'おしらせ ON',
    toggleOff: 'おしらせ OFF',
  },
  pro: {
    heading: '広告を消す',
    description: '買い切りで、これ以降ずっと広告が表示されなくなります。',
    purchaseButton: (priceString: string) => `${priceString} で購入`,
    purchasing: '購入処理中…',
    priceUnavailable: '価格を取得できませんでした。電波の良い場所でもう一度お試しください。',
    alreadyPurchased: '購入済みです。広告は表示されません。',
    restoreButton: '購入を復元',
    restoring: '復元処理中…',
  },
};
