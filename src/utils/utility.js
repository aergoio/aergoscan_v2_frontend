export function toFix(text) {
  if (Number.isInteger(text)) {
    return text;
  } else {
    return Number(text).toFixed(3);
  }
}
