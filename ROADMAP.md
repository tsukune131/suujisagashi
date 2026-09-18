# すうじさがし 公開ロードマップ

ゴール: App Storeでの一般公開。
方針: **無料でできる改善をすべて先に行い、納得してから課金ステップ
(Apple Developer 年99ドル)に進む。**
各フェーズの最後に「チェックポイント」があり、そこで次に進むか判断する。

収益の位置づけ: 維持費の年99ドルを買い切りIAPの売上で回収できたら成功。

## プロダクト方針

- ポジショニング: 「自分の写真の中から0〜10の数字を見つけて指でなぞる、1〜3歳向け知育アプリ」
- ターゲット: 1〜3歳の幼児(親子共同利用が前提)
- 収益モデル: **広告なし**。無料版は登録できる写真を合計3枚までに制限し、
  買い切りIAP「すうじさがし Pro」(製品ID: `com.tsukune.suujisagashi.pro`)で
  無制限に解放する(2026-09-17決定。詳細は「現在地」の同日エントリ参照)
- **完全ローカル**: アカウント・外部通信なし。「データ収集: なし」を維持する
- **やらないこと**(要望が出ても足さない。不採用の決定は理由ごと追記):
  - 広告(AdMob等のサードパーティ広告SDK)。競合の知育アプリ(Khan Academy Kids・
    Toca Boca等)でも広告なしが一般的で、Apple Kidsカテゴリでの広告SDKは
    リジェクト事例が多く審査リスクが高いため不採用(2026-09-17決定)
  - クラウド同期(開発者がデータを見られる構造になる)
  - データのJSON書き出し(機種変はiCloudバックアップに委ねる)
  - 形一致判定(自由に描けること自体が体験。厳密な正誤判定はしない)

## フェーズA: アプリ品質の底上げ(費用: 0円)

Web/PWAのまま、毎日使って気持ちいいレベルまで磨く。
詳細な作業内容は実装手順書(下記リンク)のStep2〜7に対応する。

- [ ] A-1 コア機能の作り込み(実装手順書 Step2〜5.5: 画面骨組み・写真登録・
      なぞり描画・保存/ギャラリー・達成スタンプ)
- [ ] A-2 継続を促す仕掛け(達成スタンプ・コンプリート演出・リテンション通知。
      実装手順書 Step5.5, Step8.6)
- [ ] A-3 オンボーディング(初回チュートリアル「くるまのしゃしん」。実装手順書 Step6)
- [ ] A-4 パフォーマンス(なぞり描画60fps・画面遷移300ms以内。設計書「9. 非機能要件」)
- [ ] A-5 デザインの確立(ポップな色使い・大きなタップ領域・文言のかな表記。
      実装手順書 Step7)

**チェックポイントA**: 自分・家族で1〜2週間使い、毎日の利用が苦にならないか確認。

## フェーズB: 公開に必要な土台(費用: 0円)

- [x] B-1 Capacitorプロジェクト化(com.tsukune.suujisagashi、共有スキーム、
      ITSAppUsesNonExemptEncryption=false)— 2026-09-17完了(実装手順書 Step1)
- [x] B-1.5 買い切りIAP(写真登録上限解放)の実装 — 2026-09-17完了
      (実装手順書 Step8.5相当。当初のStep8 AdMob広告は撤去、詳細は「現在地」参照)
- [ ] B-2 法務文書(プライバシーポリシー・利用規約)を公開し、
      設定とオンボーディングからリンク
- [ ] B-3 GitHub Pages に紹介ページ+法務ページ(App Store Connectが
      到達可能なプライバシーポリシーURLを要求する)

**チェックポイントB**: ここが課金判断ポイント —
納得したら Apple Developer 登録(年99ドル)へ。

## フェーズC: TestFlight配布(費用: 年99ドル)

- [ ] C-1 Apple Developer Program 登録(ユーザー作業)
- [ ] C-2 TestFlight自動配布パイプライン(/ios-release-pipeline。
      手順: docs/ios-release-setup.md)
- [ ] C-3 ネイティブ機能(/ios-native-features: HealthKit・通知・触覚・スプラッシュ)
- [ ] C-4 実機確認(通知の発火・権限ダイアログ・前面復帰の挙動)
- [ ] C-5 TestFlightで家族・テスターに配布、フィードバック反映

**チェックポイントC**: 市販アプリと比べて遜色ないか。継続利用で判断。

