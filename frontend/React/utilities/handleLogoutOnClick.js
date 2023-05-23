import {fetchLogout} from './fetchLogout.js';

export function handleLogoutOnClick(event) {
    if (event !== undefined) {
        event.preventDefault();
        event.stopPropagation();
    }

    fetchLogout();
}