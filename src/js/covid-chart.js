import createElement from './utils/create-element';
import Switchers from './switchers';
import SELECTS from './const/selects';
import PARAMETERS from './const/parameters';
import URLS from './const/api-urls';
import addCommas from './utils/add-commas';
import countPer100k from './utils/count-per-100k';
import Chart from '../../node_modules/chart.js/dist/Chart.bundle';

/**
 * Get markup for the Covid Chart.
 * @returns {string} String with Covid Chart markup.
 */
function getCovidChartMarkup() {
  const switchers = new Switchers(SELECTS.chartSelects).element;
  return `${switchers.outerHTML}
          <canvas class="covid-chart__canvas" width="400"></canvas>`;
}

/**
 * Class representing the Covid Chart.
 */
export default class CovidChart {
  constructor() {
    this.element = createElement('div', 'covid-chart', getCovidChartMarkup());
    this.canvas = this.element.querySelector('.covid-chart__canvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentChart = null;
    this.switchersContainer = this.element.querySelector('.switchers');

    this.country = null;
    this.valueName = PARAMETERS.valueName.cases;
    this.period = PARAMETERS.period.allTime;
    this.valueType = PARAMETERS.valueType.absolute;
  }

  /**
   * Draw new Covid Chart.
   * @param {string} country - A country name. If there is none, a global chart will be drawn.
   * @returns {object} The chart.
   */
  buildChart(country) {
    let url;
    let populationURL;
    if (country) {
      url = `${URLS.diseaseSH}/historical/${country}?lastdays=365`;
      populationURL = `${URLS.diseaseSH}/countries/${country}?strict=true`;
    } else {
      url = `${URLS.diseaseSH}/historical/all?lastdays=365`;
      populationURL = `${URLS.diseaseSH}/all`;
    }
    const urls = [url, populationURL];
    const requests = urls.map((link) => fetch(link));
    Promise.all(requests)
      .then((responses) => Promise.all(responses.map((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })))
      .then((datasets) => {
        const mainData = country ? datasets[0].timeline : datasets[0];
        const { population } = datasets[1];
        const dataLabels = Object.keys(mainData[this.valueName]).map((key) => new Date(key));
        let dataValues = Object.values(mainData[this.valueName]);
        if (this.period === PARAMETERS.period.lastDay) {
          dataValues = dataValues.map((value, index, arr) => value - arr[index - 1] || 0);
        }
        if (this.valueType === PARAMETERS.valueType.per100k) {
          dataValues = dataValues.map((value) => countPer100k(value, population));
        }
        const chart = new Chart(this.ctx, {
          type: 'line',
          data: {
            labels: dataLabels,
            datasets: [{
              label: `${this.country || 'All the world'}`,
              backgroundColor: 'rgb(124, 154, 105)',
              borderColor: 'rgb(124, 154, 105)',
              data: dataValues,
            }],
          },
          options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
              xAxes: [{
                type: 'time',
                position: 'bottom',
                offset: true,
                time: {
                  unit: 'month',
                },
              }],
              yAxes: [{
                ticks: {
                  callback: (value) => addCommas(value),
                },
              }],
            },
            tooltips: {
              callbacks: {
                title: (tooltipItem) => {
                  const TIME = ', 12:00:00 am';
                  const timeLength = TIME.length;
                  return tooltipItem[0].label.slice(0, -timeLength);
                },
                label: (tooltipItem) => addCommas(tooltipItem.yLabel),
              },
            },
          },
        });
        this.currentChart = chart;
      });
  }

  /**
   * Update state of the chart every time select is changed.
   */
  bindSelectChange() {
    this.switchersContainer.addEventListener('change', (evt) => {
      this[evt.target.name] = evt.target.value;
      this.currentChart.destroy();
      this.buildChart(this.country);
    });
  }
}
