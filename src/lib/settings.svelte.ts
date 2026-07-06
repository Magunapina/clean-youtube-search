function createPersisted<T extends string>(key: string, fallback: T) {
  let value = $state<T>((localStorage.getItem(key) as T | null) ?? fallback);

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      value = v;
      if (v) {
        localStorage.setItem(key, v);
      } else {
        localStorage.removeItem(key);
      }
    },
  };
}

export const apiKey = createPersisted<string>("youtube_data_api_key", "");
export const timeFormat = createPersisted<"relative" | "absolute">(
  "time_format",
  "relative",
);
