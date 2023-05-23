/**
 * @jest-environment jsdom
 */

//import React from "react";
//import ReactDOM from 'react-dom/client';

import renderer from 'react-test-renderer';
import {EmailAddressVerificationNoticePage} from './EmailAddressVerificationNotice.js';

jest.mock('./utilities/getEmailAddressInUrlParam');

import {getEmailAddressInUrlParam} from './utilities/getEmailAddressInUrlParam';

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();

it('React app Jest snapshot testing for Allen Young\'s Stockmarket Demo Email Address Verification Notice Page', async () => {

  getEmailAddressInUrlParam.mockImplementation(() => {
    console.log('getEmailAddressInUrlParam() mock called!');
    return 'test@allenyoung.dev';
  });

  let testRenderer;
  let tree;

  //renderer.create() is wrapped in renderer.act() for executing useEffect() calls in <HomePage />.
  //https://github.com/facebook/react/issues/15321
  testRenderer = renderer.create(
    <EmailAddressVerificationNoticePage />,
  );

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
});