## フェーズD: App Store公開(追加費用: 0円)

- [ ] D-0 課金(/iap-onetime)— 有料App契約は反映に数日かかるので早めに着手
- [ ] D-1 ストア素材(/appstore-listing → store/appstore-listing.md)
- [ ] D-2 プライバシーラベル申告(根拠を素材ファイルに記録)
- [ ] D-3 提出前チェック(release-auditor エージェント)→ 審査提出
      (リジェクト往復1〜2回を想定)
- [ ] D-4 公開後の運用(クラッシュはApp Store Connectのレポートで監視、
      iOSアップデート追従)

## 費用まとめ

| フェーズ | 費用 |
|---|---|
| A・B | 0円 |
| C以降 | Apple Developer 年99ドル のみ |

## 関連ドキュメント

- 設計書: https://claude.ai/code/artifact/16c6dceb-857d-455f-a377-a1d3f6fdf17e
- 実装手順書: https://claude.ai/code/artifact/29acd08e-e55a-47ad-b0b7-e91510c01166
  (Step1〜10の詳細な作業内容・チェック項目・完了基準はこちらを参照)

## 現在地

> 注意: 以下の「完了」は**コードの実装が済んだ**という意味。実装手順書の各Stepの
> 完了基準(実機・シミュレータでの動作確認)は、Step1〜8.6のどれもまだ満たしていない。
> 実機確認はTestFlight配布(フェーズC)以降に行う。

- 2026-09-17: 実装手順書 Step1(環境構築とプロジェクト作成)完了。
  `new-ios-app`相当の手順を手動実行し、React+Vite+Capacitorの雛形を作成、
  `npx cap add ios`でiOSプロジェクトを生成。共有スキーム(App.xcscheme)を追加、
  Info.plistに`ITSAppUsesNonExemptEncryption=false`、
  `TARGETED_DEVICE_FAMILY=1`(iPhone専用)を設定済み。
- 2026-09-17: 実装手順書 Step2(画面・ルーティングの雛形実装)完了。
  ルーティングはReact Router不使用、`AppStateContext`(状態値の切り替え)で
  一方向遷移を実装。HomeScreen(0〜10の数字ボタン、88px以上のタップ領域)、
  TraceScreen、ResultScreen(3秒後に自動でホームへ戻る)、GalleryScreen、
  RegisterScreen、SettingsScreenの6画面を骨組みで作成。
  親モードへの入口は`ParentGateButton`(長押し900ms)で共通化し、
  Home→Register(長押し)、Register→Settings(長押し)に配線。
  `npm run build`成功、`npx cap sync ios`で反映済み。
- 2026-09-17: 実装手順書 Step3(機能1: 写真ライブラリ登録)完了。
  `@capacitor/camera`(`pickImages()`=PHPicker複数選択、`getPhoto()`=その場撮影)、
  `@capacitor/filesystem`(画像本体を長辺1200px/サムネイル320pxにリサイズして
  Directory.Dataへ保存)、`@capacitor/preferences`(Photoメタデータの
  JSON配列を保持)を実装。RegisterScreenに選択→数字タグ付け→保存のフローを追加、
  HomeScreenの数字ボタンに登録済みバッジ(★)を反映。
  Info.plistに`NSCameraUsageDescription`/`NSPhotoLibraryUsageDescription`を追加。
  `npm run build`成功、`npx cap sync ios`で3プラグインの組み込みを確認。
  ブラウザ拡張が未接続のため実機/ブラウザでの目視確認は未実施(HTTPレスポンスのみ確認)。
- 2026-09-17: 実装手順書 Step4(機能2: なぞり描画)完了。
  TraceScreenに写真レイヤー(`<img>`)+描画レイヤー(`<canvas>`)を実装。
  Pointer Eventsでストロークを取得し、マルチタッチは1本目以外を無視。
  カラーパレット(7色)・前回使用色の記憶(Preferences)・「ぜんぶ けす」・
  ストローク単位のアンドゥを実装。形一致判定は行わず、なぞった線の
  合計長さがキャンバス対角線の1.2倍を超えたら自動でResultScreenへ遷移。
  対象の数字に写真が未登録の場合の案内表示も追加。
  `npm run build`成功、`npx cap sync ios`で反映済み。ブラウザ拡張が
  未接続のため目視確認は未実施。
