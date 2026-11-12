# 機能と検証状況 — 2026-11-05

この版は端末内で使う初期実用版です。仕様書の高度機能をすべて実装したものではありません。「実装済み」は下記の範囲に限ります。

| 分類 | 状態 | 実装範囲・制限 |
|---|---|---|
| 日本語UI・レスポンシブ | 実装済み | PCと390px幅の主要初期画面を検証。全スマホ機種は未検証 |
| チーム管理 | 一部実装 | 複数チーム作成・改名・カテゴリ・年度・アーカイブ。選手追加・背番号・ポジション。選手の削除・完全な編集UIは未対応 |
| モデルの階層編集 | 実装済み | 空／4局面テンプレート、自由な局面・原則・基準、良い例・改善例、並替・複製・保管・復元。モデル編集のUndo/Redo |
| 公開版と過去版の保全 | 実装済み | 公開版編集禁止、新しい下書き版、試合ごとの版固定、変更前後の表示。チーム間コピーは新ID |
| モデル高度設定 | 一部実装 | 説明・条件あり。重み、対象年代・位置、任意評価尺度、色編集、詳細差分分類は未対応 |
| 試合管理 | 一部実装 | 対戦相手・日時・人数・スコア・版指定。登録後の試合編集、複数カメラ・前後半動画、選手選抜は未対応 |
| 動画・評価タグ | 実装済み | 再生・速度・コマ相当移動・区間タグ・基準・複数選手・コメント・原則/評価検索・連続再生。実コマ境界は保証しない |
| 描画 | 一部実装 | 矢印・線・円・矩形、色、Undo/Redo、タグ保存。フリーハンド・文字・位置移動・太さ・個別表示時間は未対応 |
| 動画編集 | 一部実装 | 単一素材からトリム・並替・分割・削除・速度・字幕・タグ描画。複数素材トラック、ズーム、フリーズ、音声、編集プロジェクト保存は未対応 |
| 動画出力 | 一部実装 | 720p映像のみ・10分上限・MP4/WebM対応判定・キャンセル・進捗。短い合成映像の生成と再生を実ブラウザーで検証。1080p・音声未対応 |
| 2D戦術盤 | 実装済み | 5/7/8/11人、選手/相手/ボール配置、ドラッグ・数値位置・向き、5秒キーフレーム、再生/停止/シーク/速度、保存・復元 |
| 3Dと選手目線 | 一部実装 | 同じ配置の3D・サイド・ゴール裏・選手追従視点。自作プリミティブ。カメラ高さ/FOV調整、人体モーション、自由ピッチ寸法未対応 |
| 戦術動作とボール | 一部実装 | 全ピースの直線補間。保持者追従、パス種別、シーン連結、ループ、経路描画は未対応 |
| 戦術盤とモデル連携 | 実装済み | チーム・版・原則・基準・元タグ参照。レポートから関連戦術盤へ移動 |
| 戦術動画化 | 一部実装 | 表示中のCanvasを録画。2D動画の生成・実再生を検証。3D動画出力はコード実装済みだが生成物の個別再生検証は未実施。説明焼込は2Dのみ |
| AI姿勢推定 | 一部実装・実験機能 | ローカル.taskモデル選択、MediaPipe CPU推論、33点、両膝2D角度、CSV。実人物素材で未検証。モデル同梱・Worker・肘/股関節・結果保存は未対応 |
| 2本のフォーム比較 | 一部実装 | オフセット、同期開始・0.5倍速・停止・コマ相当。長時間の同期補正と比較プロジェクト保存は未対応 |
| 集計・レポート | 一部実装 | 試合/原則/評価フィルタ、観察数・分母・4評価・実践度、コメント/映像/戦術へのリンク、練習課題保存、CSV、ブラウザー印刷PDF。選手/期間/基準別フィルタ、試合間比較は未対応 |
| JSONバックアップ | 実装済み | 全記録を出力、スキーマ/参照/重複検証、矛盾時は全体を拒否し既存記録維持。動画を含まない。全データ復元のみ。モデル単体JSON読込と旧スキーマ移行は未対応 |
| 端末保存 | 実装済み | IndexedDB、自動保存状態、容量目安、永続保存要求。保存失敗時はJSON退避を案内。アプリ全体の削除ボタンなし |
| PWA・オフライン | 一部実装 | manifest・アイコン・閲覧済み同一オリジンキャッシュ。完全オフライン受入・各OSインストール検証は未実施 |
| SaaS・認証・課金 | 未実装 | localは課金なし。saas指定は停止画面。共有、所属認可、Stripe、D1スキーマは未実装 |
| 自動追跡・実移動距離・自動3D復元 | 未実装 | 推定やダミー値を表示しない |
| 公開 | デプロイ済み | hkfootballacademy2026アカウントのCloudflare Workers Static Assets。HTTPS配信・公開画面の黒基調デザインをブラウザーで確認済み |

## 実行済み検証

- `npm run typecheck`：成功
- `npm run lint`：成功
- `npm run test`：17件成功（サンドボックス外。Vitest一時ファイルの権限制約のため）
- `npm run build`：成功
- `npm run test:e2e`：6件成功。本番プレビューに対して実行
  - チーム作成 → 局面/原則/基準 → 公開 → 試合登録 → 新版改名 → 旧版維持 → 再読み込み
  - 390px幅とメニューナビゲーション
  - 自作合成WebM → タグ保存 → 字幕付き動画生成 → 生成動画の時間進行 → 実践度100%
  - 戦術配置 → キーフレーム → 保存 → 動画生成/再生 → 再読込 → 3D/選手目線
