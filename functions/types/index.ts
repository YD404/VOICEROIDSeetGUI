// ============================================================
// 型定義: APIレスポンス・環境変数
// ============================================================

/**
 * 統一されたAPIレスポンスフォーマット
 */
export interface ApiResponse<T = unknown> {
  /** リクエストの成否 */
  status: "success" | "error";
  /** レスポンスデータ（成功時） */
  data?: T;
  /** メッセージ（エラー詳細など） */
  message?: string;
}

/**
 * スプレッドシートの1行を表すオブジェクト
 * ヘッダー行の各カラム名をキーとする
 */
export type SheetRow = Record<string, string>;

/**
 * POST /api/sheet のリクエストボディ（行単位の更新）
 */
export interface UpdateRowBody {
  rowNumber: number;
  data: SheetRow;
}

/**
 * PUT /api/sheet のリクエストボディ（一括更新）
 */
export interface UpdateBatchBody {
  data: SheetRow[];
}

/**
 * Cloudflare Pages Functions の環境変数
 */
export interface Env {
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  SPREADSHEET_ID: string;
  SHEET_RANGE: string;
}
