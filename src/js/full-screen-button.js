import createElement from './utils/create-element';

/**
 * Get markup for a full screen button.
 */
function getFullButtonMurkup() {
  return '<span class="visually-hidden">Open in full screen</span>';
}

/**
 * Class representing a full screen button.
 */
export default class FullScreenButton {
  constructor() {
    this.element = createElement('button', 'full-screen-button full-screen-button--closed', getFullButtonMurkup());
  }
}