- ホーム画面のブラウザー目視確認：実施
- 依存関係監査：高/重大は修正版へ更新。残る7件のmoderateは開発用typescript-eslint配下のminimatch由来。実行時のみの `npm audit --omit=dev` は指摘0件。公開配信物にESLintは含まれない。`npm audit fix`で解消しないため今後の上流更新を追跡

実行環境のCloudDockパスに含まれる `#` と仮想ドライブの解決により開発用ツールが失敗したため、検証用コピーでビルドし、本番配信物でE2Eを実施しました。機能不具合ではなく環境要因で起きた初回失敗もあります。最終テストは上記の成功結果です。


## 公開記録

- URL: https://football-analyzer-hk-20261105.football-analyzer.workers.dev
- Cloudflare Version ID: cb6b727b-3126-4bcb-814b-d3f8bcb3b8be
- GitHubへの同期は未実施。検証済みソースはこのフォルダーとsource.zipに保存。



## 黒基調・スマホ表示の追加検証

2026-11-05更新：全体を黒基調へ変更。スマホ幅320/390/768pxで主要11画面を検証。開閉式メニュー・44px以上の主要操作・16pxの入力文字・縦配置・セーフエリアに対応。全体の横はみ出しなし。端末固有の動画コーデック・GPU差は従来どおり制限があります。今回のE2Eは5件成功。型検査付きビルドとlintも成功。


## 標準分析追加（2026-11-05）

- ゲームモデル0件で試合登録・動画タグ付け・自由タグ追加・集計・CSV・クリップ動画出力が可能。15種の標準イベント、自チーム/相手、前半/後半/延長、時系列表示・タイムライン・コメント検索を追加。
- 標準イベント定義は各試合に保持。隠しモデルは作らず、既存モデル版・旧JSONバックアップとの互換性を維持。標準タグから戦術盤の保存にも対応。
- 自動イベント検出・自動トラッキング・xG・ポゼッション推定は未提供。集計は手動記録件数。商用他社製品の全機能と同等という意味ではありません。
- クイックタグは評価「対象外」で保存するため、実践度の分母に自動加算しません。ゴールとシュートは独立したタグです。

## 編集ワークフロー追加
- 検索結果をクリップ編集へ送る、タグ前後秒数指定、試合単位の編集保存・復元を追加。字幕・順序・速度・区間をバックアップに保持。自動追跡・クラウド共同編集は未対応。
- 比較参照: https://www.nacsport.com/comparison.php?lc=en-us / https://www.hudl.com/en_gb/products/sportscode / https://www.metrica-sports.com/

## ソフトウェア動画出力への切り替え
- 字幕付き動画はFFmpeg WebAssemblyでMP4生成。MediaRecorder/captureStream/動画のリアルタイム再生を使用しません。録画APIを意図的にエラーにする回帰テストで出力・実再生を確認。
- 初回は約32MBのエンジンを同一サイトから取得。素材は端末内Workerから読み取り、外部送信しません。字幕・描画・複数区間・速度を保持。キャンセルでWorkerを終了。
- 720p、映像のみ、合計10分まで。処理速度は端末によって異なります。ユーザーのSTATUS_BREAKPOINTが起きた動画・PCでの直接再現は未確認。

## 字幕・音声更新
- ソフトウェアMP4出力は元動画の音声を保持。0.25〜2倍速の音声テンポ調整。入力字幕を最大6行で焼込（超過部分は省略表示）。音声認識・自動文字起こしは含まない。既存の空欄には「空欄の字幕にタグ名を入れる」で補完可能。

## 映像注釈メニュー拡張
- 選手名・番号、選手リング、スポットライト、2点間リンク、矢印、ライン、フリーハンド、円・楕円、四角形、自由エリア、テキストの11種類。色・太さ・不透明度・文字サイズ・塗り・破線、個別削除と設定反映。タグに保存しMP4へ焼込。
- 手動配置・区間全体で位置固定。自由エリアはドラッグした輪郭を閉じる方式。拡大鏡、自動追跡、実距離・速度計測、画像挿入、立体エフェクト、時間に沿う追従は未対応。

## 自動追跡・距離計測（試験機能）
- 1人の領域指定後、正規化相互相関で5/10/20秒の短区間を自動追跡。低スコア・フレーム欠落で停止、軌跡表示・CSV・試合への保存・JSON復元。見た目の似た対象への誤追跡は完全には検出できません。
- 4点と既知の横縦寸法から射影変換し、同一フレームの基準四角形内の2点間距離を推定。画面を移動した場合は基準時刻へ戻す必要あり。地面上の点に限定。
- 固定カメラ推奨。全選手検出、ID自動同定、カメラ移動補正、総走行距離・実速度、追跡アニメーションMP4は未対応。合成移動対象で自動追跡・既知50m計測・スマホ・保存復元を検証。実試合映像の精度評価は未実施。

## 戦術ボード編集の更新（2026-11-07）

