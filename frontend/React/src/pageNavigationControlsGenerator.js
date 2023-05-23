window.generatePageNavigationControls = function (totalNumberOfPages, pageNumber, handleNavigationLinkOnClick,
  linkColor) {

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

      for (iterationPageNumber = iterationPageNumberStart; 
        iterationPageNumber <= iterationPageNumberEnd; iterationPageNumber++) {
          navigationCharactersToNavigationPageNumbersMap.set(iterationPageNumber.toString(), iterationPageNumber);
      }

      if (iterationPageNumberStart !== iterationPageNumberEnd && iterationPageNumberEnd !== 0) {
        navigationCharactersToNavigationPageNumbersMap.set('>', iterationPageNumberStart + 1);
      } else {
        navigationCharactersToNavigationPageNumbersMap.set('>', 0);
      }
    } else {
      for (iterationPageNumber = iterationPageNumberStart; 
        iterationPageNumber <= iterationPageNumberEnd; iterationPageNumber++) {
          navigationCharactersToNavigationPageNumbersMap.set(iterationPageNumber.toString(), iterationPageNumber);
      }

      if (iterationPageNumberEnd + 1 !== totalNumberOfPages) {
        navigationCharactersToNavigationPageNumbersMap.set('...', 0);
      }

      navigationCharactersToNavigationPageNumbersMap.set(totalNumberOfPages.toString(),
        totalNumberOfPages);

      if (pageNumber !== totalNumberOfPages) {
        navigationCharactersToNavigationPageNumbersMap.set('>', pageNumber + 1);
      } else {
        navigationCharactersToNavigationPageNumbersMap.set('>', 0);
      }
    }

    var navigationControls = [];
    var reactElement;
    for (const [navigationCharacter, navigationPageNumber] of navigationCharactersToNavigationPageNumbersMap.entries()) {
      //navigationPageNumber is declared as const so that the navigation page number is passed as a constant number
      //below in the handleNavigationLinkOnClick() assignment, not as a dynamic variable that is 
      //resolved when handleNavigationLinkOnClick() is actually called to handle the user event.

      console.log(`pageNavigationControlsGenerator.js navigationCharacter, navigationPageNumber: ${navigationCharacter}, ${navigationPageNumber}.`);

      if (bufferSpace === ' ') {
        navigationControls.push(<span key={navigationCharacter + '_span'}>&nbsp;</span>);
      }

      reactElement = <a key={navigationCharacter} href="" style={{textDecoration:'none', color: linkColor}} onClick={event => handleNavigationLinkOnClick(event, navigationPageNumber)}>{navigationCharacter}</a>;
      console.log(`pageNavigationControlsGenerator.js reactElement.props: ${JSON.stringify(reactElement.props)}.`);
      navigationControls.push(reactElement);

      bufferSpace = ' ';
    }

    return navigationControls;
}