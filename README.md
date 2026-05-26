# Games

This project is a small browser game prototype built with plain HTML, CSS,
JavaScript modules, Firebase Realtime Database, and local JSON catalogs.

Run locally from this folder with:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8000/home.html
```

## Page Flow

- `home.html`: login/register entry.
- `lobby.html`: world selection and world creation.
- `character.html`: first-time character creation.
- `main-lobby.html`: main world hub after selecting a world.
- `customize-character.html`: player loadout page with character, relic, and Wordbook tabs.
- `tower.html`: active tower climb with floor-by-floor combat and special floors.
- `world.html`: world page.
- `control.html`: admin/control page.

## Player Data Shape

Player records live under:

```text
Game1/Players/{username}
```

Important character fields:

- `character.name`: displayed character name.
- `character.classId`: class key from `class-stats.json`.
- `character.className`: display name copied from the selected class.
- `character.stats`: copied starting stats from `class-stats.json`.
- `character.unlockedTitles`: array of title IDs from `character-titles.json`.
- `character.selectedTitle`: active title ID.
- `character.title`: display title text, kept for older UI compatibility.
- `character.spriteId`: current temporary CSS sprite variant.
- `character.spriteSkin`: future image-based sprite skin folder.
- `character.unlockedRelics`: relic IDs the player owns.
- `character.equippedRelics`: up to 3 relic IDs currently equipped.
- `character.savedAttacks`: 8 saved words for the Wordbook.
- `towerFloorRecord`: current player floor record shown in the main lobby.
- `towerBest`: highest floor reached by the current player.
- `towerRun`: active temporary climb state. Removed when the player dies.

World tower records live under:

```text
Game1/Worlds/{worldId}/tower/floorRecord
```

`main-lobby.html` normalizes missing tower records to `1` and keeps the world
record at least as high as the current player's best floor.

## Tower Runs

Tower run state lives under:

```text
Game1/Players/{username}/towerRun
```

The run includes temporary fields such as `floor`, `runLevel`, `xp`, `hp`,
`potions`, `relics`, `skills`, `temporaryUpgrades`, `effects`, and
`currentEncounter`.

Combat, sanctuary floors, event floors, elite floors, and boss floors are all
generated from the current floor number. Death removes `towerRun`, so temporary
run progress is lost while permanent records such as `towerBest` remain.

## JSON Catalogs

- `class-stats.json`: available classes and starting stats.
- `character-titles.json`: all possible titles. Players only see unlocked title IDs.
- `relics.json`: all possible relics. Players only equip unlocked relic IDs.
- `daily-good-conditions.json`: positive daily modifiers.
- `daily-bad-conditions.json`: negative daily modifiers.

JSON files may include `_documentation` records. UI code must ignore records
whose keys start with `_`.

## Daily Conditions

`main-lobby.html` loads the good and bad condition catalogs. The current date is
used as a deterministic seed, so every player sees the same conditions on the
same calendar day.

Daily count patterns currently rotate between:

- 2 good, 0 bad
- 1 good, 1 bad
- 2 good, 0 bad
- 0 good, 2 bad

## Assets

Asset expectations are documented in `resources.txt`. Player sprite images are
intended to eventually use:

```text
sprites/player/{classId}/{skinId}/{view}.png
```

Example:

```text
sprites/player/warrior/default/front.png
```
