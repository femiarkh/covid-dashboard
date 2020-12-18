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
		this.mapOptions = {
			center: [0, 0],
			zoom: 2,
			worldCopyJump: true,
		};
		this.circleOptions = {
			fill: 'true',
			color: 'red',
			fillColor: '#f03',
			fillRule: 'nonzero',
			fillOpacity: 0.4,
			weight: 3,
		};
		this.geoOptions = {
			color: 'blue',
			fillColor: '#f03',
			fillRule: 'nonzero',
			fillOpacity: 0.1,
			weight: 2,
		};

		/**
* Creates switchers to the body of the list.
* @returns {DOM element} - add switchers.
*/
		this.createQueryCountry = () => {
			document.querySelector('.map__sortingСriteria')
				.append(new Switchers(SELECTS.listSelects).element);
		};
		/**
		* Returns the value input.
		* @param {number} - takes the seat number in switchers.
		* @returns {string} - the value select.
		*/
		this.returnSwitchersEl = (num) => {
			const switchersEl = document.querySelectorAll('.switchers__switcher');
			return switchersEl[num].options[switchersEl[num].options.selectedIndex].text;
		};
	}

	createMapBody() {
		// let valueNameNow = this.returnSettingKeys[valueName];
		// const periodNow = this.returnSettingKeys[period];
		// const valueTypeNow = this.returnSettingKeys[valueType];

		// if (periodNow) {
		// 	valueNameNow = periodNow + valueName[0].toUpperCase() + valueName.slice(1);
		// }

		const map = new L.Map('mapid', this.mapOptions);
		const layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', { maxZoom: 10 });
		map.addLayer(layer);

		this.dataBase.then((result) => {
			result.forEach((element) => {
				fetch(`https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${element.countryInfo.iso3}.geo.json`)
					.then((res) => res.json())
					.then((data) => {
						L.geoJSON(data, this.geoOptions).bindPopup(`${element.country}`).addTo(map);
					})
					.then(() => {
						const circle = L.circle([element.countryInfo.lat, element.countryInfo.long],
							element.cases / 11, this.circleOptions).bindPopup((`${element.country}`));
						circle.addTo(map);
					});
			});
		});
	}

	createMap() {
		document.querySelector('#root').append(createElement('div', 'map', ''));
		const mapBody = document.querySelector('.map');

		mapBody.append(createElement('div', 'map__sortingСriteria', ''));
		this.createQueryCountry();

		this.bindSelectChange();

		const mapid = document.createElement('div');
		mapid.id = 'mapid';
		mapBody.appendChild(mapid);

		this.createMapBody();
	}

	bindSelectChange() {
		document.querySelector('.switchers').addEventListener('change', (evt) => {
			this[evt.target.name] = evt.target.value;
		});
	}
}
