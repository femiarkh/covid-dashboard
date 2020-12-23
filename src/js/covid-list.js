import createElement from './utils/create-element';
import SELECTS from './const/selects';
import DATASET_INDEXES from './const/dataset-indexes';
import PARAMETERS from './const/parameters';
import Switchers from './switchers';
import FullScreenButton from './full-screen-button';
import addCommas from './utils/add-commas';

/**
 * Get markup for the Covid List.
 * @param {function} - takes Data Base.
 * @returns {DOM element} - DOM element with Covid-list.
 */
export default class List {
  constructor(dataBase) {
    this.dataBase = dataBase;
    this.returnSettingKeys = {
      Cases: 'cases',
      Deaths: 'deaths',
      Recovered: 'recovered',
      'All time': '',
      'Last Day': 'today',
      Absolute: false,
      'Per 100k': true,
    };
    this.oneHundredThousand = 100000;
    this.switchersContainer = [];
    this.sorter = null;
    /**
   * Creates switchers to the body of the list.
   */
    this.createQueryCountry = () => {
      this.listBody.querySelector('.list__sortingСriteria')
        .append(new Switchers(SELECTS.listSelects).element);
    };
    /**
   * Returns the value input.
   * @param {number} - takes the seat number in switchers.
   * @returns {string} - the value select.
   */
    this.returnSwitchersEl = (num) => {
      const switchersEl = this.listBody.querySelectorAll('.switchers__switcher');
      return switchersEl[num].options[switchersEl[num].options.selectedIndex].text;
    };

    /**
   * Remove all list items.
   */
    this.clearListCountry = () => {
      if (this.listBody.querySelectorAll('.listCountry__countryEl')) {
        this.listBody.querySelectorAll('.listCountry__countryEl').forEach((element) => {
          element.remove();
        });
      }
    };

    /**
   * Change the appearance of the list.
   */
    this.setFocus = () => {
      this.listBody.querySelector('.list__inputCountry').value = '';
    };
  }

  /**
 * Get markup for the List.
 * @param {string} - the string by which sorting occurs.
 * @param {string} - value from first,second,third select.
 * @returns {DOM element} - DOM element with list elements.
 */
  createListCountry(country, dataPromise) {
    this.dataPromise = dataPromise;
    const valueName = this.returnSwitchersEl(0);
    const period = this.returnSwitchersEl(1);
    const valueType = this.returnSwitchersEl(2);
    let valueNameNow = this.returnSettingKeys[valueName];
    const periodNow = this.returnSettingKeys[period];
    const valueTypeNow = this.returnSettingKeys[valueType];

    if (periodNow) {
      valueNameNow = periodNow + valueName[0].toUpperCase() + valueName.slice(1);
    }
    this.listBody.classList.toggle('load');
    this.dataPromise.then((result) => {
      let data;
      const currentPeriod = this.listBody.querySelector('.switchers__switcher--period').value;
      if (currentPeriod === PARAMETERS.period.lastDay) {
        data = result[DATASET_INDEXES.allCountriesYesterday];
      } else {
        data = result[DATASET_INDEXES.allCountries];
      }
      data
        .sort((a, b) => {
          if (valueTypeNow) {
            return Math.floor((b[valueNameNow] / (b.population / this.oneHundredThousand)))
              - Math.floor((a[valueNameNow] / (a.population / this.oneHundredThousand)));
          }
          return b[valueNameNow] - a[valueNameNow];
        })
        .filter((el) => {
          if (this.sorter) {
            return el.country.toLowerCase().includes(this.sorter.toLowerCase());
          }
          return el.country.toLowerCase().includes(el.country.toLowerCase());
        })
        .filter((el) => {
          if (valueTypeNow) {
            return Number.isInteger(Math.floor((el[valueNameNow]
              / (el.population / this.oneHundredThousand)))) === true;
          }
          return Number.isInteger(el[valueNameNow]) === true;
        })
        .forEach((element) => {
          const countryEl = document.createElement('div');

          const countPerson = valueTypeNow ? Math.floor((element[valueNameNow]
            / (element.population / this.oneHundredThousand))) : element[valueNameNow];
          countryEl.className = 'listCountry__countryEl';
          countryEl.innerHTML = `<img src='${element.countryInfo.flag}' alt='${element.country}' class ='countryEl__Img'>
    <span class ='countryEl__name'>${element.country}</span>
    <span class ='countryEl__count'>${addCommas(countPerson)}</span>`;
          this.listBody.querySelector('.list__listCountry').append(countryEl);
        });
    }).then(() => {
      this.listBody.classList.toggle('load');
    });
  }

  /**
 * Handler for updating all the data in the app.* Handler for updating all the data in the app.
 */
  updateData(country, dataPromise) {
    this.clearListCountry();
    this.createListCountry(country, dataPromise);
  }

