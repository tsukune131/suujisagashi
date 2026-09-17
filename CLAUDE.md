# すうじさがし

<!-- 新アプリ立ち上げ時に __PLACEHOLDER__ を置換し、方針の空欄を埋めること -->

React + TypeScript + Vite + Capacitor の iOSアプリ。
Windows + GitHub Actions のみで開発・配布する(Macは使わない)。

## 不変の識別子(表示名が変わっても据え置く)

- Bundle ID: `com.tsukune.suujisagashi`(**変更禁止**。変えるとTestFlight配布が切れる)
- GitHubリポジトリ: `tsukune131/suujisagashi`
- 証明書リポジトリ: `tsukune131/suujisagashi-certificates`(Private)

## 方針

- ターゲット: 1〜3歳の幼児(操作は保護者との「親子共同利用」が前提)
- ポジショニング: 自分の写真ライブラリの中から0〜10の数字の形を見つけて指でなぞる知育アプリ。
  絵本「すうじのうた」のように身近なモチーフと数字を結びつけて遊ぶことが目的で、
  厳密な数の理解は目指さない
- 収益モデル: **広告なし**。無料版は登録できる写真を合計3枚まで
  (`src/lib/proConfig.ts`の`FREE_PHOTO_LIMIT`)に制限し、買い切りIAP
  「すうじさがし Pro」(製品ID: `com.tsukune.suujisagashi.pro`)で無制限に解放する
  (2026-09-17決定。理由: 1〜3歳向けアプリでの広告収益化は競合実例
  (Khan Academy Kids・Toca Boca・あそベビー等)でも一般的でなく、
  Apple Kidsカテゴリでの広告SDKはリジェクト事例が多く審査リスクが高いため)
- **完全ローカル**: アカウントなし・外部通信なし。
  プライバシーラベルは「データ収集: なし」を維持できる
- やらないこと:
  - 広告(AdMob等のサードパーティ広告SDK)。上記の理由により不採用
  - クラウド同期・機種変のためのJSON書き出し(データはiCloudのアプリコンテナ復元に委ねる)
  - 形一致判定(厳密になぞれているかの判定は行わない。自由に描けること自体が体験)

## 設計ドキュメント

- 設計書: https://claude.ai/code/artifact/16c6dceb-857d-455f-a377-a1d3f6fdf17e
- 実装手順書: https://claude.ai/code/artifact/29acd08e-e55a-47ad-b0b7-e91510c01166

## 進め方

- ROADMAP.md の関門付きフェーズ制で進める。**各フェーズ末のチェックポイントで
  ユーザー確認を取り、勝手に次フェーズへ進まない**
- 完了したタスクは ROADMAP.md のチェックを更新する
- ストア掲載テキストは store/appstore-listing.md を正とする

## 技術メモ

- ビルド: `npm run build`(相対パス `base: './'`。WKWebViewにサブパスビルドを
  読ませると真っ白になる)
- Capacitorプラグインは**静的import**(動的importで実機が固まった前例あり)
- コード分割(React.lazy)は自前コードのみ可
- ストレージ: 小さなメタデータ(写真・作品の一覧、進行状況、設定)は Capacitor
  Preferences、画像やストローク等の大きなデータは Filesystem(Directory.Data)。
  **Preferences(=UserDefaults)に大きなデータを入れない**。
  バックアップはiCloudのアプリコンテナ復元に委ねる
- テスト: `npm test`(vitest)。ロジックは画面から切り出して純粋関数にしてテストする
- TestFlight配布: Actions → iOS TestFlight → lane=beta(手順は docs/ios-release-setup.md)
- Capability変更時は lane=refresh_profiles を先に実行

## 親ハーネス

`..\..\apps` のスキル(/new-ios-app, /ios-release-pipeline, /ios-native-features,
/iap-onetime, /appstore-listing)と release-auditor エージェント、
`..\playbooks\lessons.md`(落とし穴集)を参照。
