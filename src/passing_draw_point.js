import draw_point from "@mapbox/mapbox-gl-draw/src/modes/draw_point";
import * as Constants from "@mapbox/mapbox-gl-draw/src/constants";

const {
  onSetup: originOnSetup,
  onClick: originOnClick,
  ...restOriginMethods
} = draw_point;

const passing_draw_point = {
  originOnSetup,
  originOnClick,
  ...restOriginMethods,
};

passing_draw_point.onSetup = function (callBack) {
  const state = this.originOnSetup();
  state.callBack = callBack;
  return state;
};

passing_draw_point.onTap = passing_draw_point.onClick = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.MOVE });
  state.point.updateCoordinate("", e.lngLat.lng, e.lngLat.lat);

  if (typeof state.callBack === "function")
    state.callBack(state.point.toGeoJSON());
  else
    this.map.fire("draw.passing-create", {
      features: [state.point.toGeoJSON()],
    });

  this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
};

passing_draw_point.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  state.point.updateCoordinate(e.lngLat.lng, e.lngLat.lat);
};

passing_draw_point.onStop = function (state) {
  this.activateUIButton();
  this.deleteFeature([state.point.id], { silent: true });
};

export default passing_draw_point;
