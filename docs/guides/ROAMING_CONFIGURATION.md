# Roaming installation and configuration

Current setup reference. [README](../../README.md) is the short entry point; [FEATURE_DETAILS](../FEATURE_DETAILS.md) owns behaviour rules; [release guide](ROAMING_RELEASE.md) owns packaging/rollback. Older narrative/examples remain in the dated README snapshot (development reference retained privately).

## Install the roaming cat

For the consumer candidate, use the single-file [Pixel Cat installation guide](PIXEL_CAT_INSTALL.md). Public Marketplace distribution is pending. The following six-module route remains a developer/rollback option; do not load it alongside the bundle:

```yaml
- url: /local/pixel-cat-roaming-art.js?v=1
  type: module
- url: /local/pixel-cat-roaming-extras.js?v=1
  type: module
- url: /local/pixel-cat-affordances.js?v=1
  type: module
- url: /local/pixel-cat-behaviours.js?v=1
  type: module
- url: /local/pixel-cat-roaming.js?v=1
  type: module
- url: /local/pixel-cat-climbing.js?v=1
  type: module
```


Bump URL versions and reload clients after updates. Node/Studio are development tools, not HA runtime requirements. The candidate manifest now targets the single Pixel Cat bundle.

Picker-created companions choose a random name, colour and igloo/simple bed once. Explicit saved settings win. Enabled visible default homes include a mouse even when the post cannot fit.

Minimal YAML (older opt-in behaviour defaults):

```yaml
type: custom:pixel-cat-home
cat_id: dashboard-cat
```


HA picker: **Pixel Cat → Cat companion / Performance monitor**. The guided editor preserves advanced YAML; previews create no actor. Save through HA, not runtime controls. Another companion card adds another independent cat; use stable distinct IDs.

## Appearance and defaults

| Setting | Rule |
| --- | --- |
| `name`, `color` | Picker saves random choices once; explicit values win. Omitted manual colour can change on a fresh mount. |
| `cell_size` | Integer 1–6 for furniture/toys and adult-sized bodies. Legacy mixed home scales remain supported. Shared toys retain spawning scale. |
| `life_stage` | `kitten`, `adult` (default) or `senior`. Kitten body cells are half `cell_size`; adult/senior retain current size and behaviour. No ageing or behaviour modifiers in V1. |
| `bed_style` | `igloo` or `simple`; open beds skip doorway emergence. |
| `bed_primary_color`, `bed_secondary_color` | Shell/lining colours; derived shading retained. `igloo_color` remains primary fallback. |
| `show_home`, `show_controls` | Independent. Picker hides controls; enable them under Advanced settings. |
| `arrival: igloo` | Once per mounted resident; hidden/unsafe narrow homes skip. Existing omitted-arrival configs retain startup behaviour. |
| `primary_home` | Picker marks the first home; old cards use fallback, conflicting primaries show edit-mode warning. Not global scale authority yet. |
| `show_scratching_post: false` | Hide home post; legacy `scratching_posts: false` respected. Below 59 native cells of home width, omit it rather than overlap furniture. |
| `home_mouse: false` | Disable the mouse for an enabled visible home; spawns beside its post or on the home floor without a post. Requires shared dashboard props. |
| `igloo_interactions: false` | Disable rare roof perch/shell scratch. |
| `outline` | `auto` (default), `none`, `black` or `white`; helps very light or dark fur read against the theme. |
| `floor_shadow: false` | Hide the soft shadow under the cat. |
| `card_color`, `card_border_color`, `card_radius` | Card shell colours and rounding (`card_radius` clamps to 0–40 px). |
| `card_background_transparency` | 0–100; 100 makes the card background fully transparent behind the cat. |
| `include_bed`, `include_bowl` | Furniture opt-outs; bed colour fields become irrelevant when the bed is omitted. |
| `bowl_primary_color`, `bowl_secondary_color` | Bowl shell and rim colours. |
| `post_type` | `post` (default) or `tree`; `tree_levels` accepts `1` or `2` and only applies to a tree. |
| `scratch_debris` | `small` (default), `pixel` or `none`; chooses the bits shed while scratching and climbing. |


