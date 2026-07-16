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

## Symbol atlases — exact 2:1 sheet

Shared constraints: exact 4-column × 2-row atlas; seven isolated icons in the first seven cells; bottom-right cell intentionally empty; every cell equal size; each icon centered and fully inside its cell; pure black background; no shadows crossing cells; no text, labels, numbers, frames, or repeated icons.

- **Inferno Relics:** sunsteel coin, horned gold ring, faceted flame crystal, ember blade, magma drop, dragon-scale shield, elaborate flame crown collector.
- **Frostbound Treasures:** ice-sun medallion, frozen orbit ring, faceted frost star, comet shard, frozen water drop, snow-leaf shield, elaborate frost crown collector.
- **Verdant Relics:** golden seed medallion, vine ring, amethyst flower crystal, blossom dagger, dew orb, leaf shield, elaborate ancient bloom collector.
- **Cosmic Artifacts:** stellar coin, ringed planet, nova crystal, comet lantern, stardust drop, void shield, elaborate void crown collector.
- **Tempest Arsenal:** thunder seal, storm ring, lightning star, thunder blade, rain gem, wing shield, elaborate storm core collector.
- **Abyssal Treasures:** pearl medallion, coral ring, deep-sea crystal, trident shard, water drop, royal shell shield, elaborate trench key collector.

## Export map

- backgrounds: 1672 × 941 JPG;
- companions: 1254 × 1254 transparent RGBA PNG cutouts;
- mood overlays: 1672 × 941 JPG;
- symbol atlases: 1774 × 887 JPG;
- runtime location: `assets/factory/`;
- mapping and combination logic: `asset-catalog.js`.

The mood modifier can be appended to any future background or companion prompt immediately before the shared art direction. Companion masters are generated against a single flat chroma field, then converted to edge-cleaned RGBA PNG cutouts so no black or square canvas appears in the builder, cabinet, or cinematic layer. Runtime mood overlays avoid duplicating the six backgrounds and six companions, which keeps all 144 theme × companion × mood combinations available from only 16 conceptual layer assets.

## Sky Runner bonus plane

The bonus aircraft is an original, unbranded fantasy-casino biplane. It does not reproduce a real operator logo, aircraft livery, or protected game UI.

Generation prompt:

> Create one original heroic fantasy casino biplane as a clean isolated game asset, dramatic front-left three-quarter view, nose pointing toward the upper right, wings level and fully visible, vivid glossy casino red fuselage and wings with intricate polished gold filigree trim, bright brass radial engine, red tail fins, small warm engine glow and restrained magical sparks, premium modern slot-game key-art finish, readable silhouette at small size, crisp hard-surface materials, no pilot visible, no text, no letters, no numbers, no logo, no UI, no watermark, no border. Center the entire aircraft with generous breathing room on a perfectly uniform flat chroma green background (#00FF00), with no green reflections or spill on the aircraft.

Workflow:

- generated master: \`tmp/imagegen/sky-runner-plane-red-v1-chroma.png\` during production;
- chroma removed with the image-generation skill’s edge-cleaned chroma-key helper;
- runtime output: \`assets/sky-runner-plane-cutout-v1.png\`;
- export: 1536 × 1024 RGBA PNG with true transparency;
- CSS always uses \`object-fit: contain\` and a fixed 3:2 plane stage, so the artwork is never stretched;
- the selected World Forge environment remains a separate layer behind the plane and supplies all bonus-scene accent colors.
