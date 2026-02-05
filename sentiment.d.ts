declare module 'sentiment' {
  class Sentiment {
    constructor();
    analyze(
      phrase: string,
      options?: {
        extras?: { [key: string]: number };
        language?: string;
      }
    ): {
      score: number;
      comparative: number;
      tokens: string[];
      words: string[];
      positive: string[];
      negative: string[];
    };
  }
  export default Sentiment;
}