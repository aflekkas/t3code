import { describe, expect, it } from "vite-plus/test";
import { ProviderInstanceId } from "@t3tools/contracts";

import {
  buildModelFavoriteOptions,
  findModelFavorite,
  getModelFavoriteEffortLabel,
  toggleModelFavorite,
  toggleModelFavoriteForSelection,
} from "./modelFavorites";

const CODEX = ProviderInstanceId.make("codex");

describe("model favorites", () => {
  it("materializes a model's default reasoning effort for a favorite snapshot", () => {
    expect(
      buildModelFavoriteOptions({ instanceId: CODEX, model: "gpt-5.6-sol" }, [
        {
          slug: "gpt-5.6-sol",
          name: "GPT-5.6-Sol",
          isCustom: false,
          capabilities: {
            optionDescriptors: [
              {
                id: "reasoningEffort",
                label: "Reasoning effort",
                type: "select",
                options: [
                  { id: "medium", label: "Medium", isDefault: true },
                  { id: "high", label: "High" },
                ],
              },
            ],
          },
        },
      ]),
    ).toEqual([{ id: "reasoningEffort", value: "medium" }]);
  });

  it("snapshots reasoning effort when a model is favorited", () => {
    const favorites = toggleModelFavorite([], {
      instanceId: CODEX,
      model: "gpt-5.6-sol",
      options: [{ id: "reasoningEffort", value: "high" }],
    });

    expect(favorites).toEqual([
      {
        provider: CODEX,
        model: "gpt-5.6-sol",
        options: [{ id: "reasoningEffort", value: "high" }],
      },
    ]);
    expect(getModelFavoriteEffortLabel(favorites[0])).toBe("High");
  });

  it("snapshots an inactive model's defaults instead of the active model's options", () => {
    const favorites = toggleModelFavoriteForSelection([], {
      selection: { instanceId: CODEX, model: "gpt-5.6-sol" },
      activeSelection: { instanceId: CODEX, model: "gpt-5.6-terra" },
      activeOptions: [],
      models: [
        {
          slug: "gpt-5.6-sol",
          name: "GPT-5.6-Sol",
          isCustom: false,
          capabilities: {
            optionDescriptors: [
              {
                id: "reasoningEffort",
                label: "Reasoning effort",
                type: "select",
                options: [
                  { id: "medium", label: "Medium", isDefault: true },
                  { id: "high", label: "High" },
                ],
              },
            ],
          },
        },
      ],
    });

    expect(favorites).toEqual([
      {
        provider: CODEX,
        model: "gpt-5.6-sol",
        options: [{ id: "reasoningEffort", value: "medium" }],
      },
    ]);
  });

  it("uses the provider's label for saved effort values", () => {
    expect(
      getModelFavoriteEffortLabel(
        {
          provider: CODEX,
          model: "gpt-5.6-sol",
          options: [{ id: "reasoningEffort", value: "xhigh" }],
        },
        {
          slug: "gpt-5.6-sol",
          name: "GPT-5.6-Sol",
          isCustom: false,
          capabilities: {
            optionDescriptors: [
              {
                id: "reasoningEffort",
                label: "Reasoning effort",
                type: "select",
                options: [{ id: "xhigh", label: "Extra High", isDefault: true }],
              },
            ],
          },
        },
      ),
    ).toBe("Extra High");
  });

  it("formats supported effort values when provider metadata is unavailable", () => {
    expect(
      getModelFavoriteEffortLabel({
        provider: CODEX,
        model: "claude-opus",
        options: [{ id: "effort", value: "ultrathink" }],
      }),
    ).toBe("Ultrathink");
    expect(
      getModelFavoriteEffortLabel({
        provider: CODEX,
        model: "gpt-5.6-sol",
        options: [{ id: "reasoningEffort", value: "ultra" }],
      }),
    ).toBe("Ultra");
  });

  it("keeps model-only legacy favorites selectable without inventing options", () => {
    const favorite = findModelFavorite(
      [{ provider: CODEX, model: "gpt-5.6-sol" }],
      CODEX,
      "gpt-5.6-sol",
    );

    expect(favorite?.options).toBeUndefined();
    expect(getModelFavoriteEffortLabel(favorite)).toBeNull();
  });

  it("removes an existing favorite regardless of its saved configuration", () => {
    const favorites = toggleModelFavorite(
      [
        {
          provider: CODEX,
          model: "gpt-5.6-sol",
          options: [{ id: "reasoningEffort", value: "high" }],
        },
      ],
      {
        instanceId: CODEX,
        model: "gpt-5.6-sol",
        options: [{ id: "reasoningEffort", value: "low" }],
      },
    );

    expect(favorites).toEqual([]);
  });
});
