import createElement from './utils/create-element';
import SELECTS from './const/selects';
import DATASET_INDEXES from './const/dataset-indexes';
import PARAMETERS from './const/parameters';
import Switchers from './switchers';
import FullScreenButton from './full-screen-button';
import addCommas from './utils/add-commas';

/**
 * Class representing the Covid Map.
 */
export default class Map {
	constructor() {
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
			fillColor: 'red',
			fillRule: 'nonzero',
			fillOpacity: 0.4,
			weight: 0.5,
		};
		this.geoOptions = {
			color: 'blue',
			fillColor: 'white',
			fillRule: 'nonzero',
			fillOpacity: 0.1,
			weight: 1,
		};
		this.popupOptions = {
			closeButton: false,
			autoClose: true,
		};
		this.switchersContainer = [];
		this.map = [];
		this.circleLayerGroup = [];
		this.geoLayerGroup = [];
		this.myFetchSetting = {
			method: 'GET',
			mode: 'cors',
			cache: 'default',
		};
		this.oneHundredThousand = 100000;
		this.zoomCircle = 11;
		this.countryNow = null;
		this.possibleClick = false;
		this.firsLoad = true;
		this.numberNow = 0;
		this.saveEl = ['AFG', 'ALB', 'DZA', 'AGO', 'ARG', 'ARM', 'AUS', 'AUT', 'AZE', 'BHS', 'BGD', 'BLR',
			'BEL', 'BLZ', 'BEN', 'BMU', 'BTN', 'BOL', 'BIH', 'BWA', 'BRA', 'BRN', 'BGR', 'BFA', 'BDI', 'KHM',
			'CMR', 'CAN', 'CAF', 'TCD', 'CHL', 'CHN', 'COL', 'COG', 'CRI', 'HRV', 'CUB', 'CYP', 'CZE', 'CIV',
			'COD', 'DNK', 'DJI', 'DOM', 'ECU', 'EGY', 'SLV', 'GNQ', 'ERI', 'EST', 'ETH', 'FLK', 'FJI', 'FIN',
			'FRA', 'GUF', 'GAB', 'GMB', 'GEO', 'DEU', 'GHA', 'GRC', 'GTM', 'GIN', 'GNB', 'GUY', 'HTI',
			'HND', 'HUN', 'ISL', 'IND', 'IDN', 'IRN', 'IRQ', 'IRL', 'ISR', 'ITA', 'JAM', 'JPN', 'JOR', 'KAZ',
			'KEN', 'KWT', 'KGZ', 'LAO', 'LVA', 'LBN', 'LSO', 'LBR', 'LBY', 'LTU', 'LUX', 'MKD', 'MDG', 'MWI',
			'MYS', 'MLI', 'MLT', 'MRT', 'MEX', 'MDA', 'MNG', 'MNE', 'MAR', 'MOZ', 'MMR', 'NAM', 'NPL', 'NLD',
			'NCL', 'NZL', 'NIC', 'NGA', 'NOR', 'OMN', 'PAK', 'PSE', 'PAN', 'PNG', 'PRY', 'PER', 'PHL', 'POL',
			'PRT', 'QAT', 'ROU', 'RUS', 'RWA', 'KOR', 'SAU', 'SEN', 'SRB', 'SLE', 'SVK', 'SVN', 'SLB', 'SOM',
			'ZAF', 'SSD', 'ESP', 'LKA', 'SDN', 'SUR', 'SWZ', 'SWE', 'CHE', 'SYR', 'TWN', 'TJK', 'TZA', 'THA',
			'TLS', 'TGO', 'TTO', 'TUN', 'TUR', 'ARE', 'GBR', 'USA', 'UGA', 'UKR', 'URY', 'UZB', 'VUT', 'VEN',
			'VNM', 'ESH', 'YEM', 'ZMB', 'ZWE', 'NER'];

