import createElement from './utils/create-element';
import SELECTS from './const/selects';

/**
 * Get markup for one switcher.
 * @param {array} switcherOptions - Array of switcher options;
 * @returns {string} Switcher markup.
 */
function getSwitcherOptions(switcherOptions) {
	let result = '';
	switcherOptions.forEach((option) => {
		const optionValue = option.toLowerCase().split(' ').join('-');
		result += `<option value="${optionValue}">${option}</option>\n`;
	});
	return result;
}

/**
 * Get markup for specified switchers.
 * @param {array} selects - Array of switchers which are to be included.
 * @returns {string} String with switchers markup.
 */
function getSwitchers(selects) {
	let result = '';
	selects.forEach((select) => {
		const selectOptions = getSwitcherOptions(SELECTS[select]);
		result += `<select class="switchers__switcher switchers__switcher--${select}" name="${select}">
                ${selectOptions}
              </select>`;
	});
	return result;
}

/**
 * Class representing the switchers.
 */
export default class Switchers {
	/**
	 * @param {array} selects - Array of switchers which are to be included.
	 */
	constructor(selects) {
		this.element = createElement('div', 'switchers', getSwitchers(selects));
	}
}
