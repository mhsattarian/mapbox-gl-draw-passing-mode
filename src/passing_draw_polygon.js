import MapboxDraw from "@mapbox/mapbox-gl-draw";

const { draw_polygon } = MapboxDraw.modes;
const { doubleClickZoom } = MapboxDraw.lib;
const Constants = MapboxDraw.constants;

const {
  onSetup: originOnSetup,
  onMouseMove: originOnMouseMove,
  ...restOriginMethods
} = draw_polygon;

const passing_draw_polygon = {
  originOnSetup,
  originOnMouseMove,
  ...restOriginMethods,
};

passing_draw_polygon.onSetup = function (opt) {
  const state = this.originOnSetup();
  const { onDraw, onCancel } = opt;
  state.onDraw = onDraw;
  state.onCancel = onCancel;
  return state;
};

passing_draw_polygon.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.originOnMouseMove(state, e);
};

passing_draw_polygon.onStop = function (state) {
  const f = state.polygon;

  this.updateUIClasses({ mouse: Constants.cursors.NONE });
  doubleClickZoom.enable(this);
  this.activateUIButton();

  /// check to see if we've deleted this feature
  const drawnFeature = this.getFeature(f.id);
  if (drawnFeature === undefined) {
    /// Call `onCancel` if exists.
    if (typeof state.onCancel === "function") state.onCancel();
    return;
  }
  /// remove last added coordinate
  else f.removeCoordinate(`${state.currentVertexPosition}`);

  if (f.isValid()) {
    if (typeof state.onDraw === "function") state.onDraw(f.toGeoJSON());
    else
      this.map.fire("draw.passing-create", {
        features: [f.toGeoJSON()],
      });
  }
  this.deleteFeature([f.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
};

export default passing_draw_polygon;
