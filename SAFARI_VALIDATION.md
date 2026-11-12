# Safari系エンジンの検証範囲

この環境はWindowsです。iPhone・iPad実機、iOSシミュレーター、Apple Safariアプリには接続していません。Playwright WebKitの検証結果を、実機Safariの合格とは扱いません。

- WebKit 27.2：iPhone相当390×844／844×390、iPad相当820×1180／1180×820。端末プリセット、タッチtap、マウスポインタのドラッグ、IndexedDB保存、再読込、永続ブラウザープロファイルの再起動。
- Chrome補助検証：ネイティブの複数タッチ入力、移動、タッチキャンセル、通常描画・タイムライン操作。
- pagehideは検証コードから発火。実機でのOSによる強制終了やストレージ削除は再現していません。
- 実機で残る確認：Safariとホーム画面アプリでテロップを指で移動／時間帯の端と記録点をドラッグし、保存済みを確認後に再起動。編集直後のアプリ切替、画面回転、2本指やスクロールとの競合、ソフトウェアキーボード表示中の操作。

参考：[PlaywrightのWebKitとSafariの違い](https://playwright.dev/docs/browsers)。

## 結果

WebKit4条件成功（再読込／再起動後の表示待ちで初回2条件がタイムアウトし、個別再実行で成功）。通常の800ms自動保存タイマーを検証側で停止し、pagehideだけで編集が保存されることも確認しました。修正前公開版は同条件で未保存でした。Chromium補助検証73件成功。結果は test-results/webkit-final.json と test-results/highlight-verification.json。

修正内容：画面非表示／pagehide時に保存を開始。未保存フラグをReactの再描画より先に更新し、入力直後でも最新内容を保存。操作開始した指だけでドラッグを処理し、指の追加による誤移動を防止。pointercancel／lostpointercapture時は編集を復元。
