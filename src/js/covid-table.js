import createElement from './utils/create-element';
import Switchers from './switchers';
import SELECTS from './const/selects';
import addCommas from './utils/add-commas';

/**
 * Get markup for the Covid Table.
 * @returns {string} String with Covid Table markup.
 */
function getCovidTableMarkup() {
  const switchers = new Switchers(SELECTS.tableSelects).element;
  return `<tr><th class="covid-table__location" colspan="2">All the world</th></tr>
          <tr>
            <td class="covid-table__switchers" colspan="2">
              <div class="switchers">
                ${switchers.innerHTML}
              </div>
            </td>
          </tr>
          <tr class="covid-table__row">
            <td class="covid-table__stat-name">Cases:</td>
            <td class="covid-table__stat-value covid-table__stat-value--cases">69,765,806</td>
          </tr>
          <tr class="covid-table__row">
            <td class="covid-table__stat-name">Deaths:</td>
            <td class="covid-table__stat-value covid-table__stat-value--deaths">1,583,211</td>
          </tr>
          <tr class="covid-table__row">
            <td class="covid-table__stat-name">Recovered:</td>
            <td class="covid-table__stat-value covid-table__stat-value--recovered">44,924,269</td>
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
  }

  updateData() {
    const url = 'https://disease.sh/v3/covid-19/all';
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.casesContainer.textContent = addCommas(data.cases);
        this.deathsContainer.textContent = addCommas(data.deaths);
        this.recoveredContainer.textContent = addCommas(data.recovered);
      });
  }
}
