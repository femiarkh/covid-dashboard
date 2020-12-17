// import createElement from './utils/create-element';
// import SELECTS from './const/selects';
// import switchers from './switchers';

// export class List {

// 	constructor(dataBase) {
// 		this.dataBase = dataBase;
// 		this.returnSettingKeys = {
// 			'Cases': 'cases',
// 			'Deaths': 'deaths',
// 			'Recovered': 'recovered',
// 			'All time': '',
// 			'Last Day': 'today',
// 			'Absolute': false,
// 			'Per 100k': true,
// 		}
// 	}

// 	createMap() {
// 		document.querySelector('#root').append(createElement('div', 'map', ''));
// 		const mapBody = document.querySelector('.map');
// 		this.bindSelectChange();

// 	}

// 	bindSelectChange() {
// 		document.querySelector('.switchers').addEventListener('change', (evt) => {
// 			this[evt.target.name] = evt.target.value;
// 			this.clearListCountry();
// 			this.createListCountry();
// 		});
// 	}
// }
