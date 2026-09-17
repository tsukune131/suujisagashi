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
    placeholderNote: '写真管理・音量・広告関連は後続Stepで実装する',
    replayTutorial: 'あそびかたを もういちど みる',
    back: 'もどる',
  },
};
