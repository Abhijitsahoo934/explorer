import { getSafeLocalStorage, readStorageValue, writeStorageValue } from '../platform/storage/browserStorage';
import { STORAGE_KEYS } from '../platform/storage/keys';

type VariantMap = Record<string, string>;

function readExperimentAssignments(): VariantMap {
  const safeLocalStorage = getSafeLocalStorage();
  if (!safeLocalStorage) return {};

  try {
    const raw = readStorageValue(safeLocalStorage, STORAGE_KEYS.experiments);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VariantMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeExperimentAssignments(assignments: VariantMap) {
  const safeLocalStorage = getSafeLocalStorage();
  if (!safeLocalStorage) return;
  writeStorageValue(safeLocalStorage, STORAGE_KEYS.experiments, JSON.stringify(assignments));
}

export function getExperimentVariant(experimentId: string, variants: readonly string[]): string {
  if (variants.length === 0) {
    throw new Error(`Experiment "${experimentId}" must provide at least one variant.`);
  }

  const existingAssignments = readExperimentAssignments();
  const existingVariant = existingAssignments[experimentId];
  if (existingVariant && variants.includes(existingVariant)) {
    return existingVariant;
  }

  const assignedVariant = variants[Math.floor(Math.random() * variants.length)];
  writeExperimentAssignments({
    ...existingAssignments,
    [experimentId]: assignedVariant,
  });

  return assignedVariant;
}
