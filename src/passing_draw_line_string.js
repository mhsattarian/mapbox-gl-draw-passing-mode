import draw_line_string from "@mapbox/mapbox-gl-draw/src/modes/draw_line_string";
import doubleClickZoom from "@mapbox/mapbox-gl-draw/src/lib/double_click_zoom";
import * as Constants from "@mapbox/mapbox-gl-draw/src/constants";

const {
  onSetup: originOnSetup,
  onMouseMove: originOnMouseMove,
  ...restOriginMethods
} = draw_line_string;

const passing_draw_line_string = {
  originOnSetup,
  originOnMouseMove,
  ...restOriginMethods,
};

passing_draw_line_string.onSetup = function (opt) {
  const state = this.originOnSetup();
  const { onDraw, onCancel } = opt;
  state.onDraw = onDraw;
  state.onCancel = onCancel;
  return state;
};

passing_draw_line_string.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.originOnMouseMove(state, e);
};

passing_draw_line_string.onStop = function (state) {
  const f = state.line;

  this.updateUIClasses({ mouse: Constants.cursors.NONE });
  doubleClickZoom.enable(this);
  this.activateUIButton();

  /// check to see if we've deleted this feature
  const drawnFeature = this.getFeature(f.id);

  try {
    if (drawnFeature === undefined) {
      /// Call `onCancel` if exists.
      if (typeof state.onCancel === "function") state.onCancel();
      return;
    }
    /// remove last added coordinate
    else f.removeCoordinate(`${state.currentVertexPosition}`);
  } catch (err) {
    console.error(
      "🚀 ~ file: passing_draw_line_string.js ~ line 58 ~ err",
      err
    );
  }

  if (f.isValid()) {
    if (typeof state.onDraw === "function") state.onDraw(f.toGeoJSON());
    else
      this.map.fire("draw.passing-create", {
        features: [f.toGeoJSON()],
      });
  } else {
    this.deleteFeature([f.id], { silent: true });
    this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

export default passing_draw_line_string;
