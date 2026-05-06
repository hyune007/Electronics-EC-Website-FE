import api from "./api";

export async function requestComparisonSuggestion(message) {
  const response = await api.get("/api/ai/chat", {
    params: { message },
  });

  return String(response?.data?.generation || "").trim();
}

export async function requestAiChatPrompt(message) {
  try {
    return await requestComparisonSuggestion(message);
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data || {};
    const title = String(data?.title || "").trim();
    const messageText = String(data?.message || "").trim();
    const normalizedError = new Error(
      messageText || "Không thể kết nối AI lúc này. Vui lòng thử lại sau."
    );
    normalizedError.status = status;
    normalizedError.title = title;
    normalizedError.backendMessage = messageText;

    throw normalizedError;
  }
}

function extractJsonArray(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return [];

  // Loại bỏ code block markers
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  // Tìm JSON array bắt đầu từ [ và kết thúc tại ]
  const arrayRegex = /\[[\s\S]*\]/;
  const arrayMatch = arrayRegex.exec(cleaned);
  if (arrayMatch) {
    cleaned = arrayMatch[0];
  }

  const tryParse = (candidate) => {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.specs)) return parsed.specs;
      if (parsed && typeof parsed === "object") {
        // Tìm mảng đầu tiên trong object
        for (const key in parsed) {
          if (Array.isArray(parsed[key])) return parsed[key];
        }
      }
    } catch {
      return [];
    }
    return [];
  };

  const parsedFromCleaned = tryParse(cleaned);
  if (parsedFromCleaned.length > 0) return parsedFromCleaned;

  // Fallback: parse trực tiếp chuỗi gốc nếu cleaned không hợp lệ.
  return tryParse(text);
}

function parsePlainTextSpecs(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return [];

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replaceAll(/^[-*\d.)\s]+/, ""))
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex <= 0) return null;

      const label = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (!label || !value) return null;
      return { label, value };
    })
    .filter(Boolean);
}

function normalizeLabel(label) {
  const input = String(label || "").trim();
  if (!input) return "";

  const normalized = input
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");

  const map = {
    chipset: "CPU",
    "bo xu ly": "CPU",
    cpu: "CPU",
    gpu: "GPU",
    "man hinh": "Màn hình",
    "kich thuoc man hinh": "Màn hình",
    "do phan giai": "Độ phân giải",
    resolution: "Độ phân giải",
    "tan so quet": "Tần số quét",
    ram: "RAM",
    rom: "Bộ nhớ trong",
    "bo nho trong": "Bộ nhớ trong",
    storage: "Bộ nhớ trong",
    "camera sau": "Camera sau",
    "camera truoc": "Camera trước",
    pin: "Pin",
    battery: "Pin",
    sac: "Sạc",
    "he dieu hanh": "Hệ điều hành",
    os: "Hệ điều hành",
    "ket noi": "Kết nối",
    connectivity: "Kết nối",
    "khang nuoc": "Kháng nước",
  };

  return map[normalized] || input;
}

function normalizeSpecs(specs) {
  if (!Array.isArray(specs)) return [];

  return specs
    .map((item) => ({
      label: normalizeLabel(item?.label || item?.name || ""),
      value: String(item?.value || item?.spec || "").trim(),
    }))
    .filter((item) => item.label && item.value)
    .slice(0, 24);
}

export async function requestProductTechnicalSpecs(prompt) {
  const response = await api.get("/api/ai/chat", {
    params: { message: prompt },
  });

  const raw = String(response?.data?.generation || "").trim();
  // console.log("Raw AI Response:", raw);
  if (!raw) return [];

  const fromJson = normalizeSpecs(extractJsonArray(raw));
  // console.log("Extracted JSON specs:", fromJson);
  if (fromJson.length > 0) return fromJson;

  const fromText = normalizeSpecs(parsePlainTextSpecs(raw));
  // console.log("Parsed text specs:", fromText);
  if (fromText.length > 0) return fromText;

  return [];
}