- 2026-09-17: 実装手順書 Step5(機能3: 保存・ギャラリー)完了。
  完成判定発火時に、画面表示中の写真+ストロークを1枚のCanvasに合成して
  PNG化(`compositeArtworkToPngBase64`)し、`artworkRepository`でFilesystemに
  保存、メタデータ(Artwork: id/photoId/numberId/exportedImagePath/createdAt)を
  Preferencesに保持。ストローク配列も別途保持(TraceDrawing相当、将来の再編集用)。
  ResultScreenに保存確認のプレビュー画像を表示。GalleryScreenを実装し、
  数字別フィルタ+新しい順/古い順の並べ替えでArtwork一覧をグリッド表示。
  `npm run build`成功、`npx cap sync ios`で反映済み。ブラウザ拡張が
  未接続のため目視確認は未実施。
- 2026-09-17: 実装手順書 Step5.5(機能4: 達成スタンプ表示)完了。
  `progressRepository`でnumberId別スタンプ(lastStampedRound相当)・
  currentCardRound(1〜3)・lapCount(4週目以降)をPreferencesに保持。
  Artwork保存後に`recordStampIfNeeded`を呼び、同じカード回数内の重複加算を防止。
  0〜10すべて揃った瞬間だけcompletedRound=trueを返し、3未満ならcurrentCardRound
  を+1、3の場合はlapCountを+1(カード画像は3枚目を使い回す想定)。
  HomeScreenに達成バッジ(★)と「いまは{N}まいめ」/「【Nしゅうめ】」表示を追加、
  ResultScreenにコンプリート時の大きめの祝福演出(表示時間も延長)を追加。
  `npm run build`成功、`npx cap sync ios`で反映済み。ブラウザ拡張が
  未接続のため目視確認は未実施。
- 2026-09-17: 実装手順書 Step6(初回チュートリアル)完了。
  `hasSeenTutorial`(Preferences)が未設定の初回起動時のみ、AppStateProviderの
  起動チェックで自動的にTraceScreenをチュートリアルモード(対象数字0、
  同梱アセット使用)で開始。同梱写真は本物の実写真がまだ無いため、
  暫定的にSVGイラスト(`src/assets/tutorial-car.svg`、左車輪をなぞり対象)を
  作成(実写真素材は別途用意が必要、ROADMAP参照)。タイヤ位置に点滅する
  破線ガイドを表示し、完成後は「じゃあ じぶんの しゃしんで やってみよう!」の
  メッセージを経てRegisterScreenへ自然に誘導。2回目以降は自動表示しない。
  SettingsScreenに「あそびかたを もういちど みる」を追加し、いつでも再生可能に。
  `npm run build`成功、`npx cap sync ios`で反映済み。ブラウザ拡張が
  未接続のため目視確認は未実施。
- 2026-09-17: 実装手順書 Step7(ネイティブ連携と文言ガイドラインの反映)完了。
  **音声・効果音はユーザー判断で対象外**とした(声優収録・効果音素材の用意が
  現時点でできないため)。触覚フィードバック(`@capacitor/haptics`)のみ実装し、
  「1タップで記録が増える操作にだけ軽い振動を返す。多用しない」という
  `ios-native-features`スキルの方針に従い、なぞり完成時(TraceScreenの
  `completeAndSave`)にのみ付与。文言は`src/copy/childCopy.ts`(子供向け、
  かなのみ)と`src/copy/parentCopy.ts`(親向け、漢字可)に分離して集約し、
  `npm run check:copy`(正規表現でCJK漢字の混入をチェック)を追加。
  `npm run build`成功、`npm run check:copy`成功、`npx cap sync ios`で
  4プラグインの組み込みを確認。ブラウザ拡張が未接続のため目視確認は未実施。
- 2026-09-17: 実装手順書 Step8(AdMob広告)完了。docs/admob-setup.mdの確認事項に
  沿って、Google公式テスト広告ID(登録不要)で実装。`@capacitor-community/admob`
  を導入し、`initialize()`に`tagForChildDirectedTreatment: true`・
  `maxAdContentRating: General`を設定、広告リクエストは常時`npa: true`
  (非パーソナライズ)。下帯固定バナーはHome/Galleryにマウントされている間だけ
  表示する`useBottomBannerAd`フックで実装(なぞり中は自動的に非表示)。
  完了演出→ホーム戻りのタイミングでN=4回に1回インタースティシャルを表示
  (Preferencesでカウンタ管理)。Info.plistに`GADApplicationIdentifier`
  (テストID)と`SKAdNetworkItems`(暫定1件)を追加。ATT許可ダイアログは
  方針どおり実装しない。`npm run build`/`check:copy`成功、`npx cap sync ios`
  で5プラグインの組み込みを確認。ブラウザ拡張が未接続のため目視確認は未実施。
