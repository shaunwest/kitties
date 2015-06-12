/**
 * Created by Shaun on 4/23/2015.
 */

var allDataElements;

function hasDataAttribute(element) {
  var attributes = element.attributes;
  for(var i = 0, numAttributes = attributes.length; i < numAttributes; i++) {
    if(attributes[i].name.substr(0, 4) === 'data') {
      return element;
    }
  }
}

export function findDataElements (parentElement) {
  var allElements, element, dataElements = [];

  if(!parentElement) {
    var html = document.getElementsByTagName('html');
    if(!html[0]) {
      return dataElements;
    }
    parentElement = html[0];
  }

  allElements = parentElement.querySelectorAll('*');
  for(var i = 0, numElements = allElements.length; i < numElements; i++) {
    element = allElements[i];
    if(hasDataAttribute(element)) {
      dataElements.push(element);
    }
  }
  return dataElements;
}

export function Fragments (name) {
  if(!allDataElements) {
    cacheDataElements();
  }
  return allDataElements.filter(function(element) {
    if(element.hasAttribute('data-' + name)) {
      return element;
    }
  });
}

export function Fragment (name) {
  return Fragments(name)[0];
}

export function cacheDataElements() {
  allDataElements = findDataElements();
}
