(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mapboxGlDrawPassingMode = factory());
}(this, (function () { 'use strict';

  const cursors = {
    ADD: 'add',
    MOVE: 'move',
    DRAG: 'drag',
    POINTER: 'pointer',
    NONE: 'none'
  };

  const modes = {
    DRAW_LINE_STRING: 'draw_line_string',
    DRAW_POLYGON: 'draw_polygon',
    DRAW_POINT: 'draw_point',
    SIMPLE_SELECT: 'simple_select',
    DIRECT_SELECT: 'direct_select',
    STATIC: 'static'
  };

  var doubleClickZoom = {
    enable(ctx) {
      setTimeout(() => {
        // First check we've got a map and some context.
        if (!ctx.map || !ctx.map.doubleClickZoom || !ctx._ctx || !ctx._ctx.store || !ctx._ctx.store.getInitialConfigValue) return;
        // Now check initial state wasn't false (we leave it disabled if so)
        if (!ctx._ctx.store.getInitialConfigValue('doubleClickZoom')) return;
        ctx.map.doubleClickZoom.enable();
      }, 0);
    },
    disable(ctx) {
      setTimeout(() => {
        if (!ctx.map || !ctx.map.doubleClickZoom) return;
        // Always disable here, as it's necessary in some cases.
        ctx.map.doubleClickZoom.disable();
      }, 0);
    }
  };

  var index = (originalMode) => {
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
        this.updateUIClasses({ mouse: cursors.MOVE });
        state.point.updateCoordinate("", e.lngLat.lng, e.lngLat.lat);

        if (typeof state.callBack === "function")
          state.callBack(state.point.toGeoJSON());
        else
          this.map.fire("draw.stall.create", {
            features: [state.point.toGeoJSON()],
          });

        this.changeMode(modes.SIMPLE_SELECT, {}, { silent: true });
      } else this.originOnClick(state, e);
    };

    newmode.onMouseMove = function (state, e) {
      this.updateUIClasses({ mouse: cursors.ADD });
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

        this.updateUIClasses({ mouse: cursors.NONE });
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
        this.changeMode(modes.SIMPLE_SELECT, {}, { silent: true });
        // }
      }
    };

    return newmode;
  };

  return index;

})));
