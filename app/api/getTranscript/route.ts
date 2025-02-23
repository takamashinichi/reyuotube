import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { YoutubeTranscript } from 'youtube-transcript';
import { TranslationServiceClient } from '@google-cloud/translate';

// 環境変数からAPI Keyを取得
const API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const GOOGLE_CLOUD_LOCATION = 'global';

// 翻訳クライアントの初期化
const translationClient = new TranslationServiceClient();

// テキストを翻訳する関数
async function translateText(text: string): Promise<string> {
  try {
    const projectId = GOOGLE_CLOUD_PROJECT_ID;
    const location = GOOGLE_CLOUD_LOCATION;
    
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode: 'ja',
    };

    const [response] = await translationClient.translateText(request);
    return response.translations?.[0]?.translatedText || text;
  } catch (error) {
    console.error('翻訳エラー:', error);
    return text; // エラーの場合は原文を返す
  }
}

// 字幕アイテムをテキストに変換する関数
function formatTranscriptToText(items: any[]): string {
  return items
    .map(item => {
      const timeCode = formatTimeForDisplay(item.offset);
      return `[${timeCode}] ${item.text}`;
    })
    .join('\n\n');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "動画IDが指定されていません。" }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json({ error: "YouTube APIキーが設定されていません。" }, { status: 500 });
    }

    // YouTube Data APIのセットアップ
    const youtube = google.youtube({
      version: "v3",
      auth: API_KEY
    });

    try {
      // 動画の存在確認と詳細情報の取得
      const videoResponse = await youtube.videos.list({
        part: ["snippet"],
        id: [videoId]
      });

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        return NextResponse.json({ error: "指定された動画が見つかりませんでした。" }, { status: 404 });
      }

      // 動画タイトルと情報を取得
      const videoTitle = videoResponse.data.items[0].snippet?.title || videoId;
      const videoDescription = videoResponse.data.items[0].snippet?.description || '';
      const safeTitle = videoTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');

      // 字幕を取得（まず日本語で試行）
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'ja'
        });

        // テキストコンテンツを生成
        const textContent = [
          `タイトル: ${videoTitle}`,
          `URL: https://www.youtube.com/watch?v=${videoId}`,
          '',
          '=== 字幕テキスト ===',
          '',
          formatTranscriptToText(transcriptItems)
        ].join('\n');

        // レスポンスを返す
        return new NextResponse(textContent, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${safeTitle}.txt"`,
          },
        });
      } catch (jaError) {
        // 日本語字幕が取得できない場合、英語で取得して翻訳
        try {
          const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'en'
          });

          // 各字幕テキストを翻訳
          const translatedItems = await Promise.all(
            transcriptItems.map(async (item) => ({
              ...item,
              text: await translateText(item.text)
            }))
          );

          // テキストコンテンツを生成
          const textContent = [
            `タイトル: ${videoTitle}`,
            `URL: https://www.youtube.com/watch?v=${videoId}`,
            '',
            '=== 翻訳済み字幕テキスト ===',
            '',
            formatTranscriptToText(translatedItems)
          ].join('\n');

          // レスポンスを返す
          return new NextResponse(textContent, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Content-Disposition": `attachment; filename="${safeTitle}_translated.txt"`,
            },
          });
        } catch (enError) {
          return NextResponse.json({ 
            error: "この動画の字幕を取得できませんでした。",
            videoTitle: videoTitle
          }, { status: 404 });
        }
      }
    } catch (apiError: any) {
      console.error("YouTube API エラー:", apiError);
      return NextResponse.json({ 
        error: "字幕の取得中にエラーが発生しました。",
        details: apiError.message,
        videoTitle: videoId
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("字幕取得エラー:", error);
    return NextResponse.json({ 
      error: "予期せぬエラーが発生しました。",
      details: error.message 
    }, { status: 500 });
  }
}

// 表示用の時間フォーマット（MM:SS）
function formatTimeForDisplay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
} 