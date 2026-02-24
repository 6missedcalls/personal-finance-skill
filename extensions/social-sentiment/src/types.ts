// ── Social Sentiment Extension Types ──

// ── Config ──

export interface SocialSentimentConfig {
  readonly stocktwitsBaseUrl: string
  readonly xApiBearerToken: string | null
  readonly xApiBaseUrl: string
  readonly quiverApiKey: string | null
  readonly quiverBaseUrl: string
}

// ── Tool Context ──

export interface ToolContext {
  readonly config: SocialSentimentConfig
}

// ── Tool Result Envelope ──

export interface ToolResult<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
}

// ── StockTwits ──

export interface StockTwitsMessage {
  readonly id: number
  readonly body: string
  readonly created_at: string
  readonly user: {
    readonly id: number
    readonly username: string
    readonly followers: number
  }
  readonly entities: {
    readonly sentiment: {
      readonly basic: "Bullish" | "Bearish" | null
    }
  }
  readonly likes: {
    readonly total: number
  }
}

export interface StockTwitsSentimentResult {
  readonly symbol: string
  readonly sentiment: {
    readonly bullish: number
    readonly bearish: number
    readonly total: number
  }
  readonly messages: ReadonlyArray<StockTwitsMessage>
  readonly timestamp: string
}

export interface StockTwitsTrendingSymbol {
  readonly symbol: string
  readonly title: string
  readonly watchlist_count: number
}

// ── X/Twitter ──

export interface XTweet {
  readonly id: string
  readonly text: string
  readonly created_at: string
  readonly author_id: string
  readonly public_metrics: {
    readonly retweet_count: number
    readonly reply_count: number
    readonly like_count: number
    readonly quote_count: number
  }
}

// ── Quiver Quantitative ──

export interface QuiverCongressTrade {
  readonly transaction_date: string
  readonly disclosure_date: string
  readonly representative: string
  readonly party: string
  readonly house: "House" | "Senate"
  readonly ticker: string
  readonly transaction_type: "Purchase" | "Sale" | "Exchange"
  readonly amount: string
  readonly asset_description: string
}
