'use strict';

var rootElement = null;
var selection = null;
var selectedRange = null;
var selectionChangedCallback = null;
var documentResizeCallback = null;
var mouseUpCallback = null;
var isRunning = false;

function isElementWithin(elm) {
  while(elm) {
    if (elm === rootElement) {
      return true;
    }
    elm = elm.parentElement;
  }
  return false;
}

function onSelectionChange(evt) {
  if (!isRunning)
    return;

  /* evt is not used */

  var hasSelection = false;
  try {
      var sel = window.getSelection();
      if (sel != null) {
        if (isElementWithin(sel.anchorNode) && isElementWithin(sel.focusNode)) {
          var range = sel.getRangeAt(0);
          if (range != null) {
              // if (isElementWithin(range.commonAncestorContainer)) {
                  if (range.toString() !== '') {
                      hasSelection = true;
                      selection = sel;
                      selectedRange = range;
                  }
              // }
          }
        }
      }

  } catch (err) {
      // console.log(err);
  }

  if (!hasSelection) {
      selection = null;
      selectedRange = null;
  }

  selectionChangedCallback(selection, selectedRange);
}

function onDocumentResize() {
  documentResizeCallback();
}

function onMouseUp(evt) {
  if (selection) {
    return;
  }
  // check within
  if (isElementWithin(evt.srcElement)) {
    mouseUpCallback({x:evt.pageX, y:evt.pageY, sx:evt.screenX, sy:evt.screenY});
  }
}

function onTouchStart(evt) {
  if (selection) {
    return;
  }
  // check within
  if (isElementWithin(evt.srcElement)) {
    var touch = evt.changedTouches[0];
    // var touch = evt.touches[0];
    mouseUpCallback({
      x:touch.pageX,
      y:touch.pageY,
      sx:touch.screenX,
      sy:touch.screenY,
      evt:'touch'});
  }
}

function start(element, callback1, callback2, callback3) {
  if (isRunning) {
    return;
  }

  rootElement = element;
  selectionChangedCallback = callback1;
  documentResizeCallback = callback2;
  mouseUpCallback = callback3;

  isRunning = true;
  document.addEventListener('selectionchange', onSelectionChange);
  window.addEventListener('resize', onDocumentResize)
  window.addEventListener('mouseup', onMouseUp);
  // document.body.addEventListener('touchstart', onTouchStart);
  // document.body.addEventListener('touchmove', onTouchStart);
  document.body.addEventListener('touchend', onTouchStart);
}

function stop() {
  if (!isRunning) {
    return;
  }

  isRunning = false;
  document.removeEventListener('selectionchange', onSelectionChange);
  window.removeEventListener('resize', onDocumentResize)
  window.removeEventListener('mouseup', onMouseUp);
  // document.body.removeEventListener('touchstart', onTouchStart);
  // document.body.removeEventListener('touchmove', onTouchStart);
  document.body.removeEventListener('touchend', onTouchStart);
}

export default {
  start: start,
  stop: stop
};
