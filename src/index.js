import './styles/main.scss';
import CovidTable from './js/covid-table';
import CovidChart from './js/covid-chart';
import createElement from './js/utils/create-element';

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
    this.name = 'Covid-19 Dashboard';
    this.header = createElement('h1', 'app-name', this.name);
    this.container = document.getElementById('root');
    this.table.updateData();
    this.table.bindSelectChange();
    this.chart.buildChart();
  }
}

const app = new App(new CovidTable(), new CovidChart());
app.container.append(app.header);
app.container.append(app.table.element);
app.container.append(app.chart.element);
