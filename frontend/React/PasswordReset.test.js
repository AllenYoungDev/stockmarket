/**
 * @jest-environment jsdom
 */

//import React from "react";
//import ReactDOM from 'react-dom/client';

import renderer from 'react-test-renderer';
import {PasswordResetPage} from './PasswordReset.js';

jest.mock('./utilities/getEmailAddressAndAccessTokenInUrlParam');

import {getEmailAddressAndAccessTokenInUrlParam} from './utilities/getEmailAddressAndAccessTokenInUrlParam';

(async () => {
  if (typeof React === 'undefined') {
    globalThis.React = await import("react");
  }
  if (typeof ReactDOM === 'undefined') {
    globalThis.ReactDOM = await import("react-dom/client");
  }
})();


it('React app Jest snapshot testing for Allen Young\'s Stockmarket Demo password reset page', async () => {

  getEmailAddressAndAccessTokenInUrlParam.mockImplementation(() => {
    console.log('getEmailAddressAndAccessTokenInUrlParam() mock called!');
    return ['test@allenyoung.dev', '1111-1111-1111-1111']
  });


  let testRenderer;
  let tree;

  testRenderer = renderer.create(
    <PasswordResetPage />,
  );

  tree = testRenderer.toJSON();
  expect(tree).toMatchSnapshot();
});