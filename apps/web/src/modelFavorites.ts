import type {
  ModelSelection,
  ProviderInstanceId,
  ProviderOptionSelection,
  ServerProviderModel,
} from "@t3tools/contracts";
import type { ModelFavorite } from "@t3tools/contracts/settings";
import {
  buildProviderOptionSelectionsFromDescriptors,
  getModelSelectionOptionDescriptors,
} from "@t3tools/shared/model";

const EFFORT_OPTION_IDS = new Set(["reasoningEffort", "effort", "reasoning", "variant"]);
const EFFORT_LABELS: Readonly<Record<string, string>> = {
  minimal: "Minimal",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "XHigh",
  max: "Max",
  adaptive: "Adaptive",
};

export function findModelFavorite(
  favorites: ReadonlyArray<ModelFavorite>,
  instanceId: ProviderInstanceId,
  model: string,
): ModelFavorite | undefined {
  return favorites.find((favorite) => favorite.provider === instanceId && favorite.model === model);
}

export function buildModelFavoriteOptions(
  selection: ModelSelection,
  models: ReadonlyArray<ServerProviderModel>,
): ReadonlyArray<ProviderOptionSelection> {
  const model = models.find((candidate) => candidate.slug === selection.model);
  return (
    buildProviderOptionSelectionsFromDescriptors(
      getModelSelectionOptionDescriptors(selection, model?.capabilities),
    ) ?? []
  );
}

export function toggleModelFavorite(
  favorites: ReadonlyArray<ModelFavorite>,
  input: {
    readonly instanceId: ProviderInstanceId;
    readonly model: string;
    readonly options: ReadonlyArray<ProviderOptionSelection>;
  },
): ModelFavorite[] {
  const existingIndex = favorites.findIndex(
    (favorite) => favorite.provider === input.instanceId && favorite.model === input.model,
  );
  if (existingIndex >= 0) {
    return favorites.filter((_, index) => index !== existingIndex);
  }
  return [
    ...favorites,
    {
      provider: input.instanceId,
      model: input.model,
      // Keep an empty array to distinguish a new snapshot that intentionally
      // uses provider defaults from a legacy favorite with no saved options.
      options: input.options.map((option) => ({ ...option })),
    },
  ];
}

export function getModelFavoriteEffortLabel(favorite: ModelFavorite | undefined): string | null {
  const effort = favorite?.options?.find(
    (selection) => EFFORT_OPTION_IDS.has(selection.id) && typeof selection.value === "string",
  );
  if (!effort || typeof effort.value !== "string") {
    return null;
  }
  return EFFORT_LABELS[effort.value] ?? effort.value;
}
