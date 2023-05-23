//import React from "react";
//import ReactDOM from "react-dom/client";

export function footer() {
    /*
    if (typeof React === 'undefined') {
        import("react").then(exports => {
            //do something with @exports...
            globalThis.React = exports;
        });
    }
    */

    return (
        <React.Fragment>
        <footer className='footer'>
        <p>Allen Young's Stockmarket Demo by Allen Young.</p>
        <p>For demonstrating Allen Young's full-stack web app development skills to potential employers.</p>
        <p>For more of Allen Young's software development skills demonstration, visit <a href="https://AllenYoung.dev" target="_blank"  style={{color: 'white'}}>AllenYoung.dev</a> and <a href="https://GitHub.com/AllenYoungDev" target="_blank" style={{color: 'white'}}>GitHub.com/AllenYoungDev</a>.</p>
        <p>© 2023 Allen Young.  All rights reserved.</p>
        </footer>
        </React.Fragment>
    );
}

/*
export const footer =
(
    <React.Fragment>
    <footer className='footer'>
    <p>Allen Young's Stockmarket Demo by Allen Young.</p>
    <p>For demonstrating Allen Young's full-stack web app development skills to potential employers.</p>
    <p>For more of Allen Young's software development skills demonstration, visit <a href="https://AllenYoung.dev" target="_blank"  style={{color: 'white'}}>AllenYoung.dev</a> and <a href="https://GitHub.com/AllenYoungDev" target="_blank" style={{color: 'white'}}>GitHub.com/AllenYoungDev</a>.</p>
    <p>© 2023 Allen Young.  All rights reserved.</p>
    </footer>
    </React.Fragment>
);
*/

