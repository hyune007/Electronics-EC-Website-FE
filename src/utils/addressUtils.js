// utils/addressUtils.js

export function extractStreetAddress(fullAddress) {
  if (!fullAddress) return "";

  // chỉ lấy phần trước " - "
  const streetPart = fullAddress.split(/ - |, /)[0].trim();

  // KHÔNG bỏ dấu /
  // KHÔNG đụng tới hẻm
  // chỉ thêm Vietnam để tăng độ chính xác

  return `${streetPart}, Vietnam`;
}
