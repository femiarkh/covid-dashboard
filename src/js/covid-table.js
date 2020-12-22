import createElement from './utils/create-element';
import Switchers from './switchers';
import FullScreenButton from './full-screen-button';
import SELECTS from './const/selects';
import PARAMETERS from './const/parameters';
import DATASET_INDEXES from './const/dataset-indexes';
import addCommas from './utils/add-commas';
import countPer100k from './utils/count-per-100k';

/**
 * Get markup for the Covid Table.
 * @returns {string} String with Covid Table markup.
 */
function getCovidTableMarkup() {
  const switchers = new Switchers(SELECTS.tableSelects).element;
  const fullScreenButton = new FullScreenButton().element;
  return `<tr><th class="covid-table__location" colspan="2">All the world</th></tr>
          <tr>
            <td class="covid-table__switchers" colspan="2">
              <div class="switchers">
                ${switchers.innerHTML}
                ${fullScreenButton.outerHTML}
              </div>
            </td>
          </tr>
          <tr class="covid-table__row">
            <td class="covid-table__stat-name">Cases:</td>
            <td class="covid-table__stat-value covid-table__stat-value--cases">No data yet</td>
          </tr>
          <tr class="covid-table__row">
            <td class="covid-table__stat-name">Deaths:</td>
            <td class="covid-table__stat-value covid-table__stat-value--deaths">No data yet</td>
          </tr>
          <tr class="covid-table__row">
            <td class="covid-table__stat-name">Recovered:</td>
            <td class="covid-table__stat-value covid-table__stat-value--recovered">No data yet</td>
          </tr>`;
}

/**
 * Class representing the Covid Table.
 */
export default class CovidTable {
  constructor() {
    this.element = createElement('table', 'covid-table', getCovidTableMarkup());
    this.locationContainer = this.element.querySelector('.covid-table__location');
    this.switchersContainer = this.element.querySelector('.switchers');
    this.casesContainer = this.element.querySelector('.covid-table__stat-value--cases');
    this.deathsContainer = this.element.querySelector('.covid-table__stat-value--deaths');
    this.recoveredContainer = this.element.querySelector('.covid-table__stat-value--recovered');
    this.fullScreenButton = this.element.querySelector('.full-screen-button');
    this.bindFullScreen();

    this.country = null;
    this.period = PARAMETERS.period.allTime;
    this.valueType = PARAMETERS.valueType.absolute;
  }

  /**
   * Update data in the table according to current select options.
   * @param {string} - Name of a country. If there is none, whole world data will be displayed.
   * @param {object} - Promise with datasets.
   */
  updateData(country, dataPromise) {
    dataPromise
      .then((dataSets) => {
        if (this.period === PARAMETERS.period.allTime) {
          const data = dataSets[DATASET_INDEXES.today];
          if (this.valueType === PARAMETERS.valueType.absolute) {
            this.casesContainer.textContent = addCommas(data.cases);
            this.deathsContainer.textContent = addCommas(data.deaths);
            this.recoveredContainer.textContent = addCommas(data.recovered);
          } else {
            const casesPer100k = countPer100k(data.cases, data.population);
            const deathsPer100k = countPer100k(data.deaths, data.population);
            const recoveredPer100k = countPer100k(data.recovered, data.population);
            this.casesContainer.textContent = addCommas(casesPer100k);
            this.deathsContainer.textContent = addCommas(deathsPer100k);
            this.recoveredContainer.textContent = addCommas(recoveredPer100k);
          }
        } else if (this.period === PARAMETERS.period.lastDay) {
          const data = dataSets[DATASET_INDEXES.yesterday];
          if (this.valueType === PARAMETERS.valueType.absolute) {
            this.casesContainer.textContent = addCommas(data.todayCases);
            this.deathsContainer.textContent = addCommas(data.todayDeaths);
            this.recoveredContainer.textContent = addCommas(data.todayRecovered);
          } else {
            const todayCasesPer100k = countPer100k(data.todayCases, data.population);
            const todayDeathsPer100k = countPer100k(data.todayDeaths, data.population);
            const todayRecoveredPer100k = countPer100k(data.todayRecovered, data.population);
            this.casesContainer.textContent = addCommas(todayCasesPer100k);
            this.deathsContainer.textContent = addCommas(todayDeathsPer100k);
            this.recoveredContainer.textContent = addCommas(todayRecoveredPer100k);
          }
        }
      })
      .catch((err) => err);

    if (country) {
      this.locationContainer.textContent = country;
    }
  }

  /**
   * Update state of the table every time select is changed.
   */
  bindSelectChange(handler) {
    this.switchersContainer.addEventListener('change', (evt) => {
      this[evt.target.name] = evt.target.value;
      handler(evt.target.name, evt.target.value);
    });
  }

  /**
   * Expand or shrink the table when full screen button is clicked.
   */
  bindFullScreen() {
    this.fullScreenButton.addEventListener('click', () => {
      this.element.classList.toggle('covid-table--full');
      this.fullScreenButton.classList.toggle('full-screen-button--active');
    });
  }
}
