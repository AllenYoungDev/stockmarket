var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

window.generatePageNavigationControls = function (totalNumberOfPages, pageNumber, handleNavigationLinkOnClick, linkColor) {

  var navigationCharactersToNavigationPageNumbersMap = new Map();
  var bufferSpace = '';

  var iterationPageNumber;
  var iterationPageNumberStart = pageNumber;
  var iterationPageNumberEnd = pageNumber + 2;

  if (iterationPageNumberEnd > totalNumberOfPages) {
    iterationPageNumberEnd = totalNumberOfPages;
  }

  if (totalNumberOfPages === 0) {
    iterationPageNumberEnd = 0;
  }

  navigationCharactersToNavigationPageNumbersMap.set('<', pageNumber - 1);

  if (iterationPageNumberEnd === totalNumberOfPages) {
    if (pageNumber > 1) {
      navigationCharactersToNavigationPageNumbersMap.set('...', 0);
    }

    for (iterationPageNumber = iterationPageNumberStart; iterationPageNumber <= iterationPageNumberEnd; iterationPageNumber++) {
      navigationCharactersToNavigationPageNumbersMap.set(iterationPageNumber.toString(), iterationPageNumber);
    }

    if (iterationPageNumberStart !== iterationPageNumberEnd && iterationPageNumberEnd !== 0) {
      navigationCharactersToNavigationPageNumbersMap.set('>', iterationPageNumberStart + 1);
    } else {
      navigationCharactersToNavigationPageNumbersMap.set('>', 0);
    }
  } else {
    for (iterationPageNumber = iterationPageNumberStart; iterationPageNumber <= iterationPageNumberEnd; iterationPageNumber++) {
      navigationCharactersToNavigationPageNumbersMap.set(iterationPageNumber.toString(), iterationPageNumber);
    }

    if (iterationPageNumberEnd + 1 !== totalNumberOfPages) {
      navigationCharactersToNavigationPageNumbersMap.set('...', 0);
    }

    navigationCharactersToNavigationPageNumbersMap.set(totalNumberOfPages.toString(), totalNumberOfPages);

    if (pageNumber !== totalNumberOfPages) {
      navigationCharactersToNavigationPageNumbersMap.set('>', pageNumber + 1);
    } else {
      navigationCharactersToNavigationPageNumbersMap.set('>', 0);
    }
  }

  var navigationControls = [];
  var reactElement;

  var _loop = function _loop(_ref) {
    _ref2 = _slicedToArray(_ref, 2);
    var navigationCharacter = _ref2[0];
    var navigationPageNumber = _ref2[1];

    //navigationPageNumber is declared as const so that the navigation page number is passed as a constant number
    //below in the handleNavigationLinkOnClick() assignment, not as a dynamic variable that is 
    //resolved when handleNavigationLinkOnClick() is actually called to handle the user event.

    console.log('pageNavigationControlsGenerator.js navigationCharacter, navigationPageNumber: ' + navigationCharacter + ', ' + navigationPageNumber + '.');

    if (bufferSpace === ' ') {
      navigationControls.push(React.createElement(
        'span',
        { key: navigationCharacter + '_span' },
        '\xA0'
      ));
    }

    reactElement = React.createElement(
      'a',
      { key: navigationCharacter, href: '', style: { textDecoration: 'none', color: linkColor }, onClick: function onClick(event) {
          return handleNavigationLinkOnClick(event, navigationPageNumber);
        } },
      navigationCharacter
    );
    console.log('pageNavigationControlsGenerator.js reactElement.props: ' + JSON.stringify(reactElement.props) + '.');
    navigationControls.push(reactElement);

    bufferSpace = ' ';
  };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = navigationCharactersToNavigationPageNumbersMap.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref = _step.value;

      var _ref2;

      _loop(_ref);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return navigationControls;
};