import './styles/main.scss';
import CovidTable from './js/covid-table';
import CovidChart from './js/covid-chart';
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
  constructor(table, chart) {
    this.table = table;
    this.chart = chart;
    this.country = null;
    this.name = 'Covid-19 Dashboard';
    this.header = createElement('h1', 'app-name', this.name);
    this.container = document.getElementById('root');
    this.saveDataPromise();
    this.table.updateData(this.country, this.dataPromise);
    this.chart.buildChart(this.country, this.dataPromise);
    this.table.bindSelectChange(this.updateDataHandler.bind(this));
    this.chart.bindSelectChange(this.updateDataHandler.bind(this));
  }

  /**
   * Get promise with datasets from API and save it in this.dataPromise.
   * @param {string} country - Name of a country.
   */
  saveDataPromise(country) {
    let todayURL;
    let yesterdayURL;
    let historicalURL;
    if (country) {
      todayURL = `${URLS.diseaseSH}/countries/${country}?strict=true`;
      yesterdayURL = `${URLS.diseaseSH}/countries/${country}?yesterday=true&strict=true`;
      historicalURL = `${URLS.diseaseSH}/historical/${country}?lastdays=365`;
    } else {
      todayURL = `${URLS.diseaseSH}/all`;
      yesterdayURL = `${URLS.diseaseSH}/all?yesterday=true`;
      historicalURL = `${URLS.diseaseSH}/historical/all?lastdays=365`;
    }
    const urls = [todayURL, yesterdayURL, historicalURL];
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
   * Handler for updating all the data in the app.
   */
  updateDataHandler() {
    this.saveDataPromise();
    this.table.updateData(this.country, this.dataPromise);
    this.chart.updateData(this.country, this.dataPromise);
  }
}

const app = new App(new CovidTable(), new CovidChart());
app.container.append(app.header);
app.container.append(app.table.element);
app.container.append(app.chart.element);
