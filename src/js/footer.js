import createElement from './utils/create-element';
import githubIcon from '../assets/icons/github.png';
import rsSchoolIcon from '../assets/icons/rs_school_js.svg';

/**
 * Get markup for the footer.
 */
function getFooterMarkup() {
  return `<div class="app-footer__github github">
            <p class="github__user"><a href="https://github.com/zhenjahorbach" target="_blank">zhenjahorbach</a></p>
            <p class="github__icon-container"><img class="github__icon" src="${githubIcon}" width="32" alt="GitHub"></p>
            <p class="github__user"><a href="https://github.com/femiarkh" target="_blank">femiarkh</a></p>
          </div>
          <div class="app-footer__year">2020</div>
          <div class="app-footer__course course">
            <a class="course__link" href="https://rs.school/js/" target="_blank"><img class="course__image" src="${rsSchoolIcon}" alt="Rolling Scopes School JS Course" width="100"></a>
          </div>`;
}

/**
 * Class representing a full screen button.
 */
export default class Footer {
  constructor() {
    this.element = createElement('footer', 'app-footer', getFooterMarkup());
  }
}
