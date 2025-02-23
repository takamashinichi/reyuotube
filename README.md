# YouTube字幕ダウンローダー

YouTube動画の字幕をダウンロードできるWebアプリケーションです。

## 機能

- YouTube動画のURLから字幕をダウンロード
- 日本語字幕の優先的な取得（利用可能な場合）
- 簡単な操作で字幕ファイルを取得
- モダンなUIデザイン

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. YouTube API Keyの取得:
   1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   2. プロジェクトを作成（または既存のプロジェクトを選択）
   3. YouTube Data API v3を有効化
   4. 認証情報 > APIキーを作成
   5. 必要に応じてAPIキーの制限を設定（推奨）
      - アプリケーション制限: HTTPリファラー
      - APIの制限: YouTube Data API v3

3. 環境変数の設定:
   - `.env.local.example`を`.env.local`にコピー
   - 取得したAPI Keyを`YOUTUBE_API_KEY`に設定

4. 開発サーバーの起動:
```bash
npm run dev
```

## 使用方法

1. アプリケーションにアクセス（デフォルト: http://localhost:3000）
2. YouTube動画のURLを入力
3. 「字幕をダウンロード」ボタンをクリック
4. 字幕ファイルが自動的にダウンロードされます

## 技術スタック

- Next.js
- React
- TypeScript
- Tailwind CSS
- YouTube Data API v3

## 注意事項

- YouTube APIの利用制限に注意してください（1日のクォータ制限があります）
- 字幕が利用可能な動画のみダウンロードできます
- 自動生成字幕は取得できない場合があります 