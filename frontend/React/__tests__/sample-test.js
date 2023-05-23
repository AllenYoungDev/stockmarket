/**
 * @jest-environment jsdom
 */

import {cleanup, fireEvent, render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import {FormTest} from '../sample.js';

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();

// Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
// unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

it('Sample test', async () => {
  let htmlElement;

  const user = userEvent.setup();

  await act(async () => {
    render(<FormTest />);
  });

  //UI event simulation
  htmlElement = screen.getByLabelText('Number entered:'); //getByLabelText() for finding form input

  await act(async () => {
    await user.type(htmlElement, '1');
    //htmlElement.value = '1'; //this works, but it doesn't call the input change handler function.
    //htmlElement.dispatchEvent(new KeyboardEvent('keydown', { key: '1' })); //This doesn't work
    //htmlElement.dispatchEvent(new KeyboardEvent('keyup', { key: '1' })); //This doesn't work
    //fireEvent.keyPress(htmlElement, { key: "1", code: 49, charCode: 49 });
    //await htmlElement.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: '1' })); //this doesn't work.
  });
  console.log(`htmlElement value:  ${htmlElement.value}.`);
  console.log(`htmlElement.getAttribute('value'):  ${htmlElement.getAttribute('value')}.`);
  expect(htmlElement.value).toEqual('1');
});