- 1〜22名の人数別フォーメーション候補を追加。5・6・7・8・9・10人制にも複数の基本配置。初期人数は味方・相手とも11名。現在のフレームへ味方・相手別に配置を適用できます。
- 選手の向きを2D・3Dのピッチ上でクリック／タップ、またはドラッグで変更できます。
- 元に戻す／やり直すを追加。ドラッグは1操作、履歴は最大60操作。保存後も利用可能で、別プロジェクトを開く・ページ再読み込みで履歴はリセットされます。
- 矢印・サークル・リンク・強調、色・破線、個別削除・フレーム内全削除。フレームごとに保存し、次フレーム追加時にコピー。選手・ボールに付けた演出は移動に追従します。
- npm run build（TypeScriptの型チェックを含む）は成功。単体40件は、Vitestのworker起動が固定60秒制限を超えたため、同じテスト関数をTypeScript変換＋Playwright expectで直接実行し全件成功。結果はtest-results/tactic-edit-unit-results.json。
- 公開用Viteビルドに対し、人数別配置、向きとドラッグのUndo/Redo、演出保存・複製・復元、スマホ全画面タッチ、3D操作の5件が成功。JavaScript例外なし。test-results/tactics-production-results.json。全画面の既存回帰テストも4画面サイズで成功。スマホ・タブレット実機での検証は未実施です。

公開反映（2026-11-07）：Cloudflare Version ID `bfe09b31-c27b-48ee-bc6b-01bd7b2f4b93`。エントリー `index-BV7d0RpG.js`、CSS `index-DpIveIVq.css`。

## ハイライト編集・分析連携の更新（2026-11-07）

- クリップ編集を一つのハイライト画面に統合。タイムライン、区間変更・分割・複製・並べ替え、0.25〜2倍速、フリーズ、ズーム、字幕を搭載。
- 描画の表示区間とスタイル、手動キーフレーム追従、Undo/Redo、複数編集案、自動保存・JSON復元。既存タグ・旧編集を保持。
- 複数試合、同名イベント、選手、対象チーム、GOOD/BAD、3エリア×5レーン図で抽出。一括追加はタグの重複を除外。集計から編集へ接続。ゲームモデルは任意。
- 複数動画および戦術ボードで生成した動画を素材として結合。別クリップの元映像を比較欄で再生。描画付きPNGプレビューとMP4生成。
- MP4は720p・合計10分まで。元音声を保持、スロー音声のテンポ調整、フリーズ部分は無音。追従描画は12fps。処理は端末内。録画APIを使わないソフトウェア出力。
- 外部素材は再選択が必要。アプリ内の保存済み録画は同じブラウザー内から復元。2画面を合成した動画出力、音声解説、クラウド共有、AI人物追従は含まない。
- 型チェック成功。単体46件はTypeScript変換＋Playwright expectで全件成功（test-results/highlight-unit-results.json）。
- 検証用Chromeでは単純なテキストを含めダウンロード保存が中断されるため、OSへの保存完了は未検証。PNGの生成・画像表示およびMP4の生成・実再生を検証対象とする。スマホ・タブレット実機の検証は未実施。

最終公開用ビルドの画面テスト2件成功。複数素材・描画・フリーズ・追従・Undo/Redo・別案保存・PNG署名と表示・MP4再生と音声/無音・スマホ幅タッチ・複数試合イベント/15マス抽出・重複防止を確認。JavaScript例外なし。test-results/highlight-verification.json。エントリー index-EaNfxZhx.js。

公開反映（2026-11-07）：Cloudflare Version ID `a5e0205c-998d-424f-aa35-98e3438aa99d`。エントリー `index-EaNfxZhx.js`、CSS `index-Cp5sfWba.css`、MP4モジュール `highlight-export-CDtNtRz3.js`。公開ファイルのSHA256がローカル検証済みファイルと一致。

## 描画の直接調整と再生操作（2026-11-07）
- ハイライトの描画をマウス・タッチで選択、移動、拡縮。矢印・線・リンクの端点、円・リング・スポットライトの四方向、その他の四隅に操作ハンドル。描画中も各図形を実際の形でプレビュー。1ドラッグで1回のUndo。
- 前コマ／次コマ（1/30秒刻み）、±5秒、再生位置タイムライン。微小なシークを映像に反映。
- 型チェック成功。既存単体46件＋図形単体5件成功。公開用ビルドの画面テスト3件成功（PCマウス、820pxタブレット幅・390pxスマホ幅のタッチ、保存復元、既存MP4回帰）。実機のiOS Safari検証は未実施。
- test-results/highlight-verification.json、test-results/drawing-unit-results.json。

公開反映：Version ID `e6a1af83-ad4a-4359-be48-4345fcd17c20`。エントリー `index-BvUkSXct.js`、CSS `index-DW5_mY5K.css`、MP4モジュール `highlight-export-CR1735PE.js` の公開SHA256照合が一致。

## 時刻別編集・複数選手リンク（2026-11-07）
- 描画の表示開始・終了、時刻別の位置・形状・大きさ・透明度を編集。記録時刻を変更・削除でき、時刻間を補間。描画の分割・フリーズ・JSON保存にも対応。
- 選手間リンクを2〜22人の輪と指定順の接続線に変更。選手を順にクリック／タップして確定。各選手の輪を個別に移動し、時刻別状態を記録できる。旧2点リンクは保持。
- 時間指定のズームを追加。開始・終了・拡大率・表示中心を指定して適用すると区間を分割し、指定区間だけに反映。
- 公開用Viteビルド成功。単体55件・画面4件成功（test-results/highlight-verification.json）。3人の輪の時刻別移動、スマホタッチ、表示時間外の非表示、記録時刻変更、区間ズーム、PNG、リンクを含むMP4生成と音声再生・保存復元を確認。
- 最終型チェックはTypeScript 5.7.3のCompiler APIにソース・型定義をメモリから供給して実行し、診断0件（test-results/timed-typecheck.json）。共有フォルダーの同期読み込み遅延を回避。型注釈の最終修正前後で生成JavaScriptが完全一致することも確認。
- スマホ・iPadの実機Safari検証とOSへのファイル保存完了は未確認。描画補間のMP4出力は12fps。

