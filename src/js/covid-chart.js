import createElement from './utils/create-element';
import Switchers from './switchers';
import FullScreenButton from './full-screen-button';
import SELECTS from './const/selects';
import PARAMETERS from './const/parameters';
import DATASET_INDEXES from './const/dataset-indexes';
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
    this.switchersContainer.append(new FullScreenButton().element);
    this.fullScreenButton = this.element.querySelector('.full-screen-button');
    this.bindFullScreen();

    this.country = null;
    this.valueName = PARAMETERS.valueName.cases;
    this.period = PARAMETERS.period.allTime;
    this.valueType = PARAMETERS.valueType.absolute;
  }

  /**
   * Draw new Covid Chart.
   * @param {string} country - A country name. If there is none, a global chart will be drawn.
   * @param {object} dataPromise - Promise with datasets.
   * @returns {object} The chart.
   */
  buildChart(country, dataPromise) {
    dataPromise
      .then((datasets) => {
        let historicalData;
        if (country) {
          historicalData = datasets[DATASET_INDEXES.historical].timeline;
        } else {
          historicalData = datasets[DATASET_INDEXES.historical];
        }
        const { population } = datasets[DATASET_INDEXES.today];
        const dataLabels = Object.keys(historicalData[this.valueName]).map((key) => new Date(key));
        let dataValues = Object.values(historicalData[this.valueName]);
        if (this.period === PARAMETERS.period.lastDay) {
          dataValues = dataValues.map((value, index, arr) => {
            let result = value - arr[index - 1] || 0;
            if (result < 0) {
              result = 0;
            }
            return result;
          });
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
            aspectRatio: 2,
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
   * @param {function} - Handler passed by the app.
   */
  bindSelectChange(handler) {
    this.switchersContainer.addEventListener('change', (evt) => {
      this[evt.target.name] = evt.target.value;
      handler(evt.target.name, evt.target.value);
    });
  }

  /**
   * Destroy previous chart and build a new one.
   * @param {string} country - A country name. If there is none, a global chart will be drawn.
   * @param {object} dataPromise - Promise with datasets.
   */
  updateData(country, dataPromise) {
    this.currentChart.destroy();
    this.buildChart(country, dataPromise);
  }

  /**
   * Expand or shrink the chart when full screen button is clicked.
   */
  bindFullScreen() {
    this.fullScreenButton.addEventListener('click', () => {
      this.element.classList.toggle('covid-chart--full');
      this.fullScreenButton.classList.toggle('full-screen-button--active');
    });
  }
}