- 2026-09-17: 実装手順書 Step8.5(広告非表示プラン・買い切りIAP)完了。
  docs/iap-onetime-setup.mdの確認事項に沿って実装。`@capgo/native-purchases`
  (StoreKit 2直叩き、RevenueCat等は不使用)で`ProContext`を実装し、
  `getPurchases({onlyCurrentEntitlements:true})`で購入状態を確認、
  StoreKitに問い合わせられない場合は直近の既知の値(Preferences)に
  フォールバックする(`確認失敗時にfalseへ倒さない`方針)。`@capacitor/app`の
  `resume`イベントで前面復帰時に価格・購入状態を再取得。SettingsScreenに
  価格表示付き購入ボタン(価格取得前は非活性)・購入を復元ボタンを追加。
  `lib/ads.ts`のバナー/インタースティシャルは購入済みなら何も表示しないよう
  ガード済み。`npm run build`/`check:copy`成功、`npx cap sync ios`で
  7プラグインの組み込みを確認。ブラウザ拡張が未接続のため目視確認は未実施。
- 2026-09-17: 実装手順書 Step8.6(リテンション通知)完了。
  `@capacitor/local-notifications`を導入し、`ios-native-features`スキルの
  「単発通知を先まで積む・refreshRemindersに集約」方針で`reminderSync.ts`を実装。
  毎回いったん全通知(ID1〜3固定)をキャンセルしてから、状態に応じて必要な分だけ
  単発スケジュールし直す方式(OSの繰り返し通知には条件判定がないため)。
  設計書「11. リテンション施策」の3パターン(写真0枚→3日後、登録数字3つ以下→
  7日後、スタンプ9/11以上→翌日)を実装。`refreshReminders()`は起動時・
  チュートリアル完了時・写真登録後・なぞり完成後に呼び、常に最新状態へ
  貼り直す。SettingsScreenに通知ON/OFFトグルを追加(OFF時は全キャンセル)。
  `npm run build`/`check:copy`成功、`npx cap sync ios`で8プラグインの
  組み込みを確認。ブラウザ拡張が未接続のため目視確認は未実施。
  Step8系(広告・IAP・通知)がすべて完了し、Phase1(MVP)の主要機能は
  実装完了。次はStep9(ビルド・署名・TestFlight配信)に着手する。
- 2026-09-17: Step8.6までのコードレビュー指摘をすべて修正。
  - スタンプ: 3周目以降にスタンプが止まるバグを修正。「カード回数+週数」をやめ、
    上限のない周回番号(cycle)1つで管理(`progressLogic.ts`、テストあり)
  - 広告: バナーの高さ+16pxを CSS変数 `--banner-offset` で画面下端に確保し、
    歯車ボタン・戻るボタンが隠れないようにした。バナー表示/非表示の非同期競合で
    なぞり画面にバナーが残る問題を世代番号で修正。テスト広告設定を
    `USE_TEST_ADS` 1か所に集約し、`npm run check:release` で残存を検出
  - 保護者確認: 長押しだけ → 長押し+かけ算クイズ(2桁の答えを入力)に変更
  - なぞり画面: 画像の読み込み完了まで描画・完成判定を受け付けない。保存失敗時も
    画面が止まらず、結果画面で「ほぞんしたよ」と誤表示しない。完成処理中は
    やりなおす/ぜんぶけすを無効化。画面を縦向き固定に
  - チュートリアル: ガイドの輪を実際の表示配置から計算。縦長画面でタイヤが
    見切れないよう、同梱SVGを縦長の構図(600×900)に描き直した(テストあり)
  - 保存: ストロークをPreferencesからファイルへ移動。作品を長辺1200pxのJPEGと
    320pxサムネイルで保存し、ギャラリー・結果画面はサムネイルを表示
  - 通知: 翌日以降の午前10時に固定。OS側で拒否されている時は設定画面で案内
  - 課金: キャンセル時の例外処理、価格読み込み中表示、復元結果の表示、
    購入後も「購入を復元」を表示
  - その他: 写真登録の保存失敗時に画面が止まる問題を修正、設定画面の開発用メモを削除、
    プラグイン未導入のSplashScreen設定・未使用のDexieを削除、CLAUDE.mdを実態に合わせた
  - `npm test`(vitest)を導入し10件。ビルド・check:copy成功、`check:release`は
    テスト設定のため意図どおりNG
  - 残課題: チュートリアル完了後は保護者確認なしで写真登録画面に入る(設計書どおり)。
    ただし設定・課金へは再びクイズが必要

