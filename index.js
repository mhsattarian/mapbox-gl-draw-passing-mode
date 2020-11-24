import * as Constants from "@mapbox/mapbox-gl-draw/src/constants";
import doubleClickZoom from "@mapbox/mapbox-gl-draw/src/lib/double_click_zoom";

export default (originalMode) => {
  const {
    onSetup: originOnSetup,
    onClick: originOnClick,
    onMouseMove: originOnMouseMove,
    ...restOriginMethods
  } = originalMode;
  const newmode = {
    originOnSetup,
    originOnMouseMove,
    originOnClick,
    ...restOriginMethods,
  };

  newmode.onSetup = function (callBack) {
    const state = this.originOnSetup();

    if ("point" in state) state.feature_type = "point";
    else if ("line" in state) state.feature_type = "line";
    else state.feature_type = "polygon";

    state.callBack = callBack;

    return state;
  };

  newmode.onTap = newmode.onClick = function (state, e) {
    if (state.feature_type === "point") {
      this.updateUIClasses({ mouse: Constants.cursors.MOVE });
      state.point.updateCoordinate("", e.lngLat.lng, e.lngLat.lat);

      if (typeof state.callBack === "function")
        state.callBack(state.point.toGeoJSON());
      else
        this.map.fire("draw.stall.create", {
          features: [state.point.toGeoJSON()],
        });

      this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
    } else this.originOnClick(state, e);
  };

  newmode.onMouseMove = function (state, e) {
    this.updateUIClasses({ mouse: Constants.cursors.ADD });
    if (state.feature_type === "point") {
      state.point.updateCoordinate(e.lngLat.lng, e.lngLat.lat);
    } else this.originOnMouseMove(state, e);
  };

  newmode.onStop = function (state) {
    if ("point" in state) {
      this.activateUIButton();
      // if (!state.point.getCoordinate().length) {
      this.deleteFeature([state.point.id], { silent: true });
      // }
    } else if ("line" in state || "polygon" in state) {
      const f = state.line || state.polygon;

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
          this.map.fire("draw.stall.create", {
            features: [f.toGeoJSON()],
          });
      }
      // else {
      this.deleteFeature([f.id], { silent: true });
      this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
      // }
    }
  };

  return newmode;
};
