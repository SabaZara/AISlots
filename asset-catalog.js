export const THEMES = Object.freeze([
  Object.freeze({ id: "fire", name: "Fire", action: "Ignite", accent: "#ff8a32", secondary: "#ff3d57", asset: "./assets/factory/theme-fire-v1.jpg" }),
  Object.freeze({ id: "ice", name: "Ice", action: "Shatter", accent: "#7de7ff", secondary: "#a9bfff", asset: "./assets/factory/theme-ice-v1.jpg" }),
  Object.freeze({ id: "nature", name: "Nature", action: "Awaken", accent: "#6cf2a2", secondary: "#d8dc62", asset: "./assets/factory/theme-nature-v1.jpg" }),
  Object.freeze({ id: "void", name: "Void", action: "Warp", accent: "#b987ff", secondary: "#667dff", asset: "./assets/factory/theme-void-v1.jpg" }),
  Object.freeze({ id: "storm", name: "Storm", action: "Surge", accent: "#73d8ff", secondary: "#d7e4ff", asset: "./assets/factory/theme-storm-v1.jpg" }),
  Object.freeze({ id: "abyss", name: "Abyss", action: "Descend", accent: "#56e1d1", secondary: "#4e8ed8", asset: "./assets/factory/theme-abyss-v1.jpg" })
]);

export const COMPANIONS = Object.freeze([
  Object.freeze({ id: "dragon", name: "Dragon", asset: "./assets/factory/companion-dragon-cutout-v2.png" }),
  Object.freeze({ id: "valkyrie", name: "Valkyrie", asset: "./assets/factory/companion-valkyrie-cutout-v2.png" }),
  Object.freeze({ id: "kraken", name: "Kraken", asset: "./assets/factory/companion-kraken-cutout-v2.png" }),
  Object.freeze({ id: "phoenix", name: "Phoenix", asset: "./assets/factory/companion-phoenix-cutout-v2.png" }),
  Object.freeze({ id: "direwolf", name: "Direwolf", asset: "./assets/factory/companion-direwolf-cutout-v2.png" }),
  Object.freeze({ id: "titan", name: "Titan", asset: "./assets/factory/companion-titan-cutout-v2.png" })
]);

export const MOODS = Object.freeze([
  Object.freeze({ id: "epic", name: "Epic", description: "Heroic gold", asset: "./assets/factory/mood-epic-v1.jpg" }),
  Object.freeze({ id: "mystic", name: "Mystic", description: "Ethereal violet", asset: "./assets/factory/mood-mystic-v1.jpg" }),
  Object.freeze({ id: "playful", name: "Playful", description: "Bright energy", asset: "./assets/factory/mood-playful-v1.jpg" }),
  Object.freeze({ id: "dark", name: "Dark", description: "Ominous shadow", asset: "./assets/factory/mood-dark-v1.jpg" })
]);

const SYMBOL_IDS = Object.freeze(["luma", "orbit", "nova", "comet", "dew", "leaf", "petal"]);

function symbolNames(values) {
  return Object.freeze(Object.fromEntries(SYMBOL_IDS.map((id, index) => [id, values[index]])));
}

