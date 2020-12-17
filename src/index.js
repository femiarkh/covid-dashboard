import './styles/main.scss';

import List from './js/list';
import Map from './js/map';

async function getDataBase() {
	const statsCovid = await fetch('https://corona.lmao.ninja/v3/covid-19/countries', { method: 'GET', redirect: 'follow' });
	const commitsCovid = await statsCovid.json();
	return commitsCovid;
}

const listEl = new List(getDataBase());
listEl.createList();

const mapEl = new Map(getDataBase());
mapEl.createMap();
