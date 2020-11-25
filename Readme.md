# Mapbox-GL Draw Passing Mode

![npm](https://img.shields.io/npm/v/mapbox-gl-draw-passing-mode?color=green)

Custom mode for [Mapbox GL Draw](https://github.com/mapbox/mapbox-gl-draw) that adds passing drawing, the ability to draw features but doesn't add them.
this can be used whenever there's a need to draw features to manipulate others, e.g., when [cutting](https://github.com/ReyhaneMasumi/mapbox-gl-draw-cut-polygon-mode) or [splitting](https://github.com/ReyhaneMasumi/mapbox-gl-draw-split-polygon-mode) features.

## Demo

See a full example in the docs folder, or check at the [**Demo**](https://mhsattarian.github.io/mapbox-gl-draw-passing-mode).

![a GIF showing usage demo](docs/demo.gif)

## Install

```shell
npm i mapbox-gl-draw-passing-mode
```

or use CDN:

```html
<script src='https://unpkg.com/mapbox-gl-draw-passing-mode'></script>
```

## Usage

```js
import mapboxGlDrawPassingMode from "mapbox-gl-draw-passing-mode.js";
// or global variable mapboxGlDrawPassingMode when using script tag

const draw = new MapboxDraw({
  modes: {
    ...MapboxDraw.modes,
    passing_mode_point: mapboxGlDrawPassingMode(MapboxDraw.modes.draw_point),
    passing_mode_line_string: mapboxGlDrawPassingMode(
      MapboxDraw.modes.draw_line_string
    ),
    passing_mode_polygon: mapboxGlDrawPassingMode(
      MapboxDraw.modes.draw_polygon
    ),
  },
});

// this will fire `draw.passing-create` event on feature draw
draw.changeMode("passing_mode_line_string");
// or pass a callback to handle drawn feature
draw.changeMode("passing_mode_line_string", (feature) => {
  console.log(feature);
});
```

when activated, these modes act like Mapbox Gl Draw default modes (`draw_point`, `draw_line_string`, and `draw_polygon`), only they don't add the feature to the map, therefore no `draw.create` event is fired.

To handle drawn features, instead of using `draw.create` event, you can pass a **callback** or use the **`draw.passing-create` event** (fired after feature is drawn and only if **callback** is not provided).

## Acknowledgement

The inspiration is from the [Radius Mode](https://gist.github.com/chriswhong/694779bc1f1e5d926e47bab7205fa559) created by @chriswhong and the discussion [here](https://github.com/mapbox/mapbox-gl-draw/issues/767#issuecomment-384833953).
