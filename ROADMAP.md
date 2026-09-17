# すうじさがし 公開ロードマップ

ゴール: App Storeでの一般公開。
方針: **無料でできる改善をすべて先に行い、納得してから課金ステップ
(Apple Developer 年99ドル)に進む。**
各フェーズの最後に「チェックポイント」があり、そこで次に進むか判断する。

収益の位置づけ: 維持費の年99ドルを広告収益で回収できたら成功。買い切りIAPは広告収益の補完として位置づける。

## プロダクト方針

- ポジショニング: 「自分の写真の中から0〜10の数字を見つけて指でなぞる、1〜3歳向け知育アプリ」
- ターゲット: 1〜3歳の幼児(親子共同利用が前提)
- 収益モデル: 基本無料+下帯バナー広告(なぞり画面中は非表示)+買い切り「すうじさがし Pro」
  (製品ID: `com.tsukune.suujisagashi.pro`)= 広告を永久に非表示にする
- **完全ローカル**: アカウント・外部通信なし(広告SDKのみ例外)。パーソナライズ広告は無効化し、
  「データ収集: なし」の訴求を崩す解析・エラー監視SDKは追加しない
- **やらないこと**(要望が出ても足さない。不採用の決定は理由ごと追記):
  - クラウド同期(開発者がデータを見られる構造になる)
  - データのJSON書き出し(機種変はiCloudバックアップに委ねる)
  - 形一致判定(自由に描けること自体が体験。厳密な正誤判定はしない)
  - インタースティシャル広告の完了演出直後への割り込み(達成感を分断するため)

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
- [ ] B-1.5 広告(AdMob)・買い切りIAPの実装(実装手順書 Step8, Step8.5)
- [ ] B-2 法務文書(プライバシーポリシー・利用規約)を公開し、
      設定とオンボーディングからリンク(広告SDKのデータ収集項目を正確に申告)
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
  次はStep6(初回チュートリアル)に着手する。
