# World Forge Asset Prompt Catalog

These are the enhanced production prompts used for the modular AISlots art system. All assets are original generated illustrations with no text, logos, UI, watermarks, brands, or recognizable copyrighted characters.

## Shared art direction

Append this direction to every prompt:

> Premium modern fantasy slot-game key art, polished stylized 3D illustration, rich physically plausible materials, crisp silhouette separation, controlled bloom, cinematic depth, premium casino-game finish, original design, no text, no letters, no numbers, no logos, no UI, no watermark, no border.

Mood modifiers:

- **Epic:** heroic golden rim lighting, monumental scale, triumphant atmosphere, energetic ember-like particles.
- **Mystic:** soft luminous particles, layered ethereal fog, ancient mysterious atmosphere, violet and cyan accents.
- **Playful:** bright saturated color, whimsical exaggerated forms, buoyant lighthearted energy, clean cheerful highlights.
- **Dark:** heavy shadow masses, ominous red or violet rim accents, foreboding atmosphere, deeper contrast.

## Theme backgrounds — 16:9 landscape

Shared constraints: reserve the central 55% as a low-detail, darker negative-space stage for a readable reel cabinet; concentrate landmarks and lighting around the outer thirds; environment only; no creatures or people.

- **Fire:** A volcanic fantasy sanctuary above rivers of molten lava, drifting embers rising through hot air, jagged cracked obsidian formations framing both sides, distant caldera glow, warm orange and crimson illumination, dark calm central play area.
- **Ice:** A monumental frozen sanctuary between translucent glacier walls, pale aurora across a cold sky, fine drifting snow, faceted ice ridges on the edges, icy blue and white illumination, dark calm central play area.
- **Nature:** An ancient jungle temple swallowed by moss and roots, emerald bioluminescent plants, weathered stone ruins on the outer thirds, dense canopy and soft shafts of green light, dark calm central play area.
- **Void:** A cosmic temple suspended above a deep black nebula, fractured floating rock shards at the edges, swirling violet gas and faint starlight, impossible depth, dark calm central play area.
- **Storm:** A ruined sky citadel under churning thunderheads, distant fork lightning, wind-driven rain and mist, broken pillars on the outer thirds, dramatic gray and electric-blue illumination, dark calm central play area.
- **Abyss:** A lost shrine in a deep-ocean trench, crushing dark water, faint bioluminescent glow rising from below, drifting marine particles, rock walls and coral silhouettes around the edges, deep teal and black, dark calm central play area.

## Companions — square portrait

Shared constraints: exactly one full creature or warrior, centered, front three-quarter pose, entire silhouette visible with breathing space, plain near-black studio field for clean screen-blended isolation, no scenery, no pedestal, no circular frame, no duplicate figure.

- **Dragon:** A majestic armored dragon coiled and ready to strike, molten light between layered scales, long sharp horns, intelligent glowing eyes, wings folded into a powerful compact silhouette.
- **Valkyrie:** An original armored valkyrie warrior with luminous feathered wings, ornate winged helm, engraved plate armor, heroic grounded stance, face unobstructed, no resemblance to a real person.
- **Kraken:** A colossal ancient kraken facing forward, wet iridescent skin, several tentacles curling toward the viewer, luminous intelligent eyes, suction cups and surface detail sharply separated.
- **Phoenix:** A blazing phoenix with wings spread in a broad upward arc, feathers made of fire and light, bright crown plumage, elegant readable silhouette, controlled flame wisps.
- **Direwolf:** A massive armored direwolf braced to leap, bristling layered fur, luminous eyes, engraved shoulder armor, powerful paws and clean ear silhouette.
- **Titan:** A towering stone-and-crystal titan, faceted mineral armor, glowing cracks across its body, broad ancient face, monumental shoulders and hands, original nonhuman design.

## Mood overlays — transparent-look 16:9 plates

Generate against a pure black field so CSS screen blending preserves only the light. Keep the central reels mostly clear and place detail around the perimeter.

- **Epic:** sweeping gold rim-light arcs, radiant corner flares, upward sparks, heroic warm energy concentrated around the edges.
- **Mystic:** cyan-violet wisps, soft floating motes, layered ethereal fog curls and delicate ancient energy filaments around the perimeter.
- **Playful:** buoyant saturated color trails, star-like confetti lights, rounded magical sparks and cheerful edge glows.
- **Dark:** deep crimson-violet smoke, narrow ominous rim light, sparse embers and shadowy tendrils around the perimeter.

## Symbol atlases — exact 2:1 transparent sheet

Shared constraints: exact 4-column × 2-row atlas; seven isolated icons in the first seven cells; bottom-right cell intentionally empty; every cell equal size; each icon centered and fully inside its cell; one flat chroma field for soft-matte removal; no shadows crossing cells; no text, labels, numbers, plaques, frames, or repeated icons. Every family deliberately varies silhouette, dominant hue, material, and value tier so it remains readable at reel size.

- **Inferno Relics:** gold Phoenix Coin, long red Rebirth Feather, faceted purple Violet Egg, blue Skywing Blade, blue-flame Ashen Urn, dark architectural Ember Temple, white-winged Rebirth Scatter.
- **Frostbound Treasures:** silver Snow Sun, slender Frost Key, radial Sapphire Flake, long Ice Spear, round Winter Globe, broad Winged Shield, horned Dragon Scatter.
- **Verdant Relics:** amber seed coin, curved emerald Fern Feather, pink Lotus Bloom, narrow Vine Dagger, aqua Dew Terrarium, tall Jungle Gate, branching World Tree Scatter.
- **Cosmic Artifacts:** gold Eclipse Coin, silver Comet Feather, violet Nova, cyan Meteor Lance, round Galaxy Orb, broken-stone Void Portal, purple Titan Scatter.
- **Tempest Arsenal:** bronze Thunder Coin, white Storm Feather, electric-blue Storm Eye, violet Thunder Lance, aqua Rain Orb, tall silver Storm Tower, gold-and-blue Valkyrie Scatter.
- **Abyssal Treasures:** iridescent Pearl Coin, pink Coral Feather, violet Jelly Star, turquoise Tide Trident, glass Wave Orb, teal Shell Temple, tentacled Kraken Scatter.