公開反映：Cloudflare Version ID `3a7d9425-cedf-45df-828a-56dce57a9e6f`。エントリー `index-BfNBYLw8.js`、CSS `index-B8Aj8-Ld.css`、MP4モジュール `highlight-export-Qx4jbSnw.js`。

## 描画・演出の個別タイムライン（2026-11-07）
- 描画ごと・ズーム演出ごとに独立した帯を表示。始／終のドラッグで表示範囲、帯のドラッグで範囲全体と記録点、◆のドラッグで位置・形状を変更する時刻を編集。時間軸1〜8倍、44px以上の端点・記録点、マウス／タッチ／キーボード対応。1ドラッグ1Undo、キャンセル復元。
- ズームをクリップ分割から独立した演出データへ変更。時刻別の中心・倍率を記録し、プレビューとMP4に反映。旧全体ズームを読み込み時に移行。フリーズ・速度は既存のクリップ編集で操作。
- スマホは映像・時間軸と設定欄を上下の独立スクロールにし、追従点追加時は映像へ移動。実機のiPhone／iPad Safariは未検証。
- 最終TypeScript診断0件。公開用ビルド成功。単体60件・画面5件すべて成功（test-results/highlight-verification.json）。PCマウス、390pxスマホ幅・820pxタブレット幅のタッチ、表示端・記録点のドラッグ、Undo/Redo、保存復元、ページ横はみ出しなし、PNG・音声付きMP4生成を確認。

公開反映：Cloudflare Version ID `f04b9599-d1b7-4de8-b44f-912f916e516a`。エントリー `index-5HDWcCbJ.js`、CSS `index-BtnI6gdh.css`、MP4モジュール `highlight-export-86tQyM49.js`。公開ファイルとローカル検証済みファイルのSHA256一致を確認。

## テロップ・横向きピッチ・タグ入力順（2026-11-07）
- 既存字幕を「テロップ文字」と明記した複数行入力へ変更。クリップの再生中に映像下部へ表示し、既存PNG／MP4描画に反映。
- タグ・撮影・ハイライト検索で横向きピッチを共用。攻撃方向は右。左から守備／中盤／攻撃、上から左W／左HS／中央／右HS／右W。105×68m基準でレーン幅13.84／11／18.32／11／13.84m。境界をペナルティーエリア・ゴールエリアの側線に合わせる。中央をセンターサークル基準とする定義もあるが、このアプリはゴールエリア基準。既存位置IDは保持。参考：https://learning.coachesvoice.com/cv/half-spaces-football-tactics-explained/
- イベント選択→エリア→任意評価→登録。動画はイベント選択時に停止して時刻を保持。撮影は録画を継続してイベント選択時刻を保持。明示的な登録で確定、取消可能。
- TypeScript診断0件、Viteビルド成功。単体60件＋画面9件すべて成功。テロップ入力・PNG／MP4生成、15マスの比率と横向き、イベント→エリア→評価のDOM順、イベント選択時刻保持、任意項目省略、編集・保存復元、PC／タブレット／スマホ縦横で映像を保ったタグ操作、疑似カメラ撮影中のタグ保存を確認（test-results/highlight-verification.json）。実機iOS Safariは未検証。

公開反映：Cloudflare Version ID `7c8bc6e8-9244-4070-9521-5804fcab60ac`。エントリー `index-DfJh4ySI.js`、CSS `index-CcIQcyrn.css`、MP4モジュール `highlight-export-e0XObh0W.js`。

## 編集メニュー・テロップ・戦術一覧（2026-11-07）
- 自由タグ追加をイベントの直下に移動。ハイライトのタブはクリップ／描画／演出へ整理。タグ集計・素材比較タブを削除し、必要な元動画再選択と動画追加はクリップへ集約。
- 再生は選択クリップの末尾で停止。帯はクリップ名と描画／演出名を表示し「移動」表示を廃止。クリップ名は編集可能。選択描画のDelete削除、入力欄では文字編集を優先、Undo対応。
- 旧テロップを時刻付き文字描画へ移行。文字サイズ・色・タッチ／マウス移動・表示開始終了帯、保存復元、PNG／MP4に共通反映。分割後に表示範囲外のテロップが再生成されないよう移行済みフラグを保持。
- 戦術ボードは配置／描画／演出メニュー。味方・相手の選手名と背番号を一覧入力し全フレームに反映。新規ボールと球種未指定は演出なし。球種プルダウンを廃止し、演出タブのボール演出ボタンから任意設定。既存の明示的な球種は保持。
- ナビゲーションを試合分析／戦術ボード／フォーム比較へ変更。
- 最終TypeScript診断0件（test-results/editor-menu-typecheck.json）。公開用ビルド成功。単体63件・画面9件を検証。テロップの旧データ移行・色／サイズ・スマホ幅タッチ移動・表示帯・Del／Undo・単独クリップ再生・PNG／MP4生成、選手一覧の全フレーム反映と保存復元、戦術ボードの現在位置表示を確認。撮影1件は初回に疑似カメラのNotReadableErrorが出たため、新ブラウザーで個別再実行して成功。統合結果72件成功：test-results/editor-menu-final-verification.json。iOS Safari実機は未検証。

