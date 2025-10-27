export function parseNumbers(input: string) {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n))) throw new Error("Brojevi moraju biti cijeli.");
  if (nums.length < 6 || nums.length > 10) throw new Error("Dozvoljeno je 6 do 10 brojeva.");
  const set = new Set(nums);
  if (set.size !== nums.length) throw new Error("Duplikati među brojevima nisu dozvoljeni.");
  if (nums.some((n) => n < 1 || n > 45)) throw new Error("Brojevi moraju biti u rasponu 1–45.");
  return nums;
}

export function validateDocumentId(id: string) {
  if (!id) throw new Error("Broj osobne/putovnice je obavezan.");
  if (id.length > 20) throw new Error("Broj osobne/putovnice je predugačak.");
}