```yaml
bed_style: simple # igloo, simple or box
bed_primary_color: "#aa6627"
bed_secondary_color: "#964252"
include_bed: true
include_bowl: true
bowl_primary_color: "#f5ad68"
bowl_secondary_color: "#c95e4b"
show_scratching_post: true
post_type: post
outline: auto
floor_shadow: true
card_color: "#fffaf3"
card_background_transparency: 0
card_border_color: "#e3d9cb"
card_radius: 12
scratch_debris: small
```


## Tune pace, rest and personality

Pace and rest keys are per cat. Leave one out to keep the age-appropriate default; values are native pixel cells per step and milliseconds of rest.

| Setting | Rule |
| --- | --- |
| `walk_speed` | Fallback walking speed when no urgency-specific value is set. Clamped to 1–60. |
| `relaxed_speed`, `casual_speed`, `interested_speed`, `prompted_speed` | Per-urgency speeds: ordinary walking, meandering, investigating and user-requested trips. |
| `rest_ms`, `home_rest_ms` | Rest on a discovered surface and rest at home. |
| `idle_frame_ms` | Frame time for idle sequences, minimum 80 ms (default 250); higher is calmer. |
| `walk_head_bob` | `auto` (varied, default), `cycle` (alternate every gait cycle), `step` (per step), or force `high`/`low`. |
| `temperament` | `boldness`, `sociability`, `curiosity`, `patience`, each 0–1; missing keys keep the seeded default. |
| `mood_preset` | `natural`, `playful`, `relaxed` or `alert`; nudges the drifting mood baseline. `mood_seed` repeats a familiar drift. |
| `settling_mode` | `active`, `default`, `extended` or `custom`; with `custom`, set `settle_after_minutes`, `settled_rest_min_minutes` and `settled_rest_max_minutes`. |
| `casual_wander` | `false` removes the occasional wander from ordinary walking. |
| `playful_pounces` | `false` skips the rare unprompted pounce invitation. |
| `start_paused` | Mount with the cat paused until you press Pause/Resume. |


```yaml
type: custom:pixel-cat-home
cat_id: calm-cat
name: Juniper
color: '#8d7f6a'
cell_size: 2
life_stage: senior
walk_speed: 6
relaxed_speed: 6
casual_speed: 4
interested_speed: 12
rest_ms: 20000
home_rest_ms: 24000
idle_frame_ms: 320
walk_head_bob: auto
temperament: {boldness: 0.25, sociability: 0.5, curiosity: 0.35, patience: 0.9}
mood_preset: relaxed
mood_seed: 4711
settling_mode: custom
settle_after_minutes: 8
settled_rest_min_minutes: 12
settled_rest_max_minutes: 25
casual_wander: false
```


## Enable moods, social play and toys

Picker enables the seven core switches below. Existing explicit settings are preserved; minimal YAML needs opt-ins:

```yaml
type: custom:pixel-cat-home
cat_id: living-room-cat
name: Miso
color: '#ad6c2d'
mood_behaviour: true
social_behaviour: true
interaction_behaviour: true
dashboard_props: true
prop_reactions: true
landing_reactions: true
startle_followups: true
```


Other optional switches: `toy_carrying`, `toy_hunting`, `bowl_eating`, `post_rest_behaviour`, `post_meal_behaviour`, `draggable`, `horizontal_apex`, `click_attention`, `local_exploration`, `point_routes`, `third_party_awareness`, `exertion_behaviour`, `effects`, `post_wiggle`, `card_climbing`, `native_vertical_surfaces`, `use_surface_candidates`. Set false to opt out. `social_sight_cells` (24–240, default 110) tunes how far social noticing reaches; `effects: false` also silences scratching debris and particles. These controls do not imply care obligations or guaranteed interactions. Use [detailed contracts](../FEATURE_DETAILS.md) for eligibility/contact/interruption rules.

## Chasing

The editor’s **Chasing** switch lets each cat choose to follow motion it sees on its own surface or across cards. The observing cat needs social and interaction behaviour enabled. The cat being watched can carry on independently. Older dashboard-chase flags can be removed from saved YAML. A follow needs a clear landing and a way back. Use **Behaviour Lab → Chase across cards** to make chase reactions easier to see.

