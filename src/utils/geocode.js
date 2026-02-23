import { extractStreetAddress } from "./addressUtils";
export async function geocodeAddress(address) {
  if (!address) return null;

  try {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({
        format: "json",
        q: extractStreetAddress(address),
        countrycodes: "vn",
        limit: 1,
      });

    const res = await fetch(url, {
      headers: {
        "Accept-Language": "vi",
      },
    });

    if (!res.ok) {
      throw new Error("Geocode request failed");
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return null;
    }

    return [
      parseFloat(data[0].lat),
      parseFloat(data[0].lon),
    ];

  } catch (err) {
    console.error("Geocode error:", err);
    return null;
  }
}
