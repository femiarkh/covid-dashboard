import createElement from './utils/create-element';
import SELECTS from './const/selects';
import Switchers from './switchers';

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
		this.createQueryCountry = () => {
			document.querySelector('.list__sortingСriteria')
				.append(new Switchers(SELECTS.listSelects).element);
		};
		this.returnSwitchersEl = (el) => {
			const switchersEl = document.querySelectorAll('.switchers__switcher');
			return switchersEl[el].options[switchersEl[el].options.selectedIndex].text;
		};
		this.clearListCountry = () => {
			if (document.querySelectorAll('.listCountry__countryEl')) {
				document.querySelectorAll('.listCountry__countryEl').forEach((element) => {
					element.remove();
				});
			}
		};
		this.setFocus = () => {
			document.querySelector('.list__inputCountry').value = '';
			Object.assign(document.querySelector('.list').style, { width: '100%', position: 'absolute' });
			Object.assign(document.querySelector('.switchers').style, { top: '-6rem' });
			Object.assign(document.querySelector('.list__listCountry').style, { top: '-6rem' });
		};
		this.setFocus = () => {
			document.querySelector('.list__inputCountry').value = '';
			Object.assign(document.querySelector('.list').style, { width: '100%', position: 'absolute' });
			Object.assign(document.querySelector('.switchers').style, { top: '-6rem' });
			Object.assign(document.querySelector('.list__listCountry').style, { top: '-6rem' });
		};
	}

	createListCountry(sorter, valueName = this.returnSwitchersEl(0),
		period = this.returnSwitchersEl(1), valueType = this.returnSwitchersEl(2)) {
		let valueNameNow = this.returnSettingKeys[valueName];
		const periodNow = this.returnSettingKeys[period];
		const valueTypeNow = this.returnSettingKeys[valueType];

		if (periodNow) {
			valueNameNow = periodNow + valueName[0].toUpperCase() + valueName.slice(1);
		}

		this.dataBase.then((result) => {
			result
				.sort((a, b) => {
					if (valueTypeNow) {
						return Math.floor((b[valueNameNow] / b.population) * 100000)
							- Math.floor((a[valueNameNow] / a.population) * 100000);
					}
					return b[valueNameNow] - a[valueNameNow];
				})
				.filter((el) => {
					if (sorter) {
						return el.country.toLowerCase().includes(sorter.toLowerCase());
					}
					return el.country.toLowerCase().includes(el.country.toLowerCase());
				})
				.filter((el) => {
					if (valueTypeNow) {
						return Number.isInteger(Math.floor((el[valueNameNow] / el.population)
							* 100000)) === true;
					}
					return Number.isInteger(el[valueNameNow]) === true;
				})
				.forEach((element) => {
					const countryEl = document.createElement('div');

					const countPerson = valueTypeNow ? Math.floor((element[valueNameNow] / element.population)
						* 100000) : element[valueNameNow];
					countryEl.className = 'listCountry__countryEl';
					countryEl.innerHTML = `<img src="${element.countryInfo.flag}" alt="${element.country}" class ='countryEl__Img'>
				<span class ='countryEl__name'>${element.country}</span>
				<span class ='countryEl__count'>${countPerson}</span>`;
					document.querySelector('.list__listCountry').append(countryEl);
				});
		});
	}

	clearFocus() {
		document.querySelector('.list__inputCountry').value = '[enter country]';

		if (document.querySelector('.searchBody')) {
			document.querySelector('.searchBody').remove();
		}
		this.clearListCountry();
		this.createListCountry();

		Object.assign(document.querySelector('.list').style, { width: '25%', position: 'relative' });
		Object.assign(document.querySelector('.list__listCountry').style, { 'background-image': 'none', top: '-0rem' });
		Object.assign(document.querySelector('.switchers').style, { top: '-0rem' });
	}

	changeSearch(e) {
		Object.assign(document.querySelector('.list__listCountry').style, { opacity: '0' });
		setTimeout(() => {
			if (!document.querySelector('.searchBody')) {
				document.body.append(createElement('div', 'searchBody', ''));
			}

			if (new RegExp('[a-zA-Z]').test(e.key)) {
				this.clearListCountry();
				this.createListCountry(document.querySelector('.list__inputCountry').value);
			}
			Object.assign(document.querySelector('.list__listCountry').style, { opacity: '1' });
			setTimeout(() => {
				if (document.querySelectorAll('.listCountry__countryEl').length === 0) {
					Object.assign(document.querySelector('.list__listCountry').style, {
						'background-image': 'url("https://cdn.iconscout.com/icon/free/png-512/data-not-found-1965034-1662569.png")',
						height: '100%',
					});
				} else {
					Object.assign(document.querySelector('.list__listCountry').style, { 'background-image': 'none' });
				}
			}, 100);
		}, 750);
	}

	clickInputCountry() {
		document.querySelector('.list__inputCountry').addEventListener('click', () => {
			this.setFocus();
		});
	}

	blurInputCountry() {
		document.querySelector('.list__inputCountry').addEventListener('blur', () => {
			this.clearFocus();
		});
	}

	keyPressInputCountry() {
		document.querySelector('.list__inputCountry').addEventListener('keyup', (e) => {
			e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
			this.changeSearch(e);
		});
	}

	createList() {
		document.querySelector('#root').append(createElement('div', 'list', ''));

		const listBody = document.querySelector('.list');

		listBody.append(createElement('div', 'list__queryCountry', ''));
		document.querySelector('.list__queryCountry').append(createElement('input', 'list__inputCountry', ''));
		document.querySelector('.list__inputCountry').value = '[enter country]';
		document.querySelector('.list__inputCountry').setAttribute('contenteditable', 'true');

		this.clickInputCountry();
		this.blurInputCountry();
		this.keyPressInputCountry();

		listBody.append(createElement('div', 'list__sortingСriteria', ''));
		this.createQueryCountry();

		listBody.append(createElement('div', 'list__listCountry', ''));
		this.createListCountry();

		this.bindSelectChange();
	}

	bindSelectChange() {
		document.querySelector('.switchers').addEventListener('change', (evt) => {
			this[evt.target.name] = evt.target.value;
			this.clearListCountry();
			this.createListCountry();
		});
	}
}
