// ============================================================
// Hono メインルーティング (Cloudflare Pages Functions)
// ============================================================

import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { GoogleSheetsService } from "../lib/googleSheetsService";
import type { ApiResponse, Env, SheetRow, UpdateRowBody, UpdateBatchBody } from "../types/index";

// ----------------------------------------------------------
// Hono アプリケーション定義
// ----------------------------------------------------------
type HonoEnv = { Bindings: Env };

const app = new Hono<HonoEnv>().basePath("/api");

// ----------------------------------------------------------
// ヘルパー: サービスインスタンス生成
// ----------------------------------------------------------
function createService(env: Env): GoogleSheetsService {
  return new GoogleSheetsService(
    env.GOOGLE_CLIENT_EMAIL,
    env.GOOGLE_PRIVATE_KEY,
    env.SPREADSHEET_ID,
    env.SHEET_RANGE
  );
}

// ----------------------------------------------------------
// GET /api/sheet — スプレッドシートからデータ取得
// ----------------------------------------------------------
app.get("/sheet", async (c) => {
  try {
    const service = createService(c.env);
    const data = await service.getSheetData();

    const response: ApiResponse<SheetRow[]> = {
      status: "success",
      data,
      message: `${data.length}件のデータを取得しました`,
    };
    return c.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    const response: ApiResponse = {
      status: "error",
      message,
    };
    return c.json(response, 500);
  }
});

// ----------------------------------------------------------
// POST /api/sheet — 指定した行を更新
// ----------------------------------------------------------
app.post("/sheet", async (c) => {
  try {
    const body = await c.req.json<UpdateRowBody>();

    // バリデーション
    if (typeof body.rowNumber !== "number" || body.rowNumber < 2) {
      const response: ApiResponse = {
        status: "error",
        message: "rowNumber は2以上の数値で指定してください（1行目はヘッダーです）",
      };
      return c.json(response, 400);
    }

    if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
      const response: ApiResponse = {
        status: "error",
        message: "data はオブジェクト（例: {\"セリフ等\": \"新しいセリフ\"}）で指定してください",
      };
      return c.json(response, 400);
    }

    const service = createService(c.env);
    await service.updateRow(body.rowNumber, body.data);

    const response: ApiResponse<{ updatedRow: number }> = {
      status: "success",
      data: { updatedRow: body.rowNumber },
      message: `${body.rowNumber}行目を更新しました`,
    };
    return c.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    const response: ApiResponse = {
      status: "error",
      message,
    };
    return c.json(response, 500);
  }
});

// ----------------------------------------------------------
// PUT /api/sheet — 全データを一括更新
// ----------------------------------------------------------
app.put("/sheet", async (c) => {
  try {
    const body = await c.req.json<UpdateBatchBody>();

    if (!Array.isArray(body.data)) {
      const response: ApiResponse = {
        status: "error",
        message: "data \u306f\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u914d\u5217\u3067\u3042\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059",
      };
      return c.json(response, 400);
    }

    const service = createService(c.env);
    await service.updateAllRows(body.data);

    const response: ApiResponse = {
      status: "success",
      message: `${body.data.length}\u4ef6\u306e\u30c7\u30fc\u30bf\u3092\u4e00\u62ec\u66f4\u65b0\u3057\u307e\u3057\u305f`,
    };
    return c.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "\u4e0d\u660e\u306a\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f";
    const response: ApiResponse = {
      status: "error",
      message,
    };
    return c.json(response, 500);
  }
});

// ----------------------------------------------------------
// 404 ハンドリング
// ----------------------------------------------------------
app.notFound((c) => {
  const response: ApiResponse = {
    status: "error",
    message: `ルート ${c.req.path} は存在しません`,
  };
  return c.json(response, 404);
});

// ----------------------------------------------------------
// グローバルエラーハンドラー
// ----------------------------------------------------------
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  const response: ApiResponse = {
    status: "error",
    message: "内部サーバーエラーが発生しました",
  };
  return c.json(response, 500);
});

// ----------------------------------------------------------
// Cloudflare Pages Functions ハンドラーとしてエクスポート
// ----------------------------------------------------------
export const onRequest = handle(app);
