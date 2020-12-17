import createElement from './utils/create-element';
import SELECTS from './const/selects';
import Switchers from './switchers';

/**
 * Get markup for the Covid Map.
 * @param {function} - takes Data Base.
 * @returns {DOM element} - DOM element with Covid-Map.
 */
export default class List {
	constructor(dataBase) {
		this.dataBase = dataBase;
		this.returnSettingKeys = {
			Cases: 'cases',
			Deaths: 'deaths',
			Recovered: 'recovered',
			'All time': '',
			'Last Day': 'today',
			Absolute: false,
			'Per 100k': true,
		};

		/**
* Creates switchers to the body of the list.
* @returns {DOM element} - add switchers.
*/
		this.createQueryCountry = () => {
			document.querySelector('.map__sortingСriteria')
				.append(new Switchers(SELECTS.listSelects).element);
		};
	}

	/**
* Get markup for the body map.
* @returns {DOM element} - DOM element with map elements.
*/
	createMap() {
		document.querySelector('#root').append(createElement('div', 'map', ''));
		const mapBody = document.querySelector('.map');

		mapBody.append(createElement('div', 'map__sortingСriteria', ''));
		this.createQueryCountry();

		this.bindSelectChange();
	}

	bindSelectChange() {
		document.querySelector('.switchers').addEventListener('change', (evt) => {
			this[evt.target.name] = evt.target.value;
		});
	}
}