## 素材の未着手事項

- チュートリアル用「くるまのしゃしん」は暫定SVGイラスト。実写真または
  正式なイラスト素材への差し替えが必要(実装手順書 Step1「進め方の基本方針」)。
- 効果音・声優ガイド音声(実装手順書 Step7)はユーザー判断で対象外。
  必要になった場合は別途音声素材を用意してから`@capacitor/native-audio`等で
  組み込む。

## 収益モデルの方針転換(2026-09-17)

Step8(AdMob広告)実装後のユーザーとの対話の中で、以下の経緯により**広告を撤去し、
買い切りIAPのみの収益モデルに変更した**。

- Apple公式のApp Review Guidelines 1.3(Kidsカテゴリ)原文を確認した結果、
  サードパーティ広告は「Kidsカテゴリ向けに公開文書化された方針を持ち人力レビューする
  広告事業者」のみ例外的に許容される仕組みだが、Apple Developer Forumsで
  AdMob使用時のリジェクト事例(IDFA関連APIの参照が残っているだけで弾かれる等)が
  繰り返し報告されており、審査リスクが高いと判断
- 競合調査(Khan Academy Kids・PBS Kids・Toca Boca・タッチ!あそベビー)の結果、
  1〜3歳向け知育アプリは軒並み「広告なし」(無料+非営利、または買い切りIAPでの
  コンテンツ解放)という収益化パターンが主流だった
- StoreKitの無料トライアル機能はサブスクリプション専用で、買い切り(非消耗型)IAPには
  使えないため、「期間による無料お試し」は再インストールで回避されてしまう
  (ローカル完結アプリではサーバー側での期限管理ができない)
- 上記を踏まえ、**「見えるが書けない」パターン**(iap-onetimeスキルの設計原則)で、
  無料版は写真登録を合計3枚までに制限し、買い切りで無制限に解放する方式に変更

### 実施した変更

- `@capacitor-community/admob`を撤去(パッケージ・`src/lib/ads.ts`等の関連ファイル・
  Info.plistの`GADApplicationIdentifier`/`SKAdNetworkItems`をすべて削除)
- `src/lib/proConfig.ts`に`FREE_PHOTO_LIMIT = 3`を追加
- `RegisterScreen`: 無料版は3枚を超える登録を止め、購入導線(価格表示付き購入ボタン)を
  同画面に表示。一部だけ上限内で登録できる場合はその旨を案内
- `parentCopy.pro`: 「広告を消す」→「写真をもっと登録する」に文言変更
- `docs/admob-setup.md`を削除、`docs/iap-onetime-setup.md`に変更履歴を追記
- `scripts/check-release.mjs`(テスト広告設定チェック)を削除(広告自体が無いため不要に)
- `npm run build`/`npm test`(10件)/`npm run check:copy`成功、
  `npx cap sync ios`で7プラグインの組み込みを確認

## Step9(TestFlight配信)実機テストで発覚した不具合の修正(2026-09-18)

証明書リポジトリを`VitaNote-certificates`(weightと共有)に一本化し、
GitHub Actionsでcertificates→betaレーンを実行、TestFlight配信まで到達。
実機テストで「UIが画面に収まらない・写真登録ができない・見た目が単調」の
指摘を受け、以下を修正した。

- **致命的バグ**: `.number-grid`(0〜10のボタン)が4列×`min-width:88px`で
  組まれており、**iPhone 15 Pro Maxでも1列86.5pxしか確保できず、全機種で
  必ず横方向にはみ出す計算ミス**だった(3列に修正、`aspect-ratio:1`で
  正方形を保ちつつ幅に応じて可変にした)。写真登録の「どの すうじに する?」
  画面も同じグリッドを使っていたため、タグ付けボタンが押せず
  **「写真登録もできない」の直接原因**になっていた
  - iPhone SE/15/15 Pro Maxの3機種で1ボタンあたりの幅を計算するテストは
    書いていないので注意(手計算で確認したのみ)
  - `ParentGateButton`(右下固定)と最後のボタンが重なる懸念にも対応
    (`.screen--with-gate`で下余白を確保)
