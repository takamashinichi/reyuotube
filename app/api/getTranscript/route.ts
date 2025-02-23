import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { YoutubeTranscript } from 'youtube-transcript';

// 環境変数からAPI Keyを取得
const API_KEY = process.env.YOUTUBE_API_KEY;

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

      // 動画タイトルを取得
      const videoTitle = videoResponse.data.items[0].snippet?.title || videoId;
      const safeTitle = videoTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');

      // 字幕を取得（まず日本語で試行）
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'ja'
        });

        // 字幕テキストをSRT形式に変換
        const srtContent = transcriptItems
          .map((item, index) => {
            const startTime = formatTime(item.offset);
            const endTime = formatTime(item.offset + item.duration);
            return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`;
          })
          .join('\n');

        // レスポンスを返す
        return new NextResponse(srtContent, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${safeTitle}_transcript.srt"`,
          },
        });
      } catch (jaError) {
        // 日本語字幕が取得できない場合、英語で試行
        try {
          const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'en'
          });

          // 字幕テキストをSRT形式に変換
          const srtContent = transcriptItems
            .map((item, index) => {
              const startTime = formatTime(item.offset);
              const endTime = formatTime(item.offset + item.duration);
              return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`;
            })
            .join('\n');

          // レスポンスを返す
          return new NextResponse(srtContent, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Content-Disposition": `attachment; filename="${safeTitle}_transcript.srt"`,
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

// ミリ秒をSRT形式の時間文字列に変換する関数
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10); // 2桁の精度に変換

  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 2)}0`;
} 