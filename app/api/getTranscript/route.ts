import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { YoutubeTranscript } from 'youtube-transcript';
import { TranslationServiceClient } from '@google-cloud/translate';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';

// 環境変数からAPI Keyを取得
const API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const GOOGLE_CLOUD_LOCATION = 'global';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// AIクライアントの初期化
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
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
    return text;
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

// Geminiを使用して台本を生成する関数
async function generateScriptWithGemini(text: string, videoTitle: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
以下の字幕テキストから、魅力的な台本を作成してください。
動画タイトル: ${videoTitle}

字幕テキスト:
${text}

以下の要素を含めて台本を構成してください：
1. 導入部（視聴者の興味を引く開始）
2. 本編（内容を論理的に展開）
3. まとめ（重要ポイントの復習）
4. コールトゥアクション（視聴者への呼びかけ）

台本は読みやすく、自然な日本語で書いてください。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini生成エラー:', error);
    throw error;
  }
}

// GPTを使用して台本を生成する関数
async function generateScriptWithGPT(text: string, videoTitle: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "あなたはプロの動画台本作成者です。魅力的で視聴者を引き付ける台本を作成してください。"
        },
        {
          role: "user",
          content: `
以下の字幕テキストから、魅力的な台本を作成してください。
動画タイトル: ${videoTitle}

字幕テキスト:
${text}

以下の要素を含めて台本を構成してください：
1. 導入部（視聴者の興味を引く開始）
2. 本編（内容を論理的に展開）
3. まとめ（重要ポイントの復習）
4. コールトゥアクション（視聴者への呼びかけ）

台本は読みやすく、自然な日本語で書いてください。`
        }
      ]
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('GPT生成エラー:', error);
    throw error;
  }
}

// Cloud AIを使用して台本を生成する関数
async function generateScriptWithCloudAI(text: string, videoTitle: string): Promise<string> {
  try {
    const projectId = GOOGLE_CLOUD_PROJECT_ID;
    const location = GOOGLE_CLOUD_LOCATION;
    
    const prompt = `
以下の字幕テキストから、魅力的な台本を作成してください。
動画タイトル: ${videoTitle}

字幕テキスト:
${text}

以下の要素を含めて台本を構成してください：
1. 導入部（視聴者の興味を引く開始）
2. 本編（内容を論理的に展開）
3. まとめ（重要ポイントの復習）
4. コールトゥアクション（視聴者への呼びかけ）

台本は読みやすく、自然な日本語で書いてください。`;

    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [prompt],
      mimeType: 'text/plain',
      sourceLanguageCode: 'ja',
      targetLanguageCode: 'ja',
    };

    const [response] = await translationClient.translateText(request);
    return response.translations?.[0]?.translatedText || text;
  } catch (error) {
    console.error('Cloud AI生成エラー:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const aiType = searchParams.get("ai") || "none"; // AI種類の取得

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

        // 基本テキストを生成
        const baseText = formatTranscriptToText(transcriptItems);

        // AIタイプに応じて台本を生成
        let scriptContent = '';
        if (aiType === 'gemini') {
          scriptContent = await generateScriptWithGemini(baseText, videoTitle);
        } else if (aiType === 'gpt') {
          scriptContent = await generateScriptWithGPT(baseText, videoTitle);
        } else if (aiType === 'cloud') {
          scriptContent = await generateScriptWithCloudAI(baseText, videoTitle);
        } else {
          scriptContent = baseText;
        }

        // テキストコンテンツを生成
        const textContent = [
          `タイトル: ${videoTitle}`,
          `URL: https://www.youtube.com/watch?v=${videoId}`,
          '',
          `=== ${aiType !== 'none' ? 'AI生成台本' : '字幕テキスト'} ===`,
          '',
          scriptContent
        ].join('\n');

        // レスポンスを返す
        return new NextResponse(textContent, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${safeTitle}${aiType !== 'none' ? '_' + aiType : ''}.txt"`,
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

          // 基本テキストを生成
          const baseText = formatTranscriptToText(translatedItems);

          // AIタイプに応じて台本を生成
          let scriptContent = '';
          if (aiType === 'gemini') {
            scriptContent = await generateScriptWithGemini(baseText, videoTitle);
          } else if (aiType === 'gpt') {
            scriptContent = await generateScriptWithGPT(baseText, videoTitle);
          } else if (aiType === 'cloud') {
            scriptContent = await generateScriptWithCloudAI(baseText, videoTitle);
          } else {
            scriptContent = baseText;
          }

          // テキストコンテンツを生成
          const textContent = [
            `タイトル: ${videoTitle}`,
            `URL: https://www.youtube.com/watch?v=${videoId}`,
            '',
            `=== ${aiType !== 'none' ? 'AI生成台本（翻訳済み）' : '翻訳済み字幕テキスト'} ===`,
            '',
            scriptContent
          ].join('\n');

          // レスポンスを返す
          return new NextResponse(textContent, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Content-Disposition": `attachment; filename="${safeTitle}_translated${aiType !== 'none' ? '_' + aiType : ''}.txt"`,
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