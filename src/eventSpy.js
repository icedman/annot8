'use strict';

var rootElement = null;
var selection = null;
var selectedRange = null;
var selectionChangedCallback = null;
var documentResizeCallback = null;
var isRunning = false;

function isElementWithin(elm) {
  while(elm) {
    if (elm === rootElement) {
      return true;
    }
    elm = elm.parentElement;
  }
  console.log(elm);
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
  if (!isRunning)
    return;
  onSelectionChange();
}

function start(element, callback1, callback2) {
  rootElement = element;
  selectionChangedCallback = callback1;
  documentResizeCallback = callback2;

  isRunning = true;
  document.addEventListener('selectionchange', onSelectionChange);
  window.addEventListener('resize', onDocumentResize)
}

function stop() {
  isRunning = false;
  document.removeEventListener('selectionchange', onSelectionChange);
  window.removeEventListener('resize', onDocumentResize)
}

export default {
  start: start,
  stop: stop
};