export const SYMBOL_SETS = Object.freeze([
  Object.freeze({ id: "inferno", name: "Inferno Relics", collector: "Inferno Scatter", asset: "./assets/factory/symbols-inferno-v1.jpg", scatterAsset: "./assets/factory/scatter-inferno-v1.png", names: symbolNames(["Sunsteel Coin", "Horned Ring", "Flame Crystal", "Ember Blade", "Magma Drop", "Dragon Scale", "Inferno Scatter"]) }),
  Object.freeze({ id: "frost", name: "Frostbound Treasures", collector: "Frost Scatter", asset: "./assets/factory/symbols-frost-v1.jpg", scatterAsset: "./assets/factory/scatter-frost-v1.png", names: symbolNames(["Ice Sun", "Frozen Orbit", "Frost Star", "Comet Shard", "Frozen Drop", "Snow Leaf", "Frost Scatter"]) }),
  Object.freeze({ id: "verdant", name: "Verdant Relics", collector: "Verdant Scatter", asset: "./assets/factory/symbols-verdant-v1.jpg", scatterAsset: "./assets/factory/scatter-verdant-v1.png", names: symbolNames(["Golden Seed", "Vine Ring", "Amethyst Flower", "Blossom Dagger", "Dew Orb", "Leaf Shield", "Verdant Scatter"]) }),
  Object.freeze({ id: "cosmic", name: "Cosmic Artifacts", collector: "Cosmic Scatter", asset: "./assets/factory/symbols-cosmic-v1.jpg", scatterAsset: "./assets/factory/scatter-cosmic-v1.png", names: symbolNames(["Stellar Coin", "Ringed Planet", "Nova Crystal", "Comet Lantern", "Stardust Drop", "Void Shield", "Cosmic Scatter"]) }),
  Object.freeze({ id: "tempest", name: "Tempest Arsenal", collector: "Tempest Scatter", asset: "./assets/factory/symbols-tempest-v1.jpg", scatterAsset: "./assets/factory/scatter-tempest-v1.png", names: symbolNames(["Thunder Seal", "Storm Ring", "Lightning Star", "Thunder Blade", "Rain Gem", "Wing Shield", "Tempest Scatter"]) }),
  Object.freeze({ id: "abyssal", name: "Abyssal Treasures", collector: "Abyssal Scatter", asset: "./assets/factory/symbols-abyssal-v1.jpg", scatterAsset: "./assets/factory/scatter-abyssal-v1.png", names: symbolNames(["Pearl Medallion", "Coral Ring", "Deep Crystal", "Trident Shard", "Water Drop", "Royal Shell", "Abyssal Scatter"]) })
]);

export const ANIMATION_STYLES = Object.freeze([
  Object.freeze({ id: "cascade", name: "Cascade", reelStopGap: 90, spinInterval: 165 }),
  Object.freeze({ id: "wave", name: "Wave", reelStopGap: 72, spinInterval: 205 }),
  Object.freeze({ id: "slam", name: "Impact", reelStopGap: 132, spinInterval: 235 }),
  Object.freeze({ id: "strike", name: "Strike", reelStopGap: 108, spinInterval: 145 }),
  Object.freeze({ id: "vortex", name: "Vortex", reelStopGap: 84, spinInterval: 178 })
]);

export const DEFAULT_VISUAL_CONFIG = Object.freeze({
  theme: "fire",
  companion: "dragon",
  mood: "epic",
  symbols: "inferno",
  animation: "cascade"
});

export const VISUAL_COMBINATION_COUNT = THEMES.length * COMPANIONS.length * MOODS.length * SYMBOL_SETS.length * ANIMATION_STYLES.length;

function itemFor(items, id, fallbackId) {
  return items.find((item) => item.id === id) ?? items.find((item) => item.id === fallbackId) ?? items[0];
}

export function resolveVisualConfig(config = DEFAULT_VISUAL_CONFIG) {
  return Object.freeze({
    theme: itemFor(THEMES, config.theme, DEFAULT_VISUAL_CONFIG.theme),
    companion: itemFor(COMPANIONS, config.companion, DEFAULT_VISUAL_CONFIG.companion),
    mood: itemFor(MOODS, config.mood, DEFAULT_VISUAL_CONFIG.mood),
    symbols: itemFor(SYMBOL_SETS, config.symbols, DEFAULT_VISUAL_CONFIG.symbols),
    animation: itemFor(ANIMATION_STYLES, config.animation, DEFAULT_VISUAL_CONFIG.animation)
  });
}

export function visualConfigLabel(config) {
  const resolved = resolveVisualConfig(config);
  return `${resolved.mood.name} ${resolved.theme.name} ${resolved.companion.name}`;
}