公開反映：Cloudflare Version ID `c526abe2-6bc7-4f76-8852-07f5cb84f76b`。エントリー `index-DTeqn-Ft.js`、CSS `index-C5MSOv7O.css`、MP4モジュール `highlight-export-BgDRPZ2Z.js`。公開ファイルのSHA256が検証済みローカルファイルと一致。

## Safari系エンジン・モバイル操作の確認（2026-11-07）
- Windows版Playwright WebKit 27.2を導入。iPhone相当390×844／844×390、iPad相当820×1180／1180×820を検証。実機iOS／iPadOS Safariではない。WebKitはタッチtapとマウスポインタのドラッグ、ChromiumではCDPのネイティブタッチ列を使用。
- 修正前WebKitの4条件で、通常の移動・時間帯と記録点調整・明示保存・再読込・永続ブラウザー再起動後の復元は成功。一方、編集直後のpagehideで自動保存待ちの変更が未保存と判明（test-results/webkit-baseline.json）。visibilitychange（非表示）とpagehideで保存を開始する処理を追加。
- 修正前Chromiumの複数指入力で2本目の指がテロップを動かすことを再現（test-results/touch-safety-baseline.json）。キャンバスは操作開始したprimary pointerのIDだけを処理し、pointercancel／lostpointercaptureで復元。時間帯ドラッグもlostpointercaptureで取消・復元。
- 最終型チェック診断0件、Viteビルド成功。WebKit4条件で移動・時間帯／記録点・キャプチャ喪失時の復元・通常保存・再読込・永続プロファイル再起動後の復元を確認。通常の800ms自動保存をテスト時に停止してもpagehide経路だけで保存完了。初回の再読込／再起動後の表示待ちで2条件がタイムアウトしたため個別再実行し成功（test-results/webkit-final.json）。Chromium単体63件＋画面10件、計73件成功。複数指の誤移動とtouchcancel復元を含む（test-results/highlight-verification.json）。実機Safariの確認は残る。

公開反映：Cloudflare Version ID `27128154-b6ef-40d8-86b4-7a4f91cb90c7`。エントリー `index-DjIAdYsi.js`、CSS `index-C5MSOv7O.css`、MP4モジュール `highlight-export-DOVMAlPB.js`。

## 2026-11-08 workspace upgrade (validation in progress)
- Common top-level team management; removed custom game-model editor and converted legacy match/tag references to match-local events.
- Match metadata editing and confirmed deletion; linked tactics retained with tag reference cleared.
- Attack direction 4-way pitch picker; collapsible optional position/player/rating fields; checkboxes for player identity.
- Event/rating bar charts with drill-through to clips.
- Tactical frame time editing/deletion through existing undo history.
- Bundled Pose Landmarker Lite float16 v1, skeleton overlay, aspect-correct 2D knee angles, slow playback/seek, observations with local save and CSV.
- Persistent guide switch and Japanese/English/Spanish/Portuguese/Chinese primary UI translations, including fullscreen controls. User-entered names and comments are not translated.

Validation: full TypeScript check passed; 79/79 regression cases passed; WebKit 4/4 device-layout cases passed on the final build. Public deployment pending verification.

Published and verified: 2026-11-08. Version 6f960a60-fa16-41fe-b849-a87902e6132f. Public HTML references index-C4t1Cnh5.js and index-BBC2LJqI.css. SHA-256 matched JavaScript/CSS/export chunk, QR/PWA assets, manifest/service worker, and bundled pose_landmarker_lite.task.

## Scene reconstruction — implementation in progress
- Freeze current local video frame, calibrate against full pitch, half pitch, or penalty area (4 corresponding points).
- Bundled EfficientDet-Lite0 float32 v1 object detection, full-frame + four overlapping tiles, duplicate suppression, approximate foot anchors.
- Explicit home/away jersey color samples with ambiguous-color rejection; optional manual team/number/name selection.
- Touch/mouse adjustment in image and board coordinates, manual additions/exclusions, explicit confirmation before a new tactic is created.
- No offscreen player padding, no invented ball; unknown/out-of-pitch positions and multiple balls block saving.
- Match-local calibration is retained only for matching source key and snapshot dimensions; camera changes require recalibration.


Published 2026-11-08. Version bb6a8c03-c909-42ca-8d48-ba97aa2e9a11. Public HTML and SHA-256 verified for main/CSS/export, PWA assets, pose model and efficientdet_lite0.tflite. TypeScript and Vite passed; 89/89 consolidated regression checks passed (test-results/scene-final-verification.json). Real model detection tested on official person fixture, not a football accuracy benchmark; physical iOS/iPadOS Safari untested for scene reconstruction.


## Visible landmarks and manual scene placement
Published and verified 2026-11-08. Version 5cc80337-d62e-481c-8898-cd40014b35fb. Main index-CZO7vf5z.js, CSS index-76ZLb_t5.css, export highlight-export-CmkM_22R.js. Public HTML and SHA-256 verified for JS/CSS/export, PWA assets and both bundled models. 95/95 regression tests passed; final TypeScript diagnostics 0. Custom landmark calibration, backward-compatible rectangular calibration, manual placement without four points, and adjacent save blockers verified. Physical iOS/iPadOS Safari not tested for this update.


