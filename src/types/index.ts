export interface Message {
  fromMe: boolean;
  text: string;
  time: string;
}

export interface MomentImage {
  src: string;
  filename?: string;
  originalFilename?: string;
  type?: string;
}

export interface Moment {
  id: string;
  title: string;
  date: string;
  timestamp?: string;
  messages: Message[];
  image: MomentImage | null;
  tags: string[];
  context?: string;
}

export interface RawMessage {
  id: number;
  timestamp: string;
  isFromMe: boolean;
  text?: string;
}

export interface Stats {
  totalMessages: number;
  fromMe: number;
  fromThem: number;
  firstDate: string;
  lastDate: string;
  daysTexted: number;
  mostActiveHour: { hour: string; count: number };
  mostActiveDay: { day: string; count: number };
  topEmojis: Array<{ emoji: string; count: number }>;
  loveYouCount: number;
  longestStreak: number;
  avgPerDay: number;
  totalWords: number;
  lateNightMessages: number;
  photosShared: number;
}
