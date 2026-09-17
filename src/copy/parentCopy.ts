/**
 * 親向けの設定・登録画面の文言。設計書「4-3. 文言(コピー)ガイドライン」の通り、
 * こちらは通常の漢字仮名交じり文でよい(かな限定チェックの対象外)。
 */
export const parentCopy = {
  gate: {
    title: '保護者の方へ',
    question: (a: number, b: number) => `${a} × ${b} の答えを入力してください`,
    wrong: '答えが違います。新しい問題でもう一度お試しください。',
    delete: '消す',
    cancel: 'やめる',
    submit: '決定',
  },
  register: {
    title: 'しゃしんの とうろく',
    pickFromLibrary: 'あるものから えらぶ',
    takePhoto: 'しゃしんを とる',
    back: 'もどる',
    taggingTitle: 'どの すうじに する?',
    taggingCount: (count: number) => `${count}まい の しゃしんを とうろくします`,
    saving: 'とうろく しています…',
    done: 'とうろく できたよ!',
    failed: (savedCount: number) =>
      `保存できなかった写真があります(${savedCount}枚は登録済み)。端末の空き容量を確認して、もう一度お試しください。`,
    continueRegistering: 'つづけて とうろくする',
    backToHome: 'ホームに もどる',
    remaining: (n: number) => `無料版であと ${n}枚 登録できます。`,
    limitReached: (limit: number) =>
      `無料版の上限(${limit}枚)まで登録しました。もっと登録するには、下のボタンから買い切りプランを購入してください。`,
    taggingSkipped: (n: number) =>
      `無料版の上限のため、${n}枚は登録されませんでした。もっと登録するには買い切りプランが必要です。`,
  },
  settings: {
    title: 'せってい',
    replayTutorial: 'あそびかたを もういちど みる',
    back: 'もどる',
  },
  notifications: {
    heading: 'おしらせ',
    description: '写真登録やコンプリートまであと少しの時に、午前中に控えめにお知らせします。',
    toggleOn: 'おしらせ ON',
    toggleOff: 'おしらせ OFF',
    deniedByOs:
      'iPhoneの設定で通知が許可されていないため、お知らせは届きません。「設定」アプリ→「すうじさがし」→「通知」から許可してください。',
  },
  pro: {
    heading: '写真をもっと登録する',
    description: (limit: number) =>
      `無料版は写真を${limit}枚まで登録できます。買い切りで、登録できる枚数が無制限になります。`,
    purchaseButton: (priceString: string) => `${priceString} で購入`,
    purchasing: '購入処理中…',
    priceLoading: '価格を読み込み中…',
    priceUnavailable: '価格を取得できませんでした。電波の良い場所でもう一度お試しください。',
    alreadyPurchased: '購入済みです。写真は無制限に登録できます。',
    restoreButton: '購入を復元',
    restoring: '復元処理中…',
    restoreFailed: '復元できませんでした。通信状況を確認して、もう一度お試しください。',
    restoreNotFound: 'このApple IDでの購入履歴が見つかりませんでした。',
  },
};