## Tag entry, highlight playback/key deletion, paired manual reconstruction
- Numbered tag sections ①–⑤; direct optional player number/name entries saved with tags, including live capture.
- Selected-clip and all-clips playback controls.
- Individual drawing/effect keyframe deletion via Delete or touch button, with undo and persistent state; time-edit mode never deletes an entire overlay as fallback.
- Fixed paired video/pitch views with independently scrollable controls for phone/tablet portrait and landscape.
Published and verified 2026-11-08. Version 57ea18c5-ada7-4de7-bec4-2d4ff9bb4faa. Main index-Cvh3PFcM.js, stylesheet index-DaPAQ2Jj.css, export highlight-export-Cp-_a9MI.js. Public HTML and SHA-256 checks passed for JS/CSS/export, PWA assets and both bundled models. TypeScript noEmit exit 0; 98/98 regression checks passed (test-results/editor-followup-final-verification.json).

## 2026-11-08: mobile split workspace / home / optional teams
Published version 1d634254-11cb-4bf7-8170-1a41b9e4d825. Equal home entries for match analysis, tactics and movement analysis; optional teams with separately saved unassigned data; collapsible event selection; portrait/landscape media-menu split with independently scrolling menus and collapsed touch navigation. Consolidated regression 100/100 passed; public HTML/JS/CSS/export/PWA/models SHA-256 verified. See MOBILE_WORKSPACE_VALIDATION.md for test scope and final typecheck status.
Final TypeScript noEmit passed (exit 0); test-results/mobile-home-typecheck.json.


## 2026-11-08: pitch-first tactics workspace
Published version c147c516-126d-4bc8-b0cb-72c091f1bed8. New and saved projects automatically open the pitch across the viewport; portrait rotation; persistent playback/scrubbing/speed; editing panel overlays without shrinking the pitch; pitch-only mode hides all toolbars except a restore button. Shared tools and transport no longer overlap on phones. Final build and TypeScript passed; focused regression 4/4 passed across five desktop/phone/tablet viewport sizes, touch placement, save/reload, frame undo and optional-team workflow. Public HTML and 12 JS/CSS/export/PWA/model asset hashes verified. Real iPhone/iPad Safari hardware not tested. See PITCH_WORKSPACE_VALIDATION.md and test-results/pitch-*.json.


## 2026-11-08: MP4 source access recovery
Published version 7b3153d0-7971-40b0-bc19-9588595a04a2. Highlight export snapshots externally selected video files before WORKERFS/FileReaderSync: owned Blobs under a cumulative 128 MiB budget, streamed temporary OPFS files above it, cleanup on success/failure/cancellation. Read failures name the source and explain reselection; same-file picker reselection refreshes references; metadata checks have a timeout. Production build and TypeScript passed. 7/7 focused checks passed, including injected worker file-access failure and actual 2-second MP4 decode plus the existing 4-second edited MP4 regression. Public HTML and 12 assets verified. Real iOS/iPadOS Safari hardware not tested. See MP4_SOURCE_VALIDATION.md.


## 2026-11-08: two-workspace UI and movement entry retirement
Published version bfa11707-164c-4095-9174-ac8a3b8d09b3. Home and primary navigation focus equally on match analysis and tactics. Movement analysis has no menu/home link; implementation, legacy direct route, models and saved observations remain intact. Shared team/settings navigation, scoped saved-match/tactic resume links, optional-team hint, match search, collapsible registration, improved empty states, mobile drawer scrolling and compact small-phone toolbar. New UI text supports Japanese, English, Spanish, Portuguese and Chinese. Build and TypeScript passed. Consolidated 7/7 focused UI regressions passed; new home checked at 320/390/820/844/1440 widths, plus existing portrait/landscape media splits, full-pitch editing and legacy movement data/pose-model tests. The first new-home run had a local SPA route read timeout; test server now directly serves index for app routes as production does, and the final home run passed. Public HTML and 12 asset hashes verified. Physical iPhone/iPad Safari not tested. Evidence: test-results/two-workspace-final-verification.json, two-workspace-typecheck.json, two-workspace-public-verification.json and two-workspace-*.png.


## 2026-11-08: legal information publication
Published ef773b31-33dd-4aa4-b2de-bfb3dbd8bc48. Terms, privacy policy and commercial disclosure are standalone HTML pages under /legal/, accessible from settings and the app footer in a separate tab without requiring local database access. Owner confirmed disclosure-on-request operations for legal name/address/phone; contact GritStrategyWorks@gmail.com and official website included. Current free availability and upcoming JPY 500 total monthly conditions are explicit. No live checkout or paid restrictions activated. Vite build passed; 12 document viewport checks at 320/390/820/1440 and app settings/footer check passed. Public HTML entry and 14 asset hashes verified. Evidence: test-results/legal-verification.json, legal-mobile.png, legal-public-verification.json. No physical iOS Safari check or payment integration test was performed. Stripe sandbox connection requested; production account alone is connected.

