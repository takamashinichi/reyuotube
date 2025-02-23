"use client";

import React, { useState } from "react";

// 動画URLから動画IDを抽出する関数
const extractVideoId = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/v\/|\/e\/|watch\?v=)([^&?#]+)/);
  return match ? match[1] : null;
};

// 台本フォーマットの選択肢
const scriptFormats = [
  { value: 'opening', label: 'オープニングナレーション',
    description: 'CTRを高める魅力的な導入ナレーション。視聴者の興味を引き、エンゲージメントを促進。' },
  { value: 'ending', label: 'エンディングナレーション',
    description: '次回予告とエンゲージメントを促すエンディング。視聴者の継続的な関心を維持。' },
  { value: 'full', label: '完全版台本', 
    description: '9つのセクションで構成された詳細な台本。タイムスタンプ付きで、導入から結論まで完全な構成を提供。' },
  { value: 'hiroshi', label: 'ひろし式（7つのプロンプト）',
    description: '目的、フック、問題提起、解決策、具体例、アクション、まとめの7つのセグメントで構成。' },
  { value: 'default', label: '標準フォーマット',
    description: 'シンプルな字幕テキスト形式。基本的な内容を時系列で表示。' },
  { value: 'youtube', label: 'YouTube動画向け',
    description: 'タイムコード付きの台本形式。動画編集時に便利。' },
  { value: 'movie', label: '映画の台本風',
    description: 'シーン番号付きの映画脚本形式。ドラマチックな展開を重視。' },
  { value: 'narration', label: 'ナレーション用',
    description: '時間表示付きのナレーション台本。音声収録時に最適。' },
];

// ひろし式プロンプトの説明
const hiroshiPromptDescriptions = [
  { title: '目的', description: '視聴者に価値を提供し、エンゲージメントを高める' },
  { title: 'フック', description: '視聴者の興味を引く導入' },
  { title: '問題提起', description: '視聴者が抱える課題や悩み' },
  { title: '解決策', description: '具体的な方法や手順' },
  { title: '具体例', description: '実践的な例示や事例' },
  { title: 'アクション', description: '視聴者が取るべき次のステップ' },
  { title: 'まとめ', description: '重要ポイントの復習' },
];

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("default");
  const [preview, setPreview] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async (type: 'transcript' | 'script', shouldDownload: boolean = false) => {
    setError("");
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError("有効なYouTube動画のURLを入力してください。");
      return;
    }
    setLoading(true);
    try {
      let response;
      if (type === 'transcript') {
        response = await fetch(`/api/getTranscript?videoId=${videoId}`);
      } else {
        response = await fetch('/api/generateScript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId,
            format: selectedFormat,
          }),
        });
      }

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "データの取得に失敗しました。");
      }

      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "データの取得に失敗しました。");
      }

      const blob = await response.blob();
      const text = await blob.text();
      setPreview(text);

      if (shouldDownload) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = type === 'transcript' 
          ? `transcript_${videoId}.srt`
          : `script_${videoId}_${selectedFormat}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setShowPreview(true);
      }
    } catch (error: any) {
      setError(error.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">YouTube字幕ツール</h1>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
                YouTube動画のURL
              </label>
              <input
                id="videoUrl"
                type="text"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                台本フォーマット
              </label>
              <select
                id="format"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                {scriptFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {scriptFormats.find(f => f.value === selectedFormat)?.description}
              </p>
            </div>

            {selectedFormat === 'hiroshi' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 mb-2">ひろし式7つのプロンプト</h3>
                <div className="space-y-2">
                  {hiroshiPromptDescriptions.map((prompt, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-blue-700">{prompt.title}：</span>
                      <span className="text-blue-600">{prompt.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFormat === 'full' && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <h3 className="text-sm font-medium text-green-800 mb-2">完全版台本の特徴</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 9つのセクションで構成された包括的な台本</li>
                  <li>• 各セクションにタイムスタンプと継続時間を表示</li>
                  <li>• 論理的な構成と分析に基づいた内容</li>
                  <li>• 視聴者の興味を引く展開構成</li>
                  <li>• 具体的なアクションプランを含む</li>
                </ul>
              </div>
            )}

            {selectedFormat === 'opening' && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">オープニングナレーションの特徴</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• マズローの欲求段階（生存と安全）に訴求</li>
                  <li>• バターナッツフレームワークを活用</li>
                  <li>• キャッチーな導入で視聴者の興味を引く</li>
                  <li>• 緊張感と緊急性を効果的に演出</li>
                  <li>• エンゲージメント促進（チャンネル登録、高評価、コメント）</li>
                </ul>
              </div>
            )}

            {selectedFormat === 'ending' && (
              <div className="mt-4 p-4 bg-purple-50 rounded-md">
                <h3 className="text-sm font-medium text-purple-800 mb-2">エンディングナレーションの特徴</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• 生存と安全の欲求に訴求</li>
                  <li>• 次回予告による継続視聴の促進</li>
                  <li>• 視聴者参加の促進（コメント、高評価）</li>
                  <li>• チャンネル登録への誘導</li>
                  <li>• 希望を持たせる締めくくり</li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleGenerate('transcript', true)}
                className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={loading || !videoUrl.trim()}
              >
                {loading ? "取得中..." : "字幕をダウンロード"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGenerate('script', false)}
                  className="bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                  disabled={loading || !videoUrl.trim()}
                >
                  {loading ? "生成中..." : "プレビュー"}
                </button>
                <button
                  onClick={() => handleGenerate('script', true)}
                  className="bg-purple-500 text-white p-3 rounded-md hover:bg-purple-600 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
                  disabled={loading || !videoUrl.trim()}
                >
                  {loading ? "生成中..." : "ダウンロード"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* プレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">台本プレビュー</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {preview}
              </pre>
            </div>
            <div className="p-4 border-t flex justify-end gap-4">
              <button
                onClick={() => handleGenerate('script', true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                ダウンロード
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 