## Export map

- backgrounds: 1672 × 941 JPG;
- companions: 1254 × 1254 transparent RGBA PNG cutouts;
- mood overlays: 1672 × 941 JPG;
- symbol atlases: 1774 × 887 transparent RGBA PNG;
- runtime location: `assets/factory/`;
- mapping and combination logic: `asset-catalog.js`.

## Transparent Scatter cutouts

Each symbol family has one separate 512 × 512 RGBA Scatter master. These are not cropped from the black-background atlas: they are generated as isolated objects on a single flat chroma field, cleaned with the image-generation skill's soft-matte chroma workflow, and exported with true transparency. Runtime files are `assets/factory/scatter-{family}-v1.png`.

All six use the shared premium slot-art direction above plus: one centered iconic object, generous breathing room, complete silhouette visible, crisp edge separation at small size, no floor, no scenery, no cast shadow outside the object, and no text, logo, UI, watermark, frame, or border.

- **Inferno Scatter:** an ornate obsidian royal crown formed from flame spires, glowing molten cracks, a central faceted ruby, restrained polished-gold filigree, volcanic red-orange light; flat chroma green source.
- **Frost Scatter:** a crystalline silver ice crown with snowflake geometry, razor-clear frozen facets, a luminous cyan heart gem, pale-blue frost light and platinum trim; flat chroma green source.
- **Verdant Scatter:** an emerald-and-gold lotus crown, layered living leaves, a radiant golden seed at its center, small green gems and elegant botanical filigree; flat chroma magenta source.
- **Cosmic Scatter:** a violet cosmic crown built around a miniature black-hole core, faceted amethysts, curved silver-gold orbital prongs and controlled purple starlight; flat chroma green source.
- **Tempest Scatter:** a winged platinum storm crest surrounding an electric-blue thunder core, angular lightning geometry, small gold accents and energetic but contained arcs; flat chroma green source.
- **Abyssal Scatter:** a silver-and-teal royal trench key crowned by a translucent jellyfish form, pearl and coral details, deep-blue gemstones and bioluminescent cyan light; flat chroma magenta source.

CSS displays these PNGs with `object-fit: contain`. Normal wins animate within the cell. Scatter collection animates only the transparent artwork beyond its stationary tile, so no rectangular atlas background can jump into neighboring cells.

The mood modifier can be appended to any future background or companion prompt immediately before the shared art direction. Companion masters are generated against a single flat chroma field, then converted to edge-cleaned RGBA PNG cutouts so no black or square canvas appears in the builder, cabinet, or cinematic layer. Runtime mood overlays avoid duplicating the six backgrounds and six companions, which keeps all 144 theme × companion × mood combinations available from only 16 conceptual layer assets.

## Theme-specific Sky Runner bonus assets

Every theme now has one 1672 × 941 loading scene and one 1536 × 1024 transparent RGBA aircraft. All are original and unbranded. The loading scenes were generated with the matching base theme as a style and world reference. The aircraft variants use the original biplane as a silhouette/camera reference, then receive a flat chroma field and the same soft-matte, despill, and edge-contraction workflow as the Scatter cutouts.

Shared loading prompt constraints: a new 16:9 launch-gate scene belonging unmistakably to the selected world; an empty central-right flight corridor; large foreground framing, readable midground launch architecture, and atmospheric far distance; one radiant destination portal; no plane, character, text, logo, UI, border, or watermark.

- **Fire:** suspended obsidian bridge over lava rivers, huge black chains, molten pylons, caldera haze, circular fire portal.
- **Ice:** translucent crystal runway across a blue chasm, near ice shards, silver pylons, aurora, circular frost portal.
- **Nature:** vine-and-stone sky terrace above jungle canopy, foreground roots and leaves, misty ruins, waterfalls, circular leaf portal.
- **Void:** fractured floating runway over a cosmic gulf, near amethyst shards, orbital structures, nebula depth, gravity portal.
- **Storm:** rain-swept sky-citadel deck, foreground machinery and cables, lightning pylons, layered thunderclouds, electric portal.
- **Abyss:** pearl-and-brass submerged bridge, near coral arches, bioluminescent towers, deep-water haze, teal current portal.

Shared plane prompt constraints: preserve the original biplane silhouette, front-right three-quarter view, geometry, propeller, landing gear, and padding; change only material and color identity; flat green chroma except magenta for green/teal liveries; no floor, shadow, reflection, text, logo, UI, border, or watermark.

- **Fire plane:** obsidian, molten crimson, orange seams, antique gold, ruby engine.
- **Ice plane:** cobalt, frost white, cyan inlays, platinum, pale-blue engine crystal.
- **Nature plane:** emerald, bronze-gold, leaf engraving, turquoise vines, amber-green engine.
- **Void plane:** midnight black, royal violet, amethyst, dark chrome, singularity engine.
- **Storm plane:** graphite, electric blue, lightning seams, platinum, blue-white engine.
- **Abyss plane:** deep teal, midnight blue, cyan seams, pearl silver, antique brass, aquamarine engine.

Runtime files are `assets/factory/bonus-loading-{theme}-v1.jpg` and `assets/factory/plane-{theme}-cutout-v1.png`. CSS uses `object-fit: contain`, while JavaScript selects the two files from the current theme and moves the aircraft on a linear distance/time path.
