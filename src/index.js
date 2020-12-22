import './styles/main.scss';
import CovidTable from './js/covid-table';
import CovidChart from './js/covid-chart';
import CovidList from './js/covid-list';
import CovidMap from './js/covid-map';
import createElement from './js/utils/create-element';
import URLS from './js/const/api-urls';

/**
 * Class representing Covid Dashboard app.
 */
class App {
  /**
   * App should take Covid Table, Covid Map, Covid List and Covid Chart as its parameters.
   * @param {object} table - instance of Covid Table class.
   */
  constructor(table, chart, list, map) {
    this.table = table;
    this.chart = chart;
    this.list = list;
    this.map = map;
    this.observers = [this.table, this.chart, this.list, this.map];
    this.country = null;
    this.name = 'Covid-19 Dashboard';
    this.header = createElement('h1', 'app-name', this.name);
    this.subheader = createElement('h2', 'update-date', '');
    this.container = document.getElementById('root');
    this.saveDataPromise();
    this.updateDate();
    this.table.updateData(this.country, this.dataPromise);
    this.chart.buildChart(this.country, this.dataPromise);
    this.list.createList(this.country, this.dataPromise);
    this.map.createMap(this.country, this.dataPromise);
    this.table.bindSelectChange(this.updateDataHandler.bind(this));
    this.chart.bindSelectChange(this.updateDataHandler.bind(this));
    this.list.bindSelectChange(this.updateDataHandler.bind(this));
    this.list.bindCountryPick(this.changeCountryHandler.bind(this));
    this.map.bindSelectChange(this.updateDataHandler.bind(this));
    this.map.bindCountryPick(this.changeCountryHandler.bind(this));
  }

  /**
   * Get promise with datasets from API and save it in this.dataPromise.
   * @param {string} country - Name of a country.
   */
  saveDataPromise(country) {
    let todayURL;
    let yesterdayURL;
    let historicalURL;
    const allCountriesURL = `${URLS.diseaseSH}/countries`;
    const allCountriesYesterdayURL = `${URLS.diseaseSH}/countries?yesterday=true`;
    if (country) {
      todayURL = `${URLS.diseaseSH}/countries/${country}?strict=true`;
      yesterdayURL = `${URLS.diseaseSH}/countries/${country}?yesterday=true&strict=true`;
      historicalURL = `${URLS.diseaseSH}/historical/${country}?lastdays=365`;
    } else {
      todayURL = `${URLS.diseaseSH}/all`;
      yesterdayURL = `${URLS.diseaseSH}/all?yesterday=true`;
      historicalURL = `${URLS.diseaseSH}/historical/all?lastdays=365`;
    }
    const urls = [todayURL, yesterdayURL, historicalURL, allCountriesURL, allCountriesYesterdayURL];
    const requests = urls.map((link) => fetch(link));
    this.dataPromise = Promise.all(requests)
      .then((responses) => Promise.all(responses.map((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })));
  }

  /**
   * Put updated date returned by API to the subheader of the app.
   */
  updateDate() {
    function formatUpdateDate(date) {
      const PM_BOUNDARY = 12;
      const ZERO_HOUR = 0;
      const realHours = date.getHours();
      const isAM = realHours < PM_BOUNDARY;
      const amPM = isAM ? 'AM' : 'PM';
      let hours;
      if (isAM) {
        hours = realHours === ZERO_HOUR ? PM_BOUNDARY : realHours;
      } else {
        hours = realHours === PM_BOUNDARY ? PM_BOUNDARY : realHours - PM_BOUNDARY;
      }
      const month = date.getMonth() + 1;
      return `${month}/${date.getDate()}/${date.getFullYear()}, ${hours}:${date.getMinutes()}${amPM}`;
    }
    this.dataPromise
      .then((datasets) => new Date(datasets[0].updated))
      .then((date) => {
        this.subheader.innerHTML = `(Last Updated at ${formatUpdateDate(date)})`;
      });
  }

  /**
   * Handler for updating all the data in the app.
   * @param {string} select - Name of the switched select.
   * @param {string} option - Name of a new option of the select.
   */
  updateDataHandler(select, option) {
    this.saveDataPromise(this.country);
    this.updateDate();
    this.observers.forEach((observer) => {
      if (!observer) {
        return;
      }
      const currentObserver = observer;
      const switcher = currentObserver.switchersContainer.querySelector(`select[name=${select}]`);
      if (switcher) {
        // Update a state of a switcher according to the changes.
        switcher.value = option;
        currentObserver[select] = option;
      }
      currentObserver.updateData(this.country, this.dataPromise);
    });
  }

  changeCountryHandler(country) {
    this.country = country;
    this.saveDataPromise(country);
    this.observers.forEach((observer) => {
      const currentObserver = observer;
      currentObserver.country = country;
      currentObserver.updateData(this.country, this.dataPromise);
    });
  }
}

const app = new App(new CovidTable(), new CovidChart(), new CovidList(), new CovidMap());
app.container.append(app.header);
app.container.append(app.subheader);
app.container.append(app.table.element);
app.container.append(app.chart.element);
app.container.append(app.list.listBody);
app.container.append(app.map.mapBody);
