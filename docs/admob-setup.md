# AdMob広告 導入手順(Step8/Step8.5)

実装手順書 Step8(AdMob広告)・Step8.5(広告非表示プランIAP)に対応する、
**Google/Apple側の手続きとユーザー確認事項**をまとめたもの。
コード側の実装(プラグイン組み込み・表示制御)はこのファイルと関係なく進められる。

- Bundle ID: `com.tsukune.suujisagashi`
- 関連スキル: `ios-release-pipeline`(TestFlight配布)、`iap-onetime`(買い切りIAP)

---

## 実装前に確認したいこと

コードは以下の前提で先に進めます。違う場合はご指示ください。

1. **AdMobアカウントをまだお持ちでない前提**で進めます。
   実装自体はGoogle公式の**テスト広告ID**で行い、審査直前に本番IDへ差し替えます
   (テストIDは登録不要ですぐ使えるため、アカウント開設と並行して実装できます)。
2. **インタースティシャル広告の頻度は N=3〜4回に1回**(完了演出後のホーム
   戻りタイミング)で実装します。体感を見て後から調整可能な変数にします。
3. **App Tracking Transparency(ATT)の許可ダイアログは出さない**方針にします。
   設計書どおりパーソナライズ広告を使わない(`tagForChildDirectedTreatment`
   相当を有効化、コンテキストターゲティングのみ)ため、IDFA取得が不要になり
   ATTダイアログ自体を省略できます。
4. **子供向けカテゴリ相当のタグ設定**(Google Families ポリシー)を
   広告リクエストに必ず付ける前提でコードを書きます。

---

## Part A: AdMob側の手続き(ユーザー作業)

### A-1. AdMobアカウントを作る

1. https://admob.google.com/ にアクセスし、Googleアカウントでサインアップ
2. 支払い情報(銀行口座)は収益が発生してから登録でよい(後回し可)

### A-2. アプリを追加する

1. AdMobコンソール → **アプリ** → **アプリを追加**
2. 「ストアに公開されていますか?」→ **いいえ**(App Store Connect登録前でもOK。
   後で紐づけ可能)
3. プラットフォーム: **iOS** / アプリ名: `すうじさがし`
4. 作成すると **AdMobアプリID**(`ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`形式)
   が発行される → **これをInfo.plistの`GADApplicationIdentifier`に設定する**

### A-3. 広告ユニットを作る

「広告ユニット」→「広告ユニットを追加」で以下2つを作成:

| 広告ユニット | フォーマット | 用途 |
|---|---|---|
| すうじさがし・バナー | バナー | Home/Galleryの下帯固定 |
| すうじさがし・インタースティシャル | インタースティシャル | 完了→ホーム戻りタイミング、N回に1回 |

作成すると各々 `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ` 形式のIDが発行される。

### A-4. 子供向けの配信設定

1. アプリ設定 →「ユーザーとデバイスからのリクエストをすべて、子ども向けの
   Googleファミリーポリシー対象として扱う」を**オン**にする
   (コード側の`tagForChildDirectedTreatment`と二重で効かせる)
2. 「広告コンテンツ設定」で「G」(すべての年齢向け)を上限に設定

### A-5. app-ads.txt(任意、Phase 2以降でよい)

収益最適化のための不正広告対策ファイル。GitHub Pagesの紹介ページ
(ROADMAP フェーズB-3)を公開したタイミングでルートに設置すればよく、
MVPの必須事項ではない。

---

## Part B: App Store Connect側の手続き(ユーザー作業)

> 実装状況: `ios/App/App/Info.plist`に`GADApplicationIdentifier`(テストID)・
> `SKAdNetworkItems`(Google自身のID1件のみ)を設定済み。本番提出前に
> B-1/B-2の内容で差し替え・追記が必要。

### B-1. Info.plistへの反映(コード側で対応、確認のみ)

A-2で取得したAdMobアプリIDを、実装時に以下へ設定する:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

テスト広告IDでの実装中は、Google公式のサンプルアプリID
(`ca-app-pub-3940256099942544~1458002511`)を仮置きし、本番IDが
発行され次第差し替える。

### B-2. SKAdNetwork識別子

Info.plistに`SKAdNetworkItems`としてGoogle/広告ネットワークのSKAdNetwork
IDを追加する必要がある(Appleの帰属計測の仕組み)。
Google公式リストをそのまま使う:
https://developers.google.com/admob/ios/best-practices#skadnetwork

MVP実装時にコード側で追加するので、ここでは追加作業不要。

### B-3. プライバシー「栄養ラベル」の申告(提出直前・Step10で実施)

AdMobを組み込むと「データ収集: なし」の申告は維持できなくなる。
Step10(リリース準備)で以下を申告する:

| データ種別 | 収集 | 利用者に関連付け | 用途 |
|---|---|---|---|
| 識別子(広告ID等) | あり(非パーソナライズ配信のため最小限) | いいえ | 広告表示 |
| 使用状況データ | あり(AdMob SDKの計測分) | いいえ | 広告表示・分析 |

パーソナライズ広告を使わないため「トラッキングに使用: いいえ」で
申告できる想定(Step10で`release-auditor`エージェントに最終確認させる)。

### B-4. ATTの扱い

Part Aの前提どおりパーソナライズ広告・IDFA取得を行わないため、
`NSUserTrackingUsageDescription`は**追加しない**(ATTダイアログを出さない)。
もし将来パーソナライズ広告を検討する場合はこの前提から見直しが必要。

---

## Part C: 実装への反映タイミング

| タイミング | 使うID |
|---|---|
| 今回のStep8実装 | Google公式テストID(即使用可、登録不要) |
| Step10(リリース準備)直前 | Part A-2/A-3で取得した本番ID に差し替え |

本番IDが発行されたら、次の3か所を変える:

1. `src/lib/adConfig.ts` の `PRODUCTION_AD_UNIT_IDS` にバナー/インタースティシャルのIDを入れる
2. 同ファイルの `USE_TEST_ADS` を `false` にする
   (`initializeForTesting` / `isTesting` もこの値に連動する)
3. `ios/App/App/Info.plist` の `GADApplicationIdentifier` を本番のAdMobアプリIDにする

変更後に `npm run check:release` を実行し「提出前チェックOK」になることを確認する。
テスト設定が1つでも残っていると失敗する。

---

## 買い切りIAP(Step8.5)側で別途必要になること

こちらは`iap-onetime`スキル側の手続きに従う(App Store Connectでの
非消耗型IAP商品作成、製品ID `com.tsukune.suujisagashi.pro` は既に予約済み)。
本ファイルの対象外。