  /**
  * Change the appearance of the list.
  */
  clearFocus() {
    this.listBody.querySelector('.list__inputCountry').placeholder = '[enter country]';

    if (this.listBody.querySelector('.searchBody')) {
      this.listBody.querySelector('.searchBody').remove();
    }

    this.listBody.classList.toggle('listFS');
    this.listBody.querySelector('.switchers').classList.toggle('switchUp');
    this.listBody.querySelector('.list__listCountry').classList.toggle('switchUp');
    setTimeout(() => {
      this.clearListCountry();
      this.sorter = null;
      this.listBody.querySelector('.list__listCountry').classList.toggle('opacity');
    }, 200);
    setTimeout(() => {
      this.createListCountry(this.country, this.dataPromise);
      this.listBody.querySelector('.list__listCountry').classList.toggle('opacity');
    }, 400);
  }

  /**
  * Sorts the list of countries.
  * @param {letter} - the characters by which the list is sorted.
  */
  changeSearch(e) {
    this.listBody.querySelector('.list__listCountry').classList.toggle('opacity');
    setTimeout(() => {
      if (!this.listBody.querySelector('.searchBody')) {
        this.listBody.append(createElement('div', 'searchBody', ''));
      }

      if (new RegExp('[a-zA-Z]').test(e.key)) {
        this.clearListCountry();
        this.sorter = this.listBody.querySelector('.list__inputCountry').value;
        this.createListCountry(this.country, this.dataPromise);
      }
      this.listBody.querySelector('.list__listCountry').classList.toggle('opacity');
    }, 750);
  }

  /**
  * EventListener on click to input.
  * @returns {EventListener} - add eventListener to input.
  */
  clickInputCountry() {
    this.listBody.querySelector('.list__inputCountry').addEventListener('click', () => {
      this.setFocus();
      this.virtualKeyPressInputCountry();
    });
  }

  /**
  * EventListener on blur to input.
  * @returns {EventListener} - add eventListener to inputs.
  */
  blurInputCountry() {
    this.listBody.querySelector('.list__inputCountry').addEventListener('blur', () => {
      this.clearFocus();
    });
  }

  /**
  * EventListener on keyup to input.
  * @returns {EventListener} - adds a restriction on entered characters.
  */
  keyPressInputCountry() {
    this.listBody.querySelector('.list__inputCountry').addEventListener('keyup', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
      this.changeSearch(e);
    });
  }

  /**
   * Event listener for virtual keyboard.
   */
  virtualKeyPressInputCountry() {
    const keyboard = document.querySelector('.keyboard__keys');
    keyboard.addEventListener('click', (evt) => {
      if (/^[a-zA-Z]$/.test(evt.target.textContent)) {
        const ev = { key: evt.target.textContent };
        this.changeSearch(ev);
      }
    });
  }

  /**
  * Get markup for the body list.
  */
  createList(country, dataPromise) {
    this.listBody = createElement('div', 'list', '');

    this.listBody.append(createElement('div', 'list__queryCountry', ''));
    this.listBody.querySelector('.list__queryCountry').append(createElement('input', 'list__inputCountry', ''));
    this.listBody.querySelector('.list__inputCountry').placeholder = '[enter country]';
    this.listBody.querySelector('.list__inputCountry').setAttribute('contenteditable', 'true');
    this.listBody.querySelector('.list__inputCountry').classList.add('use-keyboard-input');

    this.clickInputCountry();
    this.blurInputCountry();
    this.keyPressInputCountry();
    this.listBody.append(createElement('div', 'list__sortingСriteria', ''));
    this.createQueryCountry();
    this.listBody.append(createElement('div', 'list__listCountry', ''));
    this.createListCountry(country, dataPromise);
    this.switchersContainer = this.listBody.querySelector('.switchers');
    this.switchersContainer.append(new FullScreenButton().element);
    this.fullScreenButton = this.listBody.querySelector('.full-screen-button');
    this.bindFullScreen();
  }

  bindSelectChange(handler) {
    this.listBody.querySelectorAll('.switchers').forEach((el) => {
      el.addEventListener('change', (evt) => {
        this[evt.target.name] = evt.target.value;
        handler(evt.target.name, evt.target.value);
      });
    });
  }

  bindCountryPick(handler) {
    this.listBody.querySelector('.list__listCountry').addEventListener('click', (evt) => {
      const countryEl = evt.target.closest('.listCountry__countryEl');
      if (!countryEl) {
        return;
      }
      const countryName = countryEl.querySelector('.countryEl__name').textContent;
      handler(countryName);
    });
  }

  /**
   * Expand or shrink the list when full screen button is clicked.
   */
  bindFullScreen() {
    this.fullScreenButton.addEventListener('click', () => {
      this.listBody.classList.toggle('covid-list--full');
      this.fullScreenButton.classList.toggle('full-screen-button--active');
    });
  }
}
