export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pad2(n) {
  return `${n}`.padStart(2, "0");
}

export function initials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function clampWords(text, maxWords) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length <= maxWords ? text : `${words.slice(0, maxWords).join(" ")}…`;
}

export function normalizePhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+84")) {
    return "0" + cleaned.slice(3);
  }
  return cleaned;
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const stringUtils = {
  slugify,
  pad2,
  initials,
  clampWords,
  normalizePhone,
  capitalize,
};

export default stringUtils;
