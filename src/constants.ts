export const COL_NO = "No";
export const COL_DIALOGUE = "\u30BB\u30EA\u30D5\u7B49"; // セリフ等
export const COL_SPEAKER = "\u8A71\u8005"; // 話者
export const COL_BG = "\u80CC\u666F"; // 背景
export const COL_SCENE = "\u30B7\u30FC\u30F3"; // シーン
export const COL_CUT = "\u30AB\u30C3\u30C8(\u6F14\u51FA\u6307\u793A)"; // カット(演出指示)

/** Columns that should use CustomSelect */
export const SELECT_COLUMNS: Record<string, "speaker" | "background"> = {
  [COL_SPEAKER]: "speaker",
  [COL_BG]: "background",
};
