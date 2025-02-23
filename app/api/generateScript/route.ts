import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from 'youtube-transcript';

// 要約フォーマットの定義
interface ProphecySummary {
  prophet: {
    name: string;
    origin: string;
    occupation: string;
    activities: string[];
    characteristics: string[];
    achievements: string[];
  };
  predictions: {
    disasters?: {
      timing: string;
      location: string;
      details: string[];
    };
    terrorism?: {
      details: string[];
    };
    pandemic?: {
      details: string[];
    };
    economic?: {
      details: string[];
    };
    japan?: {
      details: string[];
    };
  };
  characteristics: string[];
  details: string[];
}

// チャンネルプロファイルの定義
const channelProfile = {
  theme: {
    genres: ["都市伝説", "予言", "雑学", "スピリチュアル", "怪談"],
    concept: "知的好奇心を刺激するエンタメ",
    direction: "ミステリアスな話題の深掘りと知識としての価値提供"
  },
  goals: {
    short: "チャンネル登録者1000人、収益化達成",
    medium: "収益の安定化、ファンの獲得",
    long: "都市伝説ジャンルでの影響力拡大、ブランディング強化"
  },
  content: {
    types: [
      {
        name: "未来予測・予言",
        description: "近い未来に起こる可能性のある出来事や陰謀論を深掘り"
      },
      {
        name: "歴史・スピリチュアル",
        description: "過去の出来事とスピリチュアルな要素を絡めた解説"
      },
      {
        name: "考察系都市伝説",
        description: "論理的な裏付けと共に都市伝説を検証"
      },
      {
        name: "怪談",
        description: "日本や海外の怖い話、体験談の紹介"
      }
    ]
  },
  branding: {
    atmosphere: "落ち着いたナレーション、論理的な考察スタイル",
    color: "ダークトーン（黒・紫・青系）、ミステリアスな雰囲気",
    visual: "伝説の書物、謎めいたシンボル、影や霧の演出"
  },
  strengths: [
    "論理的な考察と裏付けのある解説",
    "高い視聴維持率を実現する構成",
    "エンタメと情報のバランス"
  ]
};

// 視聴者の本質的欲求の定義
const essentialDesires = {
  curiosityAndExploration: {
    name: "好奇心と探求心",
    elements: [
      "未来の予測と社会情勢",
      "ロジカルな都市伝説の分析",
      "歴史とスピリチュアルの融合"
    ]
  },
  socialConnection: {
    name: "社会的つながり",
    elements: [
      "家族や友人との会話のネタ",
      "じっくりとした視聴体験",
      "コミュニティでの共有"
    ]
  },
  anxietyRelief: {
    name: "恐怖と不安の解消",
    elements: [
      "未来への準備と対策",
      "スリリングな体験による発散",
      "不確実性への対処"
    ]
  },
  entertainment: {
    name: "エンターテインメント要素",
    elements: [
      "6分以上の深い考察",
      "論理的な構成と分析",
      "落ち着いた解説スタイル"
    ]
  }
};

// 視聴者のターゲット層の定義
const targetAudience = {
  ageGroup: {
    main: "35～54歳",
    core: "45～54歳",
    description: "社会的関心が強い層"
  },
  occupation: [
    "会社員（管理職・専門職）",
    "自営業",
    "フリーランス"
  ],
  lifestyle: {
    interests: [
      "未来予測",
      "歴史",
      "スピリチュアル・オカルト"
    ],
    viewingHabits: [
      "夜の時間帯にリラックスしながら視聴",
      "動画をじっくり見る傾向",
      "身近な人との話題に使用"
    ]
  }
};

// ひろし式プロンプトの定義
const hiroshiPrompts = {
  purpose: "目的：視聴者に価値を提供し、エンゲージメントを高める",
  hook: "フック：視聴者の興味を引く導入",
  problem: "問題提起：視聴者が抱える課題や悩み",
  solution: "解決策：具体的な方法や手順",
  example: "具体例：実践的な例示や事例",
  action: "アクション：視聴者が取るべき次のステップ",
  summary: "まとめ：重要ポイントの復習"
};

