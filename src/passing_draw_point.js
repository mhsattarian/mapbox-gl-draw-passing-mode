import * as MapboxDraw from "@mapbox/mapbox-gl-draw";

const { draw_point } = MapboxDraw.modes;
const Constants = MapboxDraw.constants;

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

passing_draw_point.onSetup = function (opt) {
  const state = this.originOnSetup();
  const { onDraw, onCancel } = opt;
  state.onDraw = onDraw;
  state.onCancel = onCancel;
  return state;
};

passing_draw_point.onTap = passing_draw_point.onClick = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.MOVE });
  state.point.updateCoordinate("", e.lngLat.lng, e.lngLat.lat);

  if (typeof state.onDraw === "function") state.onDraw(state.point.toGeoJSON());
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
  const f = state.point;

  /// check to see if we've deleted this feature
  const drawnFeature = this.getFeature(f.id);
  if (drawnFeature === undefined) {
    /// Call `onCancel` if exists.
    if (typeof state.onCancel === "function") state.onCancel();
    return;
  }

  this.activateUIButton();
  this.deleteFeature([state.point.id], { silent: true });
};

export default passing_draw_point;
