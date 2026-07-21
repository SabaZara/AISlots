export const THEMES = Object.freeze([
  Object.freeze({ id: "fire", name: "Fire", action: "Ignite", accent: "#ff7a2f", secondary: "#ff3424", asset: "./assets/factory/theme-fire-v2.png", bonusLoading: "./assets/factory/bonus-loading-fire-v1.jpg", planeAsset: "./assets/factory/plane-fire-cutout-v1.png" }),
  Object.freeze({ id: "ice", name: "Ice", action: "Shatter", accent: "#62e8ff", secondary: "#b5caff", asset: "./assets/factory/theme-ice-v2.png", bonusLoading: "./assets/factory/bonus-loading-ice-v1.jpg", planeAsset: "./assets/factory/plane-ice-cutout-v1.png" }),
  Object.freeze({ id: "nature", name: "Nature", action: "Awaken", accent: "#66ee83", secondary: "#b9ed5a", asset: "./assets/factory/theme-nature-v2.png", bonusLoading: "./assets/factory/bonus-loading-nature-v1.jpg", planeAsset: "./assets/factory/plane-nature-cutout-v1.png" }),
  Object.freeze({ id: "void", name: "Void", action: "Warp", accent: "#c172ff", secondary: "#7159ff", asset: "./assets/factory/theme-void-v2.png", bonusLoading: "./assets/factory/bonus-loading-void-v1.jpg", planeAsset: "./assets/factory/plane-void-cutout-v1.png" }),
  Object.freeze({ id: "reef", name: "Coral Reef", action: "Dive", accent: "#55e8ed", secondary: "#ff75bd", asset: "./assets/factory/theme-reef-v1.png", bonusLoading: "./assets/factory/bonus-loading-reef-v1.png", planeAsset: "./assets/factory/plane-reef-cutout-v1.png" }),
  Object.freeze({ id: "temple", name: "Golden Temple", action: "Discover", accent: "#f7c95a", secondary: "#76bd63", asset: "./assets/factory/theme-temple-v1.png", bonusLoading: "./assets/factory/bonus-loading-temple-v1.png", planeAsset: "./assets/factory/plane-nature-cutout-v1.png" }),
  Object.freeze({ id: "eclipse", name: "Eclipse", action: "Ascend", accent: "#ffc85b", secondary: "#a67947", asset: "./assets/factory/theme-eclipse-v1.png", bonusLoading: "./assets/factory/bonus-loading-eclipse-v1.png", planeAsset: "./assets/factory/plane-fire-cutout-v1.png" })
]);

export const COMPANIONS = Object.freeze([
  Object.freeze({ id: "valkyrie", name: "Valkyrie", asset: "./assets/factory/companion-valkyrie-cutout-v3.png" }),
  Object.freeze({ id: "dragon", name: "Dragon", asset: "./assets/factory/companion-dragon-cutout-v4.png" }),
  Object.freeze({ id: "direwolf", name: "Direwolf", asset: "./assets/factory/companion-direwolf-cutout-v3.png" }),
  Object.freeze({ id: "kraken", name: "Assassin", asset: "./assets/factory/companion-kraken-cutout-v4.png" }),
  Object.freeze({ id: "titan", name: "Vampire Queen", asset: "./assets/factory/companion-titan-cutout-v4.png" }),
  Object.freeze({ id: "tiger", name: "Tiger", asset: "./assets/factory/companion-tiger-cutout-v3.png" }),
  Object.freeze({ id: "gorilla", name: "Gorilla", asset: "./assets/factory/companion-gorilla-cutout-v3.png" }),
  Object.freeze({ id: "sorceress", name: "Arcane Sorceress", asset: "./assets/factory/companion-sorceress-cutout-v3.png" })
]);

export const MOODS = Object.freeze([
  Object.freeze({ id: "epic", name: "Epic", description: "Legendary adventure", asset: "./assets/factory/mood-epic-v1.jpg" }),
  Object.freeze({ id: "arcane", name: "Arcane", description: "Ancient magic", asset: "./assets/factory/mood-mystic-v1.jpg" }),
  Object.freeze({ id: "playful", name: "Playful", description: "Joyful energy", asset: "./assets/factory/mood-playful-v1.jpg" }),
  Object.freeze({ id: "shadow", name: "Shadow", description: "Dangerous ancient power", asset: "./assets/factory/mood-dark-v1.jpg" })
]);

const SYMBOL_IDS = Object.freeze(["luma", "orbit", "nova", "comet", "dew", "leaf", "petal"]);

function symbolNames(values) {
  return Object.freeze(Object.fromEntries(SYMBOL_IDS.map((id, index) => [id, values[index]])));
}

export const SYMBOL_SETS = Object.freeze([
  Object.freeze({ id: "inferno", name: "Inferno Relics", collector: "Rebirth Scatter", asset: "./assets/factory/symbols-inferno-transparent-v3.png", scatterAsset: "./assets/factory/scatter-inferno-v1.png", names: symbolNames(["Phoenix Coin", "Rebirth Feather", "Violet Egg", "Skywing Blade", "Ashen Urn", "Ember Temple", "Rebirth Scatter"]) }),
  Object.freeze({ id: "frost", name: "Frostbound Treasures", collector: "Dragon Scatter", asset: "./assets/factory/symbols-frost-transparent-v3.png", scatterAsset: "./assets/factory/scatter-frost-v1.png", names: symbolNames(["Snow Sun", "Frost Key", "Sapphire Flake", "Ice Spear", "Winter Globe", "Winged Shield", "Dragon Scatter"]) }),
  Object.freeze({ id: "verdant", name: "Verdant Relics", collector: "World Tree Scatter", asset: "./assets/factory/symbols-verdant-transparent-v3.png", scatterAsset: "./assets/factory/scatter-verdant-v1.png", names: symbolNames(["Amber Seed", "Fern Feather", "Lotus Bloom", "Vine Dagger", "Dew Terrarium", "Jungle Gate", "World Tree Scatter"]) }),
  Object.freeze({ id: "cosmic", name: "Cosmic Artifacts", collector: "Titan Scatter", asset: "./assets/factory/symbols-cosmic-transparent-v3.png", scatterAsset: "./assets/factory/scatter-cosmic-v1.png", names: symbolNames(["Eclipse Coin", "Comet Feather", "Violet Nova", "Meteor Lance", "Galaxy Orb", "Void Portal", "Titan Scatter"]) }),
  Object.freeze({ id: "tempest", name: "Tempest Arsenal", collector: "Valkyrie Scatter", asset: "./assets/factory/symbols-tempest-transparent-v3.png", scatterAsset: "./assets/factory/scatter-tempest-v1.png", names: symbolNames(["Thunder Coin", "Storm Feather", "Storm Eye", "Thunder Lance", "Rain Orb", "Storm Tower", "Valkyrie Scatter"]) }),
  Object.freeze({ id: "coral", name: "Coral Treasures", collector: "Kraken Scatter", asset: "./assets/factory/symbols-coral-transparent-v3.png", scatterAsset: "./assets/factory/scatter-coral-v1.png", names: symbolNames(["Pearl Coin", "Coral Feather", "Jelly Star", "Tide Trident", "Wave Orb", "Shell Temple", "Kraken Scatter"]) })
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

export const VISUAL_COMBINATION_COUNT = THEMES.length * COMPANIONS.length * MOODS.length * SYMBOL_SETS.length;

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