// タイトル生成のための型定義
interface TitleComponents {
  keywords: string[];
  emotions: string[];
  numbers: string[];
  hooks: string[];
}

// タイトル生成のための要素
const titleElements: TitleComponents = {
  keywords: [
    "都市伝説",
    "予言",
    "未来",
    "スピリチュアル",
    "陰謀論",
    "歴史的真実",
    "謎",
    "驚愕"
  ],
  emotions: [
    "衝撃",
    "驚き",
    "恐怖",
    "戦慄",
    "緊急",
    "緊迫",
    "注目"
  ],
  numbers: [
    "7つの",
    "3つの",
    "5つの",
    "唯一の",
    "初めての"
  ],
  hooks: [
    "ついに判明",
    "誰も知らない",
    "暴露",
    "緊急警告",
    "極秘情報"
  ]
};

// チャンネルプロファイルを考慮したコンテンツ生成関数
function applyChannelStyle(content: string, format: string): string {
  let styledContent = content;
  
  // チャンネルの特徴を反映したヘッダーを追加
  const header = `=== ${channelProfile.theme.concept} ===\n\n`;
  
  // コンテンツタイプに基づく装飾
  const contentType = channelProfile.content.types.find(type => 
    content.toLowerCase().includes(type.name.toLowerCase())
  );
  
  if (contentType) {
    styledContent = `${header}【${contentType.name}】\n${contentType.description}\n\n${styledContent}`;
  } else {
    styledContent = `${header}${styledContent}`;
  }
  
  // ブランディング要素の追加
  styledContent += `\n\n---\n${channelProfile.branding.atmosphere}\n`;
  
  return styledContent;
}

// 本質的欲求を満たすコンテンツ生成関数
function enrichContentWithDesires(content: string, format: string): string {
  let enrichedContent = content;
  const desires = Object.values(essentialDesires);
  
  // フォーマットに応じて適切な欲求要素を追加
  if (format === 'hiroshi') {
    enrichedContent = `【視聴者の期待に応える重要ポイント】\n`;
    desires.forEach(desire => {
      enrichedContent += `\n${desire.name}:\n`;
      desire.elements.forEach(element => {
        enrichedContent += `・${element}\n`;
      });
    });
    enrichedContent += `\n---\n\n${content}`;
  }
  
  // 論理的な構成を強調
  enrichedContent += "\n\n※このコンテンツは、視聴者の知的好奇心を満たすため、論理的な考察と分析に基づいて構成されています。";
  
  return enrichedContent;
}

// スクリプト生成時にターゲット層の特性を考慮する関数
function adaptContentToTarget(content: string): string {
  // ターゲット層に合わせてコンテンツを調整
  let adaptedContent = content;
  
  // じっくり視聴する傾向を考慮して、詳細な説明を追加
  adaptedContent = `[視聴者層: ${targetAudience.ageGroup.main}向けコンテンツ]\n\n${adaptedContent}`;
  
  // 社会的関心の高さを考慮した文脈付け
  adaptedContent += "\n\n※この情報は、社会的な影響を考慮して慎重に検証されています。";
  
  return adaptedContent;
}

// 要約生成関数
function generateSummary(transcriptItems: any[]): ProphecySummary {
  // テキストを結合して全体の内容を取得
  const fullText = transcriptItems.map(item => item.text).join(' ');
  
  // 予言者情報を抽出（仮のロジック）
  const prophetInfo = extractProphetInfo(fullText);
  
  // 予言内容を抽出（仮のロジック）
  const predictions = extractPredictions(fullText);
  
  // 特徴と詳細を抽出（仮のロジック）
  const characteristics = extractCharacteristics(fullText);
  const details = extractDetails(fullText);
  
  return {
    prophet: prophetInfo,
    predictions: predictions,
    characteristics: characteristics,
    details: details
  };
}

