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
          var range = sel.getRangeAt(0);
          if (range != null) {
              if (isElementWithin(range.commonAncestorContainer)) {
                  if (range.toString() !== '') {
                      hasSelection = true;
                      selection = sel;
                      selectedRange = range;
                  }
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
    mouseUpCallback({x:evt.clientX, y:evt.clientY, sx:evt.screenX, sy:evt.screenY});
  }
}

function onTouchStart(evt) {
  if (selection) {
    return;
  }
  // check within
  if (isElementWithin(evt.srcElement)) {
    mouseUpCallback({x:evt.touches[0].clientX, y:evt.touches[0].clientY, sx:evt.touches[0].screenX, sy:evt.touches[0].screenY});
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
  window.addEventListener('touchstart', onTouchStart);
}

function stop() {
  if (!isRunning) {
    return;
  }

  isRunning = false;
  document.removeEventListener('selectionchange', onSelectionChange);
  window.removeEventListener('resize', onDocumentResize)
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('touchstart', onTouchStart);
}

export default {
  start: start,
  stop: stop
};
