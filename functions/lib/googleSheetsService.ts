// ============================================================
// GoogleSheetsService
// Google Sheets API との通信をカプセル化したサービスクラス
// ============================================================

import { JWT } from "google-auth-library";
import type { SheetRow } from "../types/index";

/**
 * Google Sheets API とやりとりするためのサービスクラス。
 * 認証情報の管理、データの取得・更新をカプセル化する。
 */
export class GoogleSheetsService {
  private jwtClient: JWT;
  private spreadsheetId: string;
  private range: string;

  private static readonly SHEETS_API_BASE =
    "https://sheets.googleapis.com/v4/spreadsheets";

  constructor(
    clientEmail: string,
    privateKey: string,
    spreadsheetId: string,
    range: string
  ) {
    // google-auth-library の JWT クラスで明示的に認証
    this.jwtClient = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.spreadsheetId = spreadsheetId;
    this.range = range;
  }

  // ----------------------------------------------------------
  // アクセストークン取得
  // ----------------------------------------------------------
  private async getAccessToken(): Promise<string> {
    try {
      const res = await this.jwtClient.getAccessToken();
      if (!res.token) {
        throw new Error("アクセストークンの取得に失敗しました");
      }
      return res.token;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラー";
      throw new Error(`Google認証エラー: ${message}`);
    }
  }

  // ----------------------------------------------------------
  // GET: スプレッドシートからデータ取得
  // ----------------------------------------------------------

  /**
   * スプレッドシートの指定範囲からデータを取得し、
   * 1行目をヘッダーとしたオブジェクト配列に変換して返す。
   */
  async getSheetData(): Promise<SheetRow[]> {
    const token = await this.getAccessToken();
    const url = `${GoogleSheetsService.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(this.range)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `シートデータの取得に失敗しました (${response.status}): ${body}`
      );
    }

    const json = (await response.json()) as {
      values?: string[][];
    };

    const rows = json.values ?? [];
    if (rows.length === 0) {
      return [];
    }

    // 1行目をヘッダーとして利用
    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj: SheetRow = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? "";
      });
      return obj;
    });
  }

  // ----------------------------------------------------------
  // POST: スプレッドシートの特定の行を更新
  // ----------------------------------------------------------

  /**
   * スプレッドシートのヘッダー行（1行目）を取得する。
   */
  private async getHeaders(token: string): Promise<string[]> {
    // シート名を取得（"Sheet1!A:Z" → "Sheet1"）
    const sheetName = this.range.split("!")[0];
    const headerRange = `${sheetName}!1:1`;

    const url = `${GoogleSheetsService.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(headerRange)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `ヘッダー行の取得に失敗しました (${response.status}): ${body}`
      );
    }

    const json = (await response.json()) as { values?: string[][] };
    const headers = json.values?.[0];

    if (!headers || headers.length === 0) {
      throw new Error("ヘッダー行が空です");
    }

    return headers;
  }

  /**
   * 指定した行番号のデータを更新する。
   * rowNumber はスプレッドシート上の行番号（ヘッダーが1行目、データは2行目から）。
   * data に含まれるカラムだけを更新し、含まれないカラムは既存の値を維持する。
   */
  async updateRow(
    rowNumber: number,
    data: Record<string, string>
  ): Promise<void> {
    if (rowNumber < 2) {
      throw new Error("rowNumber は2以上（データ行）を指定してください");
    }

    const token = await this.getAccessToken();

    // ① ヘッダー行を取得してカラム順序を確定
    const headers = await this.getHeaders(token);

    // ② 既存の行データを取得（部分更新のため）
    const sheetName = this.range.split("!")[0];
    const rowRange = `${sheetName}!${rowNumber}:${rowNumber}`;

    const existingRes = await fetch(
      `${GoogleSheetsService.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(rowRange)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!existingRes.ok) {
      const body = await existingRes.text();
      throw new Error(
        `既存行データの取得に失敗しました (${existingRes.status}): ${body}`
      );
    }

    const existingJson = (await existingRes.json()) as {
      values?: string[][];
    };
    const existingRow = existingJson.values?.[0] ?? [];

    // ③ 既存データをベースに、送信されたカラムだけ上書き
    const newRow = headers.map((header, i) => {
      if (header in data) {
        return data[header];
      }
      return existingRow[i] ?? "";
    });

    // ④ 行を更新
    const updateUrl = `${GoogleSheetsService.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(rowRange)}?valueInputOption=RAW`;

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: rowRange,
        majorDimension: "ROWS",
        values: [newRow],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `行の更新に失敗しました (${response.status}): ${body}`
      );
    }
  }

  /**
   * 全てのデータ行を一括で更新する。
   * 既存のデータ行（2行目以降）を一度クリアし、新しいデータを書き込む。
   */
  async updateAllRows(rows: SheetRow[]): Promise<void> {
    const token = await this.getAccessToken();
    const headers = await this.getHeaders(token);

    const sheetName = this.range.split("!")[0];
    
    // 1. 既存のデータ範囲（2行目以降）をクリア
    // A2:Z1000 などの広い範囲を指定してクリアする
    const clearRange = `${sheetName}!A2:Z2000`; 
    const clearUrl = `${GoogleSheetsService.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(clearRange)}:clear`;

    const clearRes = await fetch(clearUrl, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    if (!clearRes.ok) {
      const body = await clearRes.text();
      throw new Error(`シートのクリアに失敗しました: ${body}`);
    }

    if (rows.length === 0) return;

    // 2. オブジェクト配列を2D配列に変換
    const values = rows.map((row) => {
      return headers.map((header) => row[header] ?? "");
    });

    // 3. A2セルを起点に一括書き込み
    const updateRange = `${sheetName}!A2`;
    const updateUrl = `${GoogleSheetsService.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(updateRange)}?valueInputOption=RAW`;

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: updateRange,
        majorDimension: "ROWS",
        values: values,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`一括更新に失敗しました (${response.status}): ${body}`);
    }
  }
}