## 2026-11-09: billing foundation published, charging disabled
Published and publicly verified version ce2ece3f-f53c-4e48-ab28-b2e0d41e14fe. Settings includes plan/account management; sandbox-only server implements OIDC/PKCE sessions, fixed JPY 500 hosted Checkout, customer portal, signed deduplicated webhooks and risk holds. Sandbox product/price/portal exist. Production configuration is BILLING_ENABLED=false / BILLING_ENV=disabled, without DB or secrets: public config confirms unavailable and auth/checkout/status/webhook routes return 503. App remains free with no paid feature gates.

Vite build passed; 13 mocked server integration tests and UI checks at 320/390/820/1440 widths passed. Public HTML and four entry asset hashes verified. Evidence: test-results/billing-server-verification.json, billing-ui-verification.json, billing-public-verification.json. Actual Stripe payment/renewal/cancellation and physical iOS Safari tests have NOT been performed. User has no authentication service yet; provider selection/connection, dedicated D1, encrypted secrets, real sandbox tests, paid feature gates, CSP/provider privacy updates and live configuration remain before billing launch. See server/SETUP.html.

## 2026-11-09: Auth0 Free provisioned
Owner explicitly approved Auth0 Free, provider terms and creation in Japan. Stripe Projects initialized for Footballanalyzer; Auth0 Free plan auth-free and client football-login created and status confirmed complete/Free. No paid plan or payment method added. Client configuration saved and checked via Projects: regular_web, authorization_code, client_secret_post, OIDC conformant, RS256 and one-hour JWT; explicit existing production and local HTTPS callback/logout/origin URLs. Local configuration script: .build-tools/configure-auth-client.cjs. Generated credentials managed by Projects; excluded from source and public assets. Actual hosted login and Stripe payment tests remain pending; no claim of live authentication or billing activation.
Auth0 issuer discovery and PKCE S256 support validated. Three OIDC variables registered through stdin into existing Worker's encrypted Secrets without printing values. Public entry hashes and disabled billing API behavior rechecked successfully after registration. Dedicated D1 and Stripe server test credentials/webhooks remain pending.

## 2026-11-09: mobile preview recovery and replay camera
Published version 28b8e375-30e5-4e67-aef5-d5c783f653d2. Highlight source URLs survive unrelated source additions/restoration; temporary missing/invalid decoded frames retain the last image without stopping rendering; bounded preview redraw/update frequency, background pause, decoder metadata cleanup and an explicit video reload action preserve editing state. User reported video disappearance on Pixel 10, not whole-browser termination. Root causes addressed in code; physical Pixel 10 reproduction remains unverified.

3D defaults to camera orbit instead of moving pieces. Explicit camera/edit modes, pitch/ball/selected-player focus, reset and existing pinch/wheel zoom support replay inspection while playing. Draw tools still switch to placement interaction. WebGL context released on teardown. TypeScript noEmit and Vite passed. Browser checks passed for source addition, injected decoder error/reload, saved edit restoration, touch orbit, playback/focus/reset and portrait/landscape/tablet controls. Two isolated resource/frame-recovery checks passed against bundled source. Vitest fork workers timed out before executing tests; no Vitest pass is claimed. Evidence: test-results/mobile-replay-verification.json, preview-core-verification.json, pixel-preview-recovery.png, replay-camera-*.png.

Billing remains disabled. Hosting subscription read returned HTTP 403/code 10000; owner confirmation of Workers Free requested before D1 provisioning to honor zero fixed-cost constraint. No plan upgrade or billing activation was performed.

## 2026-11-09: tactics board controls
Published version cadb4e0a-68ef-4f40-a3af-ed93cb8ac2fe; public entry assets verified against local hashes. Billing remains disabled.
Independent persisted 5-lane and 3-area overlays in 2D/3D. Lane boundaries extend the penalty/goal-area sidelines on the board's 100×64 coordinate pitch (12, 23, 41, 52), not equal fifths. Color/dashed controls update the selected current-frame effect and preserve other effects; updates support undo. Fullscreen frame registration copies the last frame at +5 seconds, up to 24 frames. Outside-panel pointer dismissal consumes the gesture to avoid accidental piece movement.
TypeScript noEmit, Vite build and Chromium touch/responsive checks passed: independent zone persistence, selected-effect style isolation, fullscreen frame cloning/save/reload, outside touch dismissal, 3D rendering, controls within 412×915, 915×412, 820×1180 and 1440×900 viewports. Evidence: test-results/board-controls-verification.json and board-controls-*.png. Physical phone/iPad testing not performed.
Owner confirmed Workers Free during this task. Billing remains disabled; confirmation clears the hosting-plan question for the separate subscription setup.

## 2026-11-09: pitch markings and direct replay interaction
Published version 2db396da-6b73-4fb7-800c-267d86184446.
Shared 2D/3D pitch markings include touch/goal/halfway lines, center circle/mark, penalty and goal areas, penalty marks/arcs, corner arcs and corner flags. Existing 100×64 board coordinates retained so stored player locations remain valid. Fullscreen offers 2D/3D buttons, a frame selector and interval-specific ground/lob/no-effect options (last frame disabled). Existing dribble support remains in the effects menu.
Free camera orbit uses the drag-start ground position as pivot; a separate background-pan mode and right/Shift drag translate the view without editing players. Custom camera scale adapts to viewport aspect changes. Player arrow tips support direct 2D dragging; the selected player's 3D tip has a 20px pointer/touch hit area and changes facing with undo/save support. Landscape quick controls use two columns to reduce pitch occlusion.
Final TypeScript noEmit, Vite build and Chromium checks passed. Evidence: test-results/pitch-interaction-verification.json and pitch-interaction-*.png. Checks cover shared pitch geometry, 2D/3D arrow drag/save, lob/ground interval persistence, mouse/touch custom pivot, panning without changing player positions, fullscreen switching, frame selection/last-frame guard, responsive layouts and reload. Physical Android/iPad testing not performed.

