import type { Collection, CollectionExport, ShoppingList } from '../types';

const STORAGE_KEY = 'riftbound-vault-collection-v1';
const FOIL_KEY = 'riftbound-vault-foils-v1';
const SHOPPING_KEY = 'riftbound-vault-shopping-v1';

export function loadCollection(): Collection {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Collection;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveCollection(collection: Collection): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

export function exportCollectionJson(collection: Collection): string {
  const payload: CollectionExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    collection,
  };
  return JSON.stringify(payload, null, 2);
}

export function importCollectionJson(raw: string): Collection {
  const parsed = JSON.parse(raw) as CollectionExport | Collection;
  if ('collection' in parsed && parsed.collection) {
    return normalizeCollection(parsed.collection);
  }
  return normalizeCollection(parsed as Collection);
}

function normalizeCollection(input: Collection): Collection {
  const out: Collection = {};
  for (const [id, qty] of Object.entries(input)) {
    const n = Math.floor(Number(qty));
    if (n > 0) out[id] = n;
  }
  return out;
}

export function loadFoils(): Collection {
  try {
    const raw = localStorage.getItem(FOIL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Collection;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveFoils(foils: Collection): void {
  localStorage.setItem(FOIL_KEY, JSON.stringify(foils));
}

export function loadShoppingList(): ShoppingList {
  try {
    const raw = localStorage.getItem(SHOPPING_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ShoppingList;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveShoppingList(list: ShoppingList): void {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(list));
}

export function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
