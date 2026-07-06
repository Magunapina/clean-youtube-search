// History constants
const MAX_HISTORY_ITEMS = 100;

export function getHistory(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Failed to parse history for ${key}`, e);
    return [];
  }
}

export function addHistory(key: string, value: string) {
  if (!value || value.trim() === "") return;
  const trimmed = value.trim();

  let history = getHistory(key);

  // Remove if it already exists to move it to the top
  history = history.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase(),
  );

  // Add to start
  history.unshift(trimmed);

  // Cap at max items
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }

  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    console.error(`Failed to save history for ${key}`, e);
  }
}

export function removeHistory(key: string, value: string) {
  let history = getHistory(key);
  history = history.filter(
    (item) => item.toLowerCase() !== value.toLowerCase(),
  );

  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    console.error(`Failed to remove history for ${key}`, e);
  }
}
