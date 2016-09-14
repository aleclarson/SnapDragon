
{NativeValue} = require "modx/native"

clampValue = require "clampValue"
Snappable = require "Snappable"
Draggable = require "Draggable"
Type = require "Type"

type = Type "SnapDragon"

type.inherits Snappable

type.defineOptions
  axis: Draggable.Axis.isRequired
  clamp: Boolean

type.defineFrozenValues

  _drag: (options) ->
    return Draggable
      axis: options.axis
      shouldCaptureOnStart: @_shouldCaptureOnStart

  _offset: (options) ->
    return @_drag.offset if not options.clamp
    offset = NativeValue =>
      clampValue @_drag.offset.value, 0, @maxOffset
    return offset.__attach()

type.initInstance (options) ->
  if options.index?
    @_drag.offset.value = @restOffset
  return

#
# Prototype-related
#

type.defineGetters

  axis: -> @_drag.axis

  isHorizontal: -> @_drag.isHorizontal

  progress: -> @_offset.progress

  didUpdate: -> @_offset.didSet

  touchHandlers: -> @_drag.touchHandlers

  transform: ->
    if @isHorizontal
      translateX: @_offset
    else
      translateY: @_offset

type.definePrototype

  offset:
    get: -> @_offset.value
    set: (offset) ->
      @_drag.offset.value = offset

type.defineBoundMethods

  _shouldCaptureOnStart: ->
    return no if not @_drag.offset.isAnimating
    return @_drag.offset.velocity > 5

type.defineMethods

  willProgress: (config) ->
    @_offset.willProgress config

  attachListeners: ->

    @_drag.didGrant =>
      @_drag.offset.stopAnimation()

    @_drag.didEnd (gesture) =>
      @animate
        distance: @offset - @restOffset
        velocity: gesture.velocity

type.overrideMethods

  animate: (config) ->

    dragOffset = @_drag.offset
    dragOffset.stopAnimation()

    fromOffset = @offset
    if config.toIndex?
      config.fromOffset = fromOffset

    onUpdate = config.onUpdate
    config.onUpdate = (distance) ->
      dragOffset.value = fromOffset + distance

    @__super arguments

module.exports = type.build()