- **デザイン刷新**: 「色遣いが単調・平坦」という指摘に対し、
  `index.css`にキャンディ配色パレット(`--candy-0`〜`--candy-7`、
  明暗2色+落ち影+文字色のセット)を追加。0〜10の数字ボタンに
  `numberColorClass()`(`src/lib/numberColor.ts`)で色相バリエーションを
  持たせ、全ボタンにグラデーション+ドロップシャドウ+押下時の沈み込みを追加。
  背景も単色グラデーションから複数の淡い放射グラデーションを重ねたものに変更。
  ギャラリーのフィルタボタンも同じ色対応にした
- 証明書リポジトリを1つにまとめたことで、`MATCH_GIT_URL`を誤って
  このリポジトリ自身に向けてしまい、証明書が孤立して1枚無駄になった
  (ユーザーがApple Developer portalで失効させ復旧)。Secretsの値を
  再設定する際は指定リポジトリ名を毎回指差し確認すること
- `npm run build`/`npm test`(10件)/`npm run check:copy`成功。
  ブラウザ拡張が接続できず、今回も実機での目視確認は次のTestFlight配信を待つ

## 実機フィードバックを受けた追加修正・機能追加(2026-09-18 続き)

- **ステータスバー分の余白不足**: `.screen`が`env(safe-area-inset-top)`を
  確保していなかったため、中央寄せの計算が実表示領域とずれてUIが下寄りに
  見えていた。全画面に上端セーフエリアを追加。数字ボタンは`aspect-ratio:1`で
  幅に連動して縦に伸びていたため、高さ76pxの固定値にして11個並べても
  画面に収まるようにした(`TraceScreen`/`GalleryScreen`も同様に対応)
- **保護者ボタンの発見しづらさ**: 長押し自体は機能していたが、押した瞬間の
  視覚フィードバックが無く「反応が分からない」「長押しという操作自体に
  気づけない」という指摘を受け、「長押しで開く」のヒント表示・タップ領域拡大
  (40→52px)・押下アニメーション・iOSタッチアンドホールド無効化
  (`-webkit-touch-callout`)を追加
- **なぞりの完成判定に教育的な仕掛けを追加**:
  - なぞる本数を対象の数字にひもづけ(`requiredStrokeCount`、1〜4本の範囲で
    数字ぶんの回数を要求)。1本の長い線で即完成してしまう問題を緩和
  - 完成後に「おうちの なかにも ○みたいな かたちが あるか さがしてみてね」を
    追加し、アプリの外の実物探しに誘う声かけを追加(表示時間3→4秒に延長)
  - 数字とドット(量)の対応表示(`NumberDots`コンポーネント)をホーム画面の
    数字ボタン・なぞり画面の見出しに追加。0は空の輪っかで表現
- **写真選択の改善**: 1つの数字に複数枚登録されている場合、これまでは
  ランダムに1枚選ばれるだけで選べなかった。数字選択後に`PhotoSelectScreen`を
  新設し、写真が1枚だけならそのまま直行(操作は増えない)、2枚以上ある時だけ
  サムネイルから選べるようにした
- **スタンプ機能の追加**: なぞる(ペン)に加えて、対象の数字そのものを
  タップした場所に配置する「スタンプ」ツールを追加(`src/lib/stamps.ts`)。
  ペンとスタンプは混在可能。完成判定は線+スタンプの合計を
  `requiredStrokeCount`でカウントし、スタンプは1個でも十分な意思表示として
  線の長さ条件を免除する。保存データも線とスタンプ両方を記録
  (`${id}.drawing.json`)するよう`artworkRepository`を更新
- `npm run build`/`npm test`(14件)/`npm run check:copy`成功

## 完成方法を60秒モード/せいげんなしモードに置き換え(2026-09-18 続き)

なぞる本数を数字にひもづける自動判定(`requiredStrokeCount`)は、実際に
遊んでみると判定基準が分かりにくいという声を受け、**「60秒経ったら自動で
完成」「せいげんなしモードは"かんせい!"ボタンで自分から完成させる」の
2モードに置き換えた**。旧ロジック(`requiredStrokeCount`/
`totalStrokeLength`によるストローク本数・長さの自動判定)は完全に撤去。

