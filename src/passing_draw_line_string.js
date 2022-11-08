import draw_line_string from "@mapbox/mapbox-gl-draw/src/modes/draw_line_string";
import * as Constants from "@mapbox/mapbox-gl-draw/src/constants";
import doubleClickZoom from "@mapbox/mapbox-gl-draw/src/lib/double_click_zoom";

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

passing_draw_line_string.onSetup = function (callBack) {
  const state = this.originOnSetup();
  state.callBack = callBack;
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
  // check to see if we've deleted this feature
  if (this.getFeature(f.id) === undefined) return;
  //remove last added coordinate
  f.removeCoordinate(`${state.currentVertexPosition}`);
  if (f.isValid()) {
    if (typeof state.callBack === "function") state.callBack(f.toGeoJSON());
    else
      this.map.fire("draw.passing-create", {
        features: [f.toGeoJSON()],
      });
  }
  // else {
  this.deleteFeature([f.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  // }
};

export default passing_draw_line_string;