		/**
		 * Creates switchers to the body of the list.
		 */
		this.createQueryCountry = () => {
			document.querySelector('.map__sortingСriteria')
				.append(new Switchers(SELECTS.mapSelects).element);
		};
		/**
		 * Returns the value input.
		 * @param {number} - takes the seat number in switchers.
		 * @returns {string} - the value select.
		 */
		this.returnSwitchersEl = (num) => {
			const switchersEl = this.mapBody.querySelectorAll('.switchers__switcher');
			return switchersEl[num].options[switchersEl[num].options.selectedIndex].text;
		};
	}

	/**
	 * Sets the position of the map on the country.
	 * @param {coordinate} - takes coordinates.
	 */
	changeLocate(lat, long) {
		this.map.setView(new L.LatLng(lat, long), 2.5);
	}

	/**
	 * Get markup for the Map.
	 * @param {string} - value from first,second,third select.
	 */
	createMapBody(country, dataPromise) {
		this.dataPromise = dataPromise;
		const valueName = this.returnSwitchersEl(0);
		const period = this.returnSwitchersEl(1);
		const valueType = this.returnSwitchersEl(2);
		let valueNameNow = this.returnSettingKeys[valueName];
		const periodNow = this.returnSettingKeys[period];
		const valueTypeNow = this.returnSettingKeys[valueType];

		if (periodNow) {
			valueNameNow = periodNow + valueName[0].toUpperCase() + valueName.slice(1);
		}

		if (valueName.toLowerCase() === PARAMETERS.valueName.cases) {
			this.circleOptions.color = 'red';
			this.circleOptions.fillColor = 'red';
			this.zoomCircle = 11;
		} else if (valueName.toLowerCase() === PARAMETERS.valueName.deaths) {
			this.circleOptions.color = 'green';
			this.circleOptions.fillColor = 'green';
			this.zoomCircle = 1;
		} else if (valueName.toLowerCase() === PARAMETERS.valueName.recovered) {
			this.circleOptions.color = 'yellow';
			this.circleOptions.fillColor = 'yellow';
			this.zoomCircle = 8;
		}

		if (this.map.length === 0) {
			this.map = new L.Map('mapid', this.mapOptions);
			const layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', { maxZoom: 10 });
			this.map.addLayer(layer);
		}
		this.geoLayerGroup = new L.LayerGroup();
		this.circleLayerGroup = new L.LayerGroup();

		this.dataPromise.then((result) => {
			let data;
			const currentPeriod = document.querySelector('.switchers__switcher--period').value;
			if (currentPeriod === PARAMETERS.period.lastDay) {
				data = result[DATASET_INDEXES.allCountriesYesterday];
			} else {
				data = result[DATASET_INDEXES.allCountries];
			}
			data.forEach((element) => {
				if (this.saveEl.find((el) => el === element.countryInfo.iso3)) {
					fetch(`https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${element.countryInfo.iso3}.geo.json`,
						this.myFetchSetting)
						.then((res) => res.json())
						.then((dates) => {
							const dataEl = dates;
							const countPerson = valueTypeNow
								? Math.floor((element[valueNameNow]
									/ (element.population / this.oneHundredThousand)))
								: element[valueNameNow];

							const geo = L.geoJSON(dataEl, this.geoOptions)
								.bindTooltip(new L.Tooltip(this.popupOptions)
									.setContent(`<h2 class = 'map__country_name'>${element.country}</h2>
                      <p class = 'map__country_value'>${addCommas(countPerson)} people</p>`))
								.addTo(this.map);
							geo.on('click', () => {
								this.countryNow = element.country;
								this.possibleClick = true;
							});
							geo.on('mouseover', () => {
								geo.setStyle({
									color: 'red',
									fillColor: 'white',
									fillOpacity: 0.2,
									weight: 3,
								});
							});
							geo.on('mouseout', () => {
								geo.setStyle({
									color: 'blue',
									fillColor: 'white',
									fillRule: 'nonzero',
									fillOpacity: 0.1,
									weight: 1,
								});
							});

							this.geoLayerGroup.addLayer(geo);

							const circle = L.circle([element.countryInfo.lat, element.countryInfo.long],
								countPerson / this.zoomCircle, this.circleOptions)
								.bindTooltip(new L.Tooltip(this.popupOptions)
									.setLatLng([element.countryInfo.lat, element.countryInfo.long])
									.setContent(`<h2 class = 'map__country_name'>${element.country}</h2>
                  <p class = 'map__country_value'>${addCommas(countPerson)} people</p>`))
								.addTo(this.map);

							circle.on('click', () => {
								this.countryNow = element.country;
								this.possibleClick = true;
							});

							this.circleLayerGroup.addLayer(circle);
							this.saveEl.push(element.countryInfo.iso3);
						});
				}
			});

			this.geoLayerGroup.addTo(this.map);
			this.circleLayerGroup.addTo(this.map);
		});
		setTimeout(() => {
			document.querySelector('#mapid').click();
		}, 100);
	}

	/**
	 * Get markup for the Map legend.
	 */
	createMapLegend() {
		document.querySelector('.map').append(createElement('div', 'map__legend', ''));
		document.querySelector('.map__legend').append(createElement('h2', 'map__legend_name', 'Map Legend'));
		document.querySelector('.map__legend').append(createElement('h2', 'map__legend_body', ''));
		for (let i = 0; i < 3; i += 1) {
			document.querySelector('.map__legend_body').append(createElement('div', 'map__legend_item', ''));
		}
		for (let i = 0; i < 3; i += 1) {
			document.querySelectorAll('.map__legend_item')[i].append(createElement('div', 'map__legend_circle', ''));
			document.querySelectorAll('.map__legend_item')[i].append(createElement('div', 'map__legend_circleName', `${Object.keys(this.returnSettingKeys)[i]}`));
		}
		for (let i = 0; i < 3; i += 1) {
			Object.assign(document.querySelectorAll('.map__legend_circle')[i].style, { 'background-color': ['red', 'green', 'yellow'][i] });
		}
	}

	/**
	 * Get markup for the body map.
	 */
	createMap(country, dataPromise) {
		document.querySelector('#root').append(createElement('div', 'map', ''));
		this.mapBody = document.querySelector('.map');

		this.mapBody.append(createElement('div', 'map__sortingСriteria', ''));
		this.createQueryCountry();

		const contMapid = document.createElement('div');
		contMapid.id = 'contMapid';
		this.mapBody.appendChild(contMapid);

		const mapid = document.createElement('div');
		mapid.id = 'mapid';
		contMapid.appendChild(mapid);

		this.createMapLegend();
		this.switchersContainer = this.mapBody.querySelector('.switchers');
		this.switchersContainer.append(new FullScreenButton().element);
		this.fullScreenButton = this.mapBody.querySelector('.full-screen-button');
		this.bindFullScreen();
		this.createMapBody(country, dataPromise);
	}

	/**
	 * Update data in the map.
	 * @param {string} country - A country name.
	 * @param {object} dataPromise - Promise with datasets.
	 */
	updateData(country, dataPromise) {
		this.geoLayerGroup.clearLayers();
		this.circleLayerGroup.clearLayers();
		this.createMapBody(country, dataPromise);

		document.querySelector('#mapid').click();
		document.querySelector('#mapid').click();
		document.querySelector('#mapid').click();

		this.dataPromise.then((result) => {
			const data = result[DATASET_INDEXES.allCountries];
			const element = data.find((el) => el.country === country);
			if (element != undefined) {
				this.changeLocate(element.countryInfo.lat ? element.countryInfo.lat : 0, element.countryInfo.long ? element.countryInfo.long : 0);
			}

			const allCountry = document.querySelectorAll('.listCountry__countryEl');
			allCountry.forEach((el) => {
				if (el.querySelector('.countryEl__name').innerText === country) {
					new L.Popup(this.popupOptions)
						.setLatLng([element.countryInfo.lat, element.countryInfo.long])
						.setContent(`<h2 class = 'map__country_name'>${country}</h2>
                  <p class = 'map__country_value'>${el.querySelector('.countryEl__count').innerText} people</p> `)
						.addTo(this.map);
				}
			});
		});
	}

	/**
	 * Update state of the map every time select is changed.
	 * @param {function} - Handler passed by the app.
	 */
	bindSelectChange(handler) {
		document.querySelectorAll('.switchers').forEach((el) => {
			el.addEventListener('change', (evt) => {
				this[evt.target.name] = evt.target.value;
				handler(evt.target.name, evt.target.value);
			});
		});
	}

	bindCountryPick(handler) {
		document.querySelector('#mapid').addEventListener('click', () => {
			if (this.possibleClick === true) {
				this.possibleClick = false;
				handler(this.countryNow);
				setTimeout(() => {
					document.querySelector('#mapid').click();
				}, 800);
			}
		});
	}

	/**
	 * Expand or shrink the list when full screen button is clicked.
	 */
	bindFullScreen() {
		this.fullScreenButton.addEventListener('click', () => {
			this.map.toggleFullscreen();
			document.querySelector('#mapid').click();
		});
	}
}
