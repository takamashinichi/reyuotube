declare module 'youtube-transcript' {
  interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
  }

  interface TranscriptOptions {
    lang?: string;
  }

  export class YoutubeTranscript {
    static fetchTranscript(videoId: string, options?: TranscriptOptions): Promise<TranscriptItem[]>;
  }
} 