// 予言者情報を抽出する関数
function extractProphetInfo(text: string) {
  return {
    name: "不明", // テキストから名前を抽出するロジックを実装
    origin: "不明", // 出身を抽出
    occupation: "予言者",
    activities: ["動画配信", "予言活動"],
    characteristics: ["霊的な啓示を受ける", "未来を予知する能力"],
    achievements: ["過去の予言的中事例を分析"]
  };
}

// 予言内容を抽出する関数
function extractPredictions(text: string) {
  return {
    disasters: {
      timing: "近い将来",
      location: "複数の地域",
      details: ["自然災害の可能性", "環境変化の影響"]
    },
    terrorism: {
      details: ["社会的な混乱の可能性", "セキュリティ上の課題"]
    },
    pandemic: {
      details: ["健康に関する警告", "新たな健康課題の出現"]
    },
    economic: {
      details: ["経済システムの変化", "社会構造の変革"]
    },
    japan: {
      details: ["日本固有の課題", "社会システムの変化"]
    }
  };
}

// 特徴を抽出する関数
function extractCharacteristics(text: string) {
  return [
    "具体的な時期や場所への言及",
    "科学的な考察との組み合わせ",
    "予防や対策の提案を含む"
  ];
}

// 詳細を抽出する関数
function extractDetails(text: string) {
  return [
    "予言の背景となる歴史的文脈",
    "現代社会との関連性",
    "対策や準備の方法"
  ];
}

// 要約をフォーマットする関数
function formatSummary(summary: ProphecySummary): string {
  let formattedSummary = "予言・都市伝説まとめ\n\n";
  
  // 1. 予言者・情報源のプロフィール
  formattedSummary += "1. 予言者・情報源のプロフィールと特徴\n";
  formattedSummary += `・名前：${summary.prophet.name}\n`;
  formattedSummary += `・出身：${summary.prophet.origin}\n`;
  formattedSummary += `・職業・肩書：${summary.prophet.occupation}\n`;
  formattedSummary += `・活動：${summary.prophet.activities.join('、')}\n`;
  formattedSummary += `・特徴：${summary.prophet.characteristics.join('、')}\n`;
  formattedSummary += `・実績：${summary.prophet.achievements.join('、')}\n\n`;
  
  // 2. 主要な予言・都市伝説
  formattedSummary += "2. 主要な予言・都市伝説\n";
  if (summary.predictions.disasters) {
    formattedSummary += "1) 大規模災害\n";
    formattedSummary += `・時期：${summary.predictions.disasters.timing}\n`;
    formattedSummary += `・場所：${summary.predictions.disasters.location}\n`;
    formattedSummary += "・内容：\n";
    summary.predictions.disasters.details.forEach(detail => {
      formattedSummary += `  ・${detail}\n`;
    });
  }
  
  // 3. 予言・都市伝説の特徴
  formattedSummary += "\n3. 予言・都市伝説の特徴\n";
  summary.characteristics.forEach(char => {
    formattedSummary += `・${char}\n`;
  });
  
  // 4. 詳細の解説
  formattedSummary += "\n4. 詳細の解説\n";
  summary.details.forEach(detail => {
    formattedSummary += `・${detail}\n`;
  });
  
  return formattedSummary;
}

// タイトル生成関数
function generateTitle(summary: ProphecySummary): string {
  // 予言の内容から重要なキーワードを抽出
  const contentKeywords = extractKeywords(summary);
  
  // タイトルのパターンを選択
  const pattern = selectTitlePattern();
  
  // パターンに基づいてタイトルを生成
  const title = constructTitle(pattern, contentKeywords);
  
  return title;
}

