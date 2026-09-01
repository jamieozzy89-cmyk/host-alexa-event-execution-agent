import type { CandidateProduct } from "../domain/types.js";
import type { ProductCatalogueAdapter } from "../tools/types.js";

interface PriceSeed {
  base: number;
  perUnit: number;
}

const PRICE_SEEDS: Record<string, PriceSeed> = {
  pasta: { base: 0.8, perUnit: 0.0024 },
  tomatoes: { base: 0.9, perUnit: 0.0026 },
  onion: { base: 0.4, perUnit: 0.45 },
  basil: { base: 1.1, perUnit: 0.4 },
  lettuce: { base: 0.9, perUnit: 0.65 },
  cucumber: { base: 0.7, perUnit: 0.65 },
  lemon: { base: 0.5, perUnit: 0.4 },
  lime: { base: 0.5, perUnit: 0.35 },
  berries: { base: 1.5, perUnit: 0.006 },
  "oat-yogurt": { base: 1.2, perUnit: 0.004 },
  "black-beans": { base: 0.8, perUnit: 0.0025 },
  tortillas: { base: 1.0, perUnit: 0.15 },
  peppers: { base: 1.0, perUnit: 0.7 },
  chickpeas: { base: 0.8, perUnit: 0.0024 },
  "coconut-milk": { base: 1.0, perUnit: 0.003 },
  rice: { base: 0.8, perUnit: 0.0025 },
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export class DemoProductCatalogueAdapter implements ProductCatalogueAdapter {
  async getCandidates(params: {
    itemId: string;
    name: string;
    quantity: number;
    currency: string;
  }): Promise<CandidateProduct[]> {
    const seed = PRICE_SEEDS[params.itemId] ?? { base: 1, perUnit: 0.01 };
    const estimated = Math.max(0.5, seed.base + seed.perUnit * params.quantity);
    return [
      { id: `${params.itemId}-value`, name: `Value ${params.name}`, price: roundMoney(estimated * 0.9), currency: params.currency },
      { id: `${params.itemId}-standard`, name: `Standard ${params.name}`, price: roundMoney(estimated), currency: params.currency },
      { id: `${params.itemId}-premium`, name: `Premium ${params.name}`, price: roundMoney(estimated * 1.35), currency: params.currency },
    ];
  }
}
