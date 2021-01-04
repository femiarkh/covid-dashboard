import addCommas from './utils/add-commas';

export default function getChartConfig(country, labels, data) {
  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${country || 'All the world'}`,
        backgroundColor: 'rgb(227, 10, 23)',
        borderColor: 'rgb(227, 10, 23)',
        data,
      }],
    },
    options: {
      responsive: true,
      aspectRatio: 1.5,
      maintainAspectRatio: false,
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
  };
}