**Behaviour Lab → Scratch card edges** offers standing scratches on reachable exposed card edges. Cats need native surfaces, social behaviour and interaction behaviour enabled; climbing can stay off. Each cat can decline or wait for a safe stance and way home. Choose **Natural behaviour** to end the focus. Counters distinguish attempted approaches, completed scratches with paw contact, and interruptions. [Surface and lifecycle rules](../design/VERTICAL_SURFACE_TRANSFERS.md#behaviour-lab-edge-scratching).

## Hide the home card

```yaml
type: custom:pixel-cat-home
cat_id: dashboard-cat
show_home: false
show_controls: false
```


Hidden residents use a suitable visible foreign support; wait invisibly if none exists. No phantom hidden home support. Sections/masonry gap and physical-mobile behaviour remain audit targets.

## More YAML examples

### A quiet companion

```yaml
type: custom:pixel-cat-home
cat_id: quiet-companion
name: Nori
color: '#414b55'
cell_size: 2
life_stage: adult
show_home: true
show_controls: false
include_bed: true
bed_style: simple
bed_primary_color: '#8a94a3'
bed_secondary_color: '#d8dde3'
include_bowl: true
show_scratching_post: true
outline: auto
floor_shadow: true
casual_speed: 6
relaxed_speed: 9
rest_ms: 16000
home_rest_ms: 22000
idle_frame_ms: 280
temperament: {boldness: 0.3, curiosity: 0.4, patience: 0.8}
mood_preset: relaxed
casual_wander: false
click_attention: true
debug_labels: false
debug_names: false
debug_mood: false
```


### Two cats sharing the dashboard

```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:pixel-cat-home
    cat_id: miso
    name: Miso
    color: '#ad6c2d'
    cell_size: 2
    bed_style: igloo
    bed_primary_color: '#aa6627'
    bed_secondary_color: '#964252'
    mood_behaviour: true
    mood_preset: playful
    mood_seed: 12
    social_behaviour: true
    interaction_behaviour: true
    dashboard_props: true
    toy_mice: 2
    toy_balls: 1
    prop_reactions: true
    landing_reactions: true
    startle_followups: true
    shared_home_surfaces: true
    relaxed_speed: 12
    temperament: {curiosity: 0.9, boldness: 0.7, patience: 0.3}
    debug_labels: false
  - type: custom:pixel-cat-home
    cat_id: nori
    name: Nori
    color: '#414b55'
    cell_size: 2
    bed_style: simple
    bed_primary_color: '#8a94a3'
    bed_secondary_color: '#d8dde3'
    mood_behaviour: true
    mood_preset: relaxed
    mood_seed: 7
    social_behaviour: true
    interaction_behaviour: true
    dashboard_props: true
    toy_mice: 2
    toy_balls: 1
    prop_reactions: true
    landing_reactions: true
    startle_followups: true
    shared_home_surfaces: true
    relaxed_speed: 6
    rest_ms: 20000
    temperament: {curiosity: 0.3, boldness: 0.2, patience: 0.9}
    debug_labels: false
```


### Cats in one card without a starter dock

Use `cats` on a single card to run several residents from one card entry. By default the card paints nothing: no bed, no bowl and no card chrome, and each cat lives on an ordinary dashboard surface and roams freely. Residents start on different visible surfaces where the view offers them, and spread out when they share one. The first entry is marked `primary_home`; set `show_home: true` on an entry to give that cat its own dock again.

The card entry supplies only `cell_size`, card chrome and the feature switches (`mood_behaviour`, `social_behaviour`, `interaction_behaviour`, props, reactions). Personality settings stay per entry: `temperament` (`boldness`, `sociability`, `curiosity`, `patience`), `relaxed_speed`, `casual_speed`, `interested_speed`, `prompted_speed`, `rest_ms`, `home_rest_ms`, `casual_wander` and `playful_pounces`. Entries without their own values get slot defaults: the first cat is brisk and curious (fast walk, short rests, no meandering), the second is slow and restful (slow amble, long loafs and naps); further entries alternate.

```yaml
type: custom:pixel-cat-home
cell_size: 2
mood_behaviour: true
mood_preset: playful
mood_seed: 21
social_behaviour: true
interaction_behaviour: true
dashboard_props: true
toy_mice: 2
click_attention: true
cats:
  - cat_id: miso
    name: Miso
    color: '#ad6c2d'
    temperament: {boldness: 0.9, curiosity: 1, patience: 0.2}
    relaxed_speed: 16
    casual_speed: 9
    interested_speed: 22
    rest_ms: 4000
    home_rest_ms: 5000
    casual_wander: false
    playful_pounces: true
  - cat_id: nori
    name: Nori
    color: '#414b55'
    temperament: {boldness: 0.2, curiosity: 0.2, patience: 1}
    relaxed_speed: 5
    casual_speed: 4
    rest_ms: 30000
    home_rest_ms: 34000
    casual_wander: true
    playful_pounces: false
```

Each resident keeps independent clocks, routes, mood, pace and rest profile, and the pair uses the normal same-view social rules. `shared_dock: true` gives the card one dock instead: the first entry owns the bed, bowl and controls and is primary, later entries draw no furniture, keep their own clocks and mood, and return home to the same floor. `shared_dock: false` gives every entry its own dock again; `columns` then controls that grid and defaults to the number of cats.

### One shared dock

```yaml
type: custom:pixel-cat-home
cell_size: 2
shared_dock: true
mood_behaviour: true
social_behaviour: true
interaction_behaviour: true
cats:
  - cat_id: miso
    name: Miso
    color: '#ad6c2d'
  - cat_id: nori
    name: Nori
    color: '#414b55'
    temperament: {boldness: 0.4, curiosity: 0.5, patience: 0.7}
```

The first entry keeps the bed, bowl and controls; later entries own no furniture but keep their own clocks. Clicking those controls only affects the first cat. For one dock per entry use `shared_dock: false` with `columns: 2`:

```yaml
type: custom:pixel-cat-home
cell_size: 2
shared_dock: false
columns: 2
cats:
  - cat_id: miso
    name: Miso
  - cat_id: nori
    name: Nori
    bed_style: simple
```

### Climbing, tree and toys

```yaml
type: custom:pixel-cat-home
cat_id: climb-cat
name: Pip
cell_size: 2
show_scratching_post: true
post_type: tree
tree_levels: 2
scratch_debris: small
card_climbing: true
native_vertical_surfaces: true
use_surface_candidates: true
climb_speed: 2
climb_release_drop: 36
post_wiggle: true
dashboard_props: true
toy_mice: 3
toy_balls: 2
toy_carrying: true
toy_hunting: true
social_behaviour: true
interaction_behaviour: true
```

`climb_speed` clamps to 0.25–3 and `climb_release_drop` to 8–100 native cells. `native_vertical_surfaces` enables scratch faces on ordinary cards and needs social and interaction behaviour; `use_surface_candidates: false` keeps interior card candidates out of the route graph.

### Debugging routes and surfaces

```yaml
type: custom:pixel-cat-home
cat_id: debug-cat
name: Debug
show_controls: true
debug_labels: true
debug_name_below: true
debug_action_below: true
debug_names: false
debug_action_above: false
debug_mood: true
debug_surfaces: true
debug_paths: true
debug_pois: true
debug_vertical_surfaces: true
```

The debug toggles draw temporary overlays only; they do not change routes, contacts or saved settings. Turn them off before screenshots or everyday use. [Diagnostic guide](CAT_DEBUG.md) explains the reports.

## Debug and performance

Enable `debug_labels: true` for name/action below the cat; mood uses tint/text colour. `debug_names` is a separate above-cat name; `debug_mood` controls glow. Picker diagnostics default off. Shared actor-free monitor:

```yaml
type: custom:pixel-cat-home
mode: monitor
```


The legacy `custom:pixel-cat-monitor` type also remains usable. Monitor measures foreground browser scheduling, not CPU/GPU or guaranteed physical-device FPS. [Diagnostic guide](CAT_DEBUG.md) owns controls/reports and interpretation.

## Install the original card

Separate self-contained implementation; it does not roam across the dashboard:

```yaml
url: /local/pixel-pet-card.js?v=1
type: module
```

```yaml
type: custom:pixel-pet-card
title: Pixel Pet
height: 420
view_mode: cat_focus
show_controls: false
```


[Original configuration guide](PIXEL_PET_CARD.md). Preserve existing original/stick custom-element compatibility when updating roaming modules.