// キーワード抽出関数
function extractKeywords(summary: ProphecySummary): string[] {
  const keywords: string[] = [];
  
  // 予言者情報からキーワード抽出
  if (summary.prophet.name !== "不明") {
    keywords.push(summary.prophet.name);
  }
  
  // 予言内容からキーワード抽出
  if (summary.predictions.disasters) {
    keywords.push(summary.predictions.disasters.timing);
    keywords.push(summary.predictions.disasters.location);
  }
  
  // 特徴からキーワード抽出
  keywords.push(...summary.characteristics.slice(0, 2));
  
  return keywords;
}

// タイトルパターン選択関数
function selectTitlePattern(): string {
  const patterns = [
    "【{emotion}】{keyword}が{hook}！{number}真実",
    "【緊急】{keyword}で{hook}...{emotion}の{number}証拠",
    "{emotion}！{keyword}の{hook}...{number}真実が暴露",
    "【{number}】{keyword}の{hook}！{emotion}の展開に",
    "{keyword}【{emotion}】{hook}の{number}真実"
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// タイトル構築関数
function constructTitle(pattern: string, contentKeywords: string[]): string {
  let title = pattern;
  
  // パターンの各要素を置換
  title = title.replace('{emotion}', titleElements.emotions[Math.floor(Math.random() * titleElements.emotions.length)]);
  title = title.replace('{keyword}', contentKeywords[0] || titleElements.keywords[Math.floor(Math.random() * titleElements.keywords.length)]);
  title = title.replace('{hook}', titleElements.hooks[Math.floor(Math.random() * titleElements.hooks.length)]);
  title = title.replace('{number}', titleElements.numbers[Math.floor(Math.random() * titleElements.numbers.length)]);
  
  // タイトルの長さを40文字以内に調整
  if (title.length > 40) {
    title = title.substring(0, 37) + '...';
  }
  
  return title;
}

// アウトラインセクションの型定義
interface OutlineSection {
  title: string;
  subsections: {
    title: string;
    content: string;
  }[];
}

// アウトライン生成のための型定義
interface ScriptOutline {
  sections: OutlineSection[];
}

// アウトライン生成関数
function generateOutline(summary: ProphecySummary, title: string): ScriptOutline {
  // 視聴者の興味を引くセクションタイトルを生成
  const sections: OutlineSection[] = [
    {
      title: "『謎の予言者の出現』",
      subsections: [
        {
          title: "【衝撃の第一発見】",
          content: `予言者${summary.prophet.name}の突然の登場と、その背景にある${summary.prophet.characteristics[0]}`
        },
        {
          title: "【信憑性の証明】",
          content: `${summary.prophet.achievements.join('、')}による予言の裏付け`
        }
      ]
    },
    {
      title: "『歴史的な予言の連鎖』",
      subsections: [
        {
          title: "【過去の的中例】",
          content: "これまでの予言が示した驚くべき正確性"
        },
        {
          title: "【現代との関連性】",
          content: "現代社会に対する重要な示唆"
        }
      ]
    },
    {
      title: "『迫り来る危機の正体』",
      subsections: [
        {
          title: "【警告の本質】",
          content: summary.predictions.disasters ? summary.predictions.disasters.details.join('、') : "未知の危機の可能性"
        },
        {
          title: "【影響の範囲】",
          content: `${summary.predictions.disasters?.location}における具体的な影響`
        }
      ]
    },
    {
      title: "『科学的な検証結果』",
      subsections: [
        {
          title: "【データ分析】",
          content: "予言の科学的根拠と検証プロセス"
        },
        {
          title: "【専門家の見解】",
          content: "各分野の専門家による考察"
        }
      ]
    },
    {
      title: "『日本への具体的影響』",
      subsections: [
        {
          title: "【国内の変化】",
          content: summary.predictions.japan ? summary.predictions.japan.details.join('、') : "予測される国内の変動"
        },
        {
          title: "【対策の方向性】",
          content: "取るべき具体的な準備と対応"
        }
      ]
    },
    {
      title: "『世界規模の展開シナリオ』",
      subsections: [
        {
          title: "【連鎖的影響】",
          content: "グローバルな影響の連鎖的な広がり"
        },
        {
          title: "【時系列予測】",
          content: `${summary.predictions.disasters?.timing}から始まる変化の過程`
        }
      ]
    },
    {
      title: "『意外な真実の発覚』",
      subsections: [
        {
          title: "【隠された事実】",
          content: "これまで明かされなかった重要な発見"
        },
        {
          title: "【新たな視点】",
          content: "従来の解釈を覆す新しい考察"
        }
      ]
    },
    {
      title: "『具体的な対処法』",
      subsections: [
        {
          title: "【個人レベル】",
          content: "個人で実践できる具体的な対策"
        },
        {
          title: "【社会レベル】",
          content: "社会全体で取り組むべき方向性"
        }
      ]
    },
    {
      title: "『希望への道筋』",
      subsections: [
        {
          title: "【展望と可能性】",
          content: "危機を乗り越えた先にある未来像"
        },
        {
          title: "【具体的なアクション】",
          content: "視聴者が今すぐ始められる行動指針"
        }
      ]
    }
  ];

  return { sections };
}

// アウトラインをフォーマットする関数
function formatOutline(outline: ScriptOutline): string {
  let formattedOutline = "=== 動画アウトライン ===\n\n";

  outline.sections.forEach((section, index) => {
    formattedOutline += `${index + 1}.${section.title}\n\n`;
    
    section.subsections.forEach((subsection, subIndex) => {
      formattedOutline += `${index + 1}-${subIndex + 1}.${subsection.title}\n`;
      formattedOutline += `${subsection.content}\n\n`;
    });
  });

  return formattedOutline;
}

// 本文セクションの型定義
interface ScriptSection {
  title: string;
  content: string;
  timestamp: string;
  duration: number;
}

// 本文生成関数
function generateFullScript(transcriptItems: any[], outline: ScriptOutline, summary: ProphecySummary): ScriptSection[] {
  const sections: ScriptSection[] = [];
  const itemsPerSection = Math.ceil(transcriptItems.length / outline.sections.length);
  
  outline.sections.forEach((outlineSection, index) => {
    const startIndex = index * itemsPerSection;
    const endIndex = Math.min((index + 1) * itemsPerSection, transcriptItems.length);
    const sectionItems = transcriptItems.slice(startIndex, endIndex);
    
    const sectionContent = generateSectionContent(
      outlineSection,
      sectionItems,
      summary,
      index === 0 // 最初のセクションかどうか
    );
    
    sections.push({
      title: outlineSection.title,
      content: sectionContent,
      timestamp: formatTimeForYoutube(sectionItems[0].offset),
      duration: sectionItems.reduce((acc, item) => acc + item.duration, 0)
    });
  });
  
  return sections;
}

// セクション内容生成関数
function generateSectionContent(
  outlineSection: OutlineSection,
  transcriptItems: any[],
  summary: ProphecySummary,
  isFirstSection: boolean
): string {
  let content = '';
  
  // 導入部分の生成
  if (isFirstSection) {
    content += generateIntroduction(summary);
  }
  
  // サブセクションの内容を生成
  outlineSection.subsections.forEach((subsection, index) => {
    content += `\n【${subsection.title}】\n`;
    content += generateSubsectionContent(subsection, transcriptItems, summary);
  });
  
  return content;
}

// 導入部分生成関数
function generateIntroduction(summary: ProphecySummary): string {
  return `皆さん、こんにちは。今回は非常に重要な情報をお伝えします。\n\n` +
    `${summary.prophet.name}による衝撃的な予言について、詳しく検証していきます。\n` +
    `この内容は、私たちの未来に大きな影響を与える可能性があります。\n\n`;
}

// サブセクション内容生成関数
function generateSubsectionContent(
  subsection: { title: string; content: string },
  transcriptItems: any[],
  summary: ProphecySummary
): string {
  // 基本的な内容を生成
  let content = `${subsection.content}\n\n`;
  
  // 予言の詳細情報を追加
  if (subsection.title.includes('警告') && summary.predictions.disasters) {
    content += `特に注目すべき点は、${summary.predictions.disasters.timing}に` +
      `${summary.predictions.disasters.location}で予測される出来事です。\n`;
  }
  
  // 科学的な裏付けを追加
  if (subsection.title.includes('検証') || subsection.title.includes('分析')) {
    content += `これらの予測は、${summary.characteristics.join('、')}といった特徴を持っています。\n`;
  }
  
  // 対策や行動指針を追加
  if (subsection.title.includes('対策') || subsection.title.includes('アクション')) {
    content += `具体的な対応として、以下の点に注目してください：\n` +
      summary.details.map(detail => `・${detail}`).join('\n');
  }
  
  return content;
}

// フルスクリプトをフォーマットする関数
function formatFullScript(sections: ScriptSection[]): string {
  let formattedScript = `=== 完全版動画台本 ===\n\n`;
  
  sections.forEach((section, index) => {
    formattedScript += `### ${section.title} ###\n`;
    formattedScript += `[${section.timestamp}] (${formatDuration(section.duration)})\n\n`;
    formattedScript += `${section.content}\n\n`;
    
    // セクション間の区切り
    if (index < sections.length - 1) {
      formattedScript += `---\n\n`;
    }
  });
  
  return formattedScript;
}

// オープニング生成のための型定義
interface OpeningElements {
  hook: string;
  tension: string;
  evidence: string;
  urgency: string;
  engagement: string;
}

// オープニング生成関数
function generateOpening(summary: ProphecySummary): string {
  const elements: OpeningElements = {
    hook: generateHook(summary),
    tension: generateTension(summary),
    evidence: generateEvidence(summary),
    urgency: generateUrgency(summary),
    engagement: generateEngagement()
  };
  
  return formatOpening(elements);
}

// フック生成関数
function generateHook(summary: ProphecySummary): string {
  const hooks = [
    `あなたの人生が、たった一人の${summary.prophet.occupation}の予言で大きく変わろうとしています。`,
    `今夜、あなたが眠っている間に、世界は大きく変わるかもしれません。`,
    `この動画を最後まで見ないと、あなたとあなたの大切な人が後悔することになるかもしれません。`
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

// 緊張感生成関数
function generateTension(summary: ProphecySummary): string {
  let tension = '';
  if (summary.predictions.disasters) {
    tension = `${summary.predictions.disasters.timing}に${summary.predictions.disasters.location}で起こる出来事は、` +
      `私たちの生活を根底から覆すことになります。`;
  } else {
    tension = '迫り来る危機は、私たちの想像をはるかに超えています。';
  }
  return tension;
}

// 証拠提示関数
function generateEvidence(summary: ProphecySummary): string {
  return `${summary.prophet.achievements.join('、')}。` +
    `その的中率は、世界中の専門家たちを震撼させています。`;
}

// 緊急性生成関数
function generateUrgency(summary: ProphecySummary): string {
  return `生き残るために必要な情報を、この動画ですべて明かします。` +
    `${summary.predictions.disasters?.timing || '近い将来'}に起こる出来事に、今すぐ備えなければなりません。`;
}

// エンゲージメント生成関数
function generateEngagement(): string {
  return `\n\nみなさん、この予言をどう思いますか？\n` +
    `コメント欄で、あなたの考えを教えてください。\n` +
    `動画の最後には、具体的な対策もお伝えします。\n` +
    `チャンネル登録、高評価もお願いします。\n` +
    `一緒に真実を見届けましょう。`;
}

// オープニングフォーマット関数
function formatOpening(elements: OpeningElements): string {
  return `=== オープニングナレーション ===\n\n` +
    `${elements.hook}\n\n` +
    `${elements.tension}\n\n` +
    `${elements.evidence}\n\n` +
    `${elements.urgency}\n\n` +
    `${elements.engagement}`;
}

// エンディング生成のための型定義
interface EndingElements {
  summary: string;
  timeframe: string;
  nextEpisode: string;
  engagement: string;
  hope: string;
}

// エンディング生成関数
function generateEnding(summary: ProphecySummary): string {
  const elements: EndingElements = {
    summary: generateEndingSummary(summary),
    timeframe: generateTimeframe(summary),
    nextEpisode: generateNextEpisode(summary),
    engagement: generateEndingEngagement(summary),
    hope: generateHope()
  };
  
  return formatEnding(elements);
}

// エンディングサマリー生成関数
function generateEndingSummary(summary: ProphecySummary): string {
  return `${summary.prophet.name}が示した未来。\n` +
    `その全ては、私たちの行動次第で変えられる可能性を秘めています。`;
}

// タイムフレーム生成関数
function generateTimeframe(summary: ProphecySummary): string {
  if (summary.predictions.disasters?.timing) {
    return `しかし、時間は限られています。\n${summary.predictions.disasters.timing}まで、あとわずか。`;
  }
  return '時間は刻一刻と過ぎていきます。\n今すぐ行動を起こさなければなりません。';
}

// 次回予告生成関数
function generateNextEpisode(summary: ProphecySummary): string {
  return `次回、${summary.prophet.name}の新たな予言と、\n` +
    `私たちに残された具体的な対策について詳しくお伝えします。\n` +
    `特に${summary.predictions.japan?.details[0] || '日本への影響'}について、\n` +
    `重要な情報を公開する予定です。`;
}

// エンディングエンゲージメント生成関数
function generateEndingEngagement(summary: ProphecySummary): string {
  return `\nあなたは、これらの予言をどう受け止めましたか？\n` +
    `特に印象に残った予測は？\n` +
    `${summary.predictions.disasters?.details[0] || '予言'}への対策として、\n` +
    `あなたならどのような行動を取りますか？\n\n` +
    `コメント欄で、みなさんの意見をシェアしてください。\n` +
    `興味深い考察には、詳しい追加情報とともに返信させていただきます。\n` +
    `チャンネル登録、高評価もお願いします。\n` +
    `この重要な情報を、より多くの人に届けるために。`;
}

// 希望のメッセージ生成関数
function generateHope(): string {
  return `\n私たちには、まだ希望があります。\n` +
    `最新の予言と対策情報は、このチャンネルで随時更新していきます。\n` +
    `次回の配信でお会いしましょう。`;
}

// エンディングフォーマット関数
function formatEnding(elements: EndingElements): string {
  return `=== エンディングナレーション ===\n\n` +
    `${elements.summary}\n\n` +
    `${elements.timeframe}\n\n` +
    `${elements.nextEpisode}\n\n` +
    `${elements.engagement}\n\n` +
    `${elements.hope}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId, format = 'default' } = body;

    if (!videoId) {
      return NextResponse.json({ error: "動画IDが指定されていません。" }, { status: 400 });
    }

    try {
      // 字幕を取得（まず日本語で試行）
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'ja'
      }).catch(() => 
        // 日本語が取得できない場合は英語で試行
        YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'en'
        })
      );

      if (!transcriptItems || transcriptItems.length === 0) {
        return NextResponse.json({ error: "字幕を取得できませんでした。" }, { status: 404 });
      }

      // フォーマットに応じて台本を生成
      let scriptContent = '';
      switch (format) {
        case 'hiroshi':
          // ひろし式フォーマット
          const totalDuration = transcriptItems.reduce((acc, item) => acc + item.duration, 0);
          const segmentSize = Math.ceil(transcriptItems.length / 7); // 7つのセグメントに分割
          
          scriptContent = `=== ひろし式動画台本 ===\n\n`;
          
          // 基本情報
          scriptContent += `動画時間: ${formatDuration(totalDuration)}\n`;
          scriptContent += `セグメント数: 7\n`;
          scriptContent += `各セグメント平均時間: ${formatDuration(totalDuration / 7)}\n\n`;

          // 各プロンプトに対応するセグメントを生成
          Object.entries(hiroshiPrompts).forEach(([key, prompt], index) => {
            const start = index * segmentSize;
            const end = Math.min((index + 1) * segmentSize, transcriptItems.length);
            const segmentItems = transcriptItems.slice(start, end);
            
            scriptContent += `### ${prompt} ###\n\n`;
            segmentItems.forEach(item => {
              scriptContent += `[${formatTimeForYoutube(item.offset)}] ${item.text}\n`;
            });
            scriptContent += '\n';
          });
          break;

        case 'summary':
          // 要約フォーマットの処理
          const contentSummary = generateSummary(transcriptItems);
          scriptContent = formatSummary(contentSummary);
          break;

        case 'title':
          // タイトル生成の処理
          const titleSummary = generateSummary(transcriptItems);
          const generatedTitle = generateTitle(titleSummary);
          scriptContent = `=== 生成されたタイトル ===\n\n${generatedTitle}\n\n`;
          scriptContent += `元の内容の要約：\n${formatSummary(titleSummary)}`;
          break;

        case 'outline':
          // アウトライン生成の処理
          const outlineSummary = generateSummary(transcriptItems);
          const outlineTitle = generateTitle(outlineSummary);
          const outline = generateOutline(outlineSummary, outlineTitle);
          scriptContent = formatOutline(outline);
          break;

        case 'youtube':
          // 既存のYouTube動画向けフォーマット
          scriptContent = transcriptItems
            .map((item, index) => {
              const timeCode = formatTimeForYoutube(item.offset);
              return `[${timeCode}]\n${item.text}\n\n`;
            })
            .join('');
          break;

        case 'movie':
          // 既存の映画の台本風フォーマット
          scriptContent = transcriptItems
            .map((item, index) => {
              const sceneNumber = Math.floor(index / 5) + 1;
              return `シーン ${sceneNumber}\n${item.text}\n\n`;
            })
            .join('');
          break;

        case 'narration':
          // 既存のナレーション用フォーマット
          scriptContent = transcriptItems
            .map(item => `（${formatDuration(item.duration)}）\n${item.text}\n\n`)
            .join('');
          break;

        case 'full':
          // フルスクリプト生成
          const fullScriptSummary = generateSummary(transcriptItems);
          const fullScriptTitle = generateTitle(fullScriptSummary);
          const fullScriptOutline = generateOutline(fullScriptSummary, fullScriptTitle);
          const scriptSections = generateFullScript(transcriptItems, fullScriptOutline, fullScriptSummary);
          scriptContent = formatFullScript(scriptSections);
          break;

        case 'opening':
          // オープニング生成
          const openingSummary = generateSummary(transcriptItems);
          scriptContent = generateOpening(openingSummary);
          break;

        case 'ending':
          // エンディング生成
          const endingSummary = generateSummary(transcriptItems);
          scriptContent = generateEnding(endingSummary);
          break;

        default:
          // デフォルトフォーマット
          scriptContent = transcriptItems
            .map(item => item.text)
            .join('\n\n');
      }

      // コンテンツの加工（順序を変更）
      const styledContent = applyChannelStyle(scriptContent, format);
      const adaptedContent = adaptContentToTarget(styledContent);
      const enrichedContent = enrichContentWithDesires(adaptedContent, format);

      return new NextResponse(enrichedContent, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="script_${videoId}_${format}.txt"`,
        },
      });

    } catch (error: any) {
      console.error("字幕取得エラー:", error);
      return NextResponse.json({ 
        error: "字幕の取得中にエラーが発生しました。",
        details: error.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("リクエスト処理エラー:", error);
    return NextResponse.json({ 
      error: "予期せぬエラーが発生しました。",
      details: error.message 
    }, { status: 500 });
  }
}

// YouTube向けのタイムコードフォーマット（MM:SS）
function formatTimeForYoutube(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 継続時間のフォーマット
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分${remainingSeconds}秒`;
} 