# ライセンスとアセット

アプリの画面・ピッチ描画・選手プリミティブ・アイコンファイルは本プロジェクトで作成。第三者の試合映像や有料素材は同梱しません。

主要依存ライブラリ（実際の配布条件の正本はnode_modules内の各LICENSE）：

| ソフトウェア | ライセンス | 用途 |
|---|---|---|
| React / React DOM | MIT | UI |
| Vite | MIT | 開発・ビルド |
| TypeScript | Apache-2.0 | 型検査 |
| Dexie | Apache-2.0 | IndexedDB |
| Three.js | MIT | 3D描画 |
| Lucide React | ISC | UIアイコン |
| Zod | MIT | スキーマ検証 |
| MediaPipe tasks-vision | Apache-2.0 | 端末内推論エンジン |
| Vitest | MIT | 単体テスト |
| Playwright | Apache-2.0 | ブラウザーテスト |
| ESLint | MIT | 静的検証 |
| typescript-eslint | MIT | TypeScript用静的検証 |
| Wrangler | MIT / Apache-2.0（パッケージのLICENSEを参照） | Cloudflareデプロイ |

Pose Landmarkerの学習済みモデルは同梱しません。利用者が取得するモデルの配布条件を別途確認してください。利用者が読み込む動画の権利と撮影同意は利用者が管理します。

依存パッケージのライセンスは `scripts/copy-assets.mjs` によって公開ビルドの `licenses/` に複写します。

## 動画変換エンジン
- @ffmpeg/ffmpeg: MIT、https://github.com/ffmpegwasm/ffmpeg.wasm
- @ffmpeg/core 0.12.10: GPL-2.0-or-later。改変なしのWebAssemblyを配信。配信サイズ制限に対応するため2分割し、実行時に元のバイト列へ復元します。
- エンジンのソースコード・ビルド手順・構成ライブラリー: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/n0.12.10
- FFmpegとx264を含む構成ライブラリーのライセンスが適用されます。
