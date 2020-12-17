import './styles/main.scss';
import CovidTable from './js/covid-table';
import createElement from './js/utils/create-element';

/**
 * Class representing Covid Dashboard app.
 */
class App {
  /**
   * App should take Covid Table, Covid Map, Covid List and Covid Chart as its parameters.
   * @param {object} table - instance of Covid Table class.
   */
  constructor(table) {
    this.table = table;
    this.name = 'Covid-19 Dashboard';
    this.header = createElement('h1', 'app-name', this.name);
    this.container = document.getElementById('root');
    this.table.updateData();
    this.table.bindSelectChange();
  }
}

const app = new App(new CovidTable());
app.container.append(app.header);
app.container.append(app.table.element);