- `PhotoSelectScreen`に「⏱ 60びょう」「♾ せいげんなし」のモード切り替えを追加。
  写真が1枚の数字はモードを選んだ瞬間になぞり画面へ、2枚以上ある数字は
  写真選択と併用
- 60秒モード: なぞり画面右上に円形ゲージ(`TimerRing`)を表示し、色が
  減っていく形で残り時間を示す。0になった瞬間に自動で完成・保存
- せいげんなしモード: ツールバーに「かんせい!」ボタンを表示し、
  タップした時点で完成・保存(線・スタンプの本数や長さは問わない)
- チュートリアルは「せいげんなし」固定(従来どおり1本なぞればボタンで完了)
- `src/lib/strokes.ts`から`requiredStrokeCount`/`totalStrokeLength`と
  そのテストを削除(呼び出し元が無くなったため)
- `npm run build`/`npm test`(10件)/`npm run check:copy`成功

## 数字表示の見た目を刷新(2026-09-18 続き)

「数字のための〇は星の方がいい、フォントも魅力的じゃないし小さい」という
指摘を受けて対応。

- **専用フォント「Fredoka」を同梱**: Google FontsのFredoka(丸くて楽しい書体、
  SIL Open Font License 1.1)をビルド時に取得し`src/assets/fonts/`に同梱
  (`Fredoka-OFL.txt`にライセンス全文も同梱)。**外部CDNは使わず、実行時の
  外部通信なしの方針を維持**。`.numeral`クラスとして`index.css`に定義
- 数字表示サイズを拡大: ホーム/登録画面の数字ボタン(24→30px)、なぞり画面
  見出し(30px)、完了画面の見出し(34px)
- 「3を さがそう!」のような文言は、数字部分だけこのフォント・サイズを
  当てられるよう、childCopyの`promptFor`/`found`を数字と接尾語
  (`promptSuffix`/`foundSuffix`)に分割し、`NumeralText`コンポーネントで
  数字部分のみ`.numeral`にする
- 数字とセットで見せていた量表示(`NumberDots`)を、単色の丸から★マークに変更
- キャンバス上のスタンプ(数字そのものを配置する機能)にも同じフォントを適用し、
  描画前に`document.fonts.load()`で事前読み込みするようにした
- `npm run build`/`npm test`(10件)/`npm run check:copy`成功

## 実機フィードバック続き(2026-09-18 さらに続き)

- **本文フォントが変わっていなかった不具合**: 「とうろくが ないよ」「おうちの
  なかも さがしてみてね」等の本文がシステム標準フォントのままだった。
  丸みのある日本語フォント「Yusei Magic」(SIL OFL、同じくビルド時取得・
  同梱)を取得し、`body`全体のデフォルトフォントに設定
- **長文が改行されず見切れる不具合**: `.screen`が縦方向flexで
  `align-items: center`のため、`<p>`が内容の幅に縮んで折り返さずはみ出して
  いた。`.screen p`/`.pro-section p`に`width:100%; max-width`を指定して修正
- **写真1枚の時に選ぶ写真が出ない不具合**: モードボタンを押した瞬間、写真を
  一度も見せずになぞり画面へ進んでいたのが原因。常にサムネイルを表示し、
  タップして確定する方式に統一(`PhotoSelectScreen`)
- **写真がある数字でモード選択画面に「ホームに もどる」が無い不具合**:
  分岐漏れで戻るボタンが存在しなかった。追加した
- **進行状況の文言が分かりにくい**: 「いまは 1まいめ」→「★を ぜんぶ
  あつめよう(1まいめ)」に変更し、目的(★を全部集める)を明示
- **保護者ボタンが歯車アイコンだけで分かりにくい**: `ParentGateButton`に
  `label`プロパティを追加し、円形→ラベル付きピル型に変更。ホーム画面は
  「しゃしんの とうろく」、登録画面は「せってい」を表示
- **ギャラリーに拡大表示・削除機能を追加**: サムネイルタップでフル解像度の
  1枚表示(`ArtworkViewer`)を新設。長押しでiOS標準の「写真に追加」を
  使える旨のヒントを表示(アプリ側では保存処理をせず、画像への
  `-webkit-touch-callout`をブロックしないことで実現)。削除は
  `ParentGateButton`(長押し+かけ算)の先に「元に戻せません」の確認を
  挟んでから実行(`deleteArtwork`で画像・サムネイル・描画データ・
  メタデータをすべて削除)
- `npm run build`/`npm test`(10件)/`npm run check:copy`成功