## 2026-11-09: improved 3D figures
Published version a7a17031-2003-4585-9c3a-32250be6a7ef after retrying a stalled deployment. TypeScript noEmit, final Vite build and rendering/interaction checks passed.
Replaced the simple player primitives with shaped shoulders, bent arms/knees, tapered kit, sleeve/sock trim, boots/soles, face/hair details and a jersey number linked to the number-display setting. Football now has spherical pentagonal black panels, white hexagonal regions and panel seams generated from truncated-icosahedron topology. No external model/texture downloads. Player anatomy is merged by material (9 figure meshes including jersey/crest); ball uses 3 objects. Existing root piece IDs, selection rings and facing arrows preserved.
Close-up rendering checked visually; fixture with two figures, ball and floor uses 22 draw calls and 10,240 triangles. Evidence: test-results/figure-quality-preview.png and figure-quality-verification.json. Full pitch interaction regression passed on the final build. Physical mobile GPU performance not measured.

## 2026-11-09: retain imported source videos locally
Published version f846a42a-0062-4213-9765-98d2729e038c. TypeScript noEmit passed during implementation; final Vite build and browser checks passed.
Imported match/highlight sources can be copied to a dedicated IndexedDB store, enabled by default with an opt-out checkbox. Files are materialized in bounded 4 MB chunks; metadata switches to the new copy only after all chunks succeed. Failed replacement preserves the prior copy; saves for the same source are serialized; generation checks prevent clearing data from being undone by an in-flight writer. Stale interrupted transfers are cleaned up when inspecting saved sources. Existing app recordings remain restorable without copying them again.
Highlight projects restore match and additional sources automatically and autosave source-name/size changes when replacing media. Analysis also restores saved sources. Saving status/progress, retry and capacity errors are visible. Settings lists copy sizes and permits individual copy deletion without deleting edits or original device files. Full data reset includes the new store; recording-only reset does not. JSON backup still excludes video bytes. Storage remains browser/origin-local and subject to browser clearing/eviction; physical mobile quotas/performance are unverified.
Final Vite build and browser verification passed: 9 MB multi-chunk byte-for-byte round trip, failed read rollback, ordered replacement, quota rejection, multiple source reload/playback without reselection, replacement autosave/reload, deletion preserving clips, and usable preview after capacity failure. Evidence: test-results/retained-media-verification.json and retained-media-resume.png.

## 2026-11-10: trajectory selector on first/last frames
Removed the final-frame disabled guard from the quick ball trajectory selector; busy/playback guards remain. A compact hint explains registering the next frame and moving the ball to see the transition. No extra frames are created implicitly.
Final Vite build and Chromium interaction regression passed, including selecting/saving/reloading lob on a one-frame project, retaining its setting when adding the next frame, and editing a last frame. Existing ground/lob persistence, 2D/3D facing edits, mouse/touch orbit, panning and responsive controls passed. Evidence: test-results/pitch-interaction-verification.json and trajectory-single-frame.png. Physical mobile testing not performed. This supersedes the earlier last-frame guard behavior.
TypeScript noEmit passed. Published version 29919221-a330-4d94-aaa5-a595ba6daea5; public main/CSS asset hashes verified against the tested build. Billing remains disabled.

## 2026-11-11: prevent storage notice from collapsing analysis video
Moved retained source settings from the fixed-height video panel to the independently scrollable tag menu. Analysis uses a collapsed disclosure with visible saving/saved/error status; expanding it never takes space from the video. Shared retention behavior and highlight editor defaults remain intact. Constrained analysis video to its stage and kept object-fit containment.
Final Vite build and Chromium mobile layout checks passed at 412x915, 915x412 and 820x1180: video clears the topbar, playback controls do not overlap video or tags, storage disclosure expansion and menu scrolling preserve video geometry, and saved sources restore after reload. Screenshots visually checked. Evidence: test-results/analysis-layout-verification.json and analysis-layout-*.png. Physical mobile devices not tested.
TypeScript noEmit passed. Published version d68376e7-9ae5-48f6-b3fc-36af329fc1a6; public main/CSS hashes verified against the tested build. Billing remains disabled.

## 2026-11-11: clearer team-count application on touch devices
Reproduced the reported 05/05 input on the preceding release: saved player counts already changed to 5/5, but the inspector stayed over the pitch and there was no applied-count feedback. Replaced numeric text fields with explicitly labelled 0–22 player selects. Applying closes the fullscreen inspector and reports the applied home/away counts; inspector shows current applied counts independently of pending inputs. Busy export blocks the controls. Existing identities/positions and all-frame resize behavior retained.
Final Vite build and Chromium touch regression passed: 5/5, 8/5, 0/0, 22/22, undo, all-frame counts, retained player identity, 3D resizing, saving/reloading, and inspector dismissal. Evidence: test-results/team-count-verification.json and team-count-mobile.png. Physical-device testing not performed.
TypeScript noEmit passed. Published version 3df673b9-5985-4d05-95dd-6826a2b25439; public main/CSS hashes verified against the tested build. Billing remains disabled.
