var Draggable, NativeValue, Snappable, Type, clampValue, type;

NativeValue = require("modx/native").NativeValue;

clampValue = require("clampValue");

Snappable = require("Snappable");

Draggable = require("Draggable");

Type = require("Type");

type = Type("SnapDragon");

type.inherits(Snappable);

type.defineOptions({
  axis: Draggable.Axis.isRequired,
  clamp: Boolean
});

type.defineFrozenValues({
  _drag: function(options) {
    return Draggable({
      axis: options.axis,
      shouldCaptureOnStart: this._shouldCaptureOnStart
    });
  },
  _offset: function(options) {
    if (options.clamp) {
      return NativeValue((function(_this) {
        return function() {
          return clampValue(_this._drag.offset.value, 0, _this.maxOffset);
        };
      })(this));
    } else {
      return this._drag.offset;
    }
  }
});

type.initInstance(function(options) {
  if (options.index != null) {
    this._drag.offset.value = this.restOffset;
  }
});

type.defineGetters({
  axis: function() {
    return this._drag.axis;
  },
  isHorizontal: function() {
    return this._drag.isHorizontal;
  },
  progress: function() {
    return this._offset.progress;
  },
  didUpdate: function() {
    return this._offset.didSet;
  },
  touchHandlers: function() {
    return this._drag.touchHandlers;
  },
  transform: function() {
    if (this.isHorizontal) {
      return {
        translateX: this._offset
      };
    } else {
      return {
        translateY: this._offset
      };
    }
  }
});

type.definePrototype({
  offset: {
    get: function() {
      return this._offset.value;
    },
    set: function(offset) {
      return this._drag.offset.value = offset;
    }
  }
});

type.defineBoundMethods({
  _shouldCaptureOnStart: function() {
    if (!this._drag.offset.isAnimating) {
      return false;
    }
    return this._drag.offset.velocity > 5;
  }
});

type.defineMethods({
  willProgress: function(config) {
    return this._offset.willProgress(config);
  },
  attachListeners: function() {
    this._drag.didGrant((function(_this) {
      return function() {
        return _this._drag.offset.stopAnimation();
      };
    })(this));
    return this._drag.didEnd((function(_this) {
      return function(gesture) {
        return _this.animate({
          distance: _this.offset - _this.restOffset,
          velocity: gesture.velocity
        });
      };
    })(this));
  }
});

type.overrideMethods({
  animate: function(config) {
    var dragOffset, fromOffset, onUpdate;
    dragOffset = this._drag.offset;
    dragOffset.stopAnimation();
    fromOffset = this.offset;
    if (config.toIndex != null) {
      config.fromOffset = fromOffset;
    }
    onUpdate = config.onUpdate;
    config.onUpdate = function(distance) {
      return dragOffset.value = fromOffset + distance;
    };
    return this.__super(arguments);
  }
});

module.exports = type.build();

//# sourceMappingURL=map/SnapDragon.map
