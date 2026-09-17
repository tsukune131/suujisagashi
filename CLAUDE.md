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
- 収益モデル: 基本無料+下帯バナー広告(なぞり画面中は非表示)。
  将来的に買い切りIAP「すうじさがし Pro」(製品ID: `com.tsukune.suujisagashi.pro`、予約済み)で
  広告を永久非表示にする拡張を予定(Step8.5、非MVP)
- **完全ローカル**: アカウントなし・外部通信なし(広告SDKのみ例外)。
  プライバシーラベルは「写真・行動データの収集なし」を維持。
  広告SDK(AdMob)はパーソナライズ広告を無効化し、この申告を崩す解析・エラー監視SDKは追加しない
- やらないこと:
  - クラウド同期・機種変のためのJSON書き出し(データはiCloudのアプリコンテナ復元に委ねる)
  - 形一致判定(厳密になぞれているかの判定は行わない。自由に描けること自体が体験)
  - インタースティシャル広告の完了演出直後への割り込み(達成感を分断するため、ホーム戻り時のみ)

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
- ストレージ: Dexie(IndexedDB)。バックアップはiCloudのアプリコンテナ復元に委ねる
- TestFlight配布: Actions → iOS TestFlight → lane=beta(手順は docs/ios-release-setup.md)
- Capability変更時は lane=refresh_profiles を先に実行

## 親ハーネス

`..\..\apps` のスキル(/new-ios-app, /ios-release-pipeline, /ios-native-features,
/iap-onetime, /appstore-listing)と release-auditor エージェント、
`..\playbooks\lessons.md`(落とし穴集)を参照。
