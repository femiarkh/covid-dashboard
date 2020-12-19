import createElement from './utils/create-element';
import SELECTS from './const/selects';
import Switchers from './switchers';

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
    /**
   * Creates switchers to the body of the list.
   * @returns {DOM element} - add switchers.
   */
    this.createQueryCountry = () => {
      document.querySelector('.list__sortingСriteria')
        .append(new Switchers(SELECTS.listSelects).element);
    };
    /**
   * Returns the value input.
   * @param {number} - takes the seat number in switchers.
   * @returns {string} - the value select.
   */
    this.returnSwitchersEl = (num) => {
      const switchersEl = document.querySelectorAll('.switchers__switcher');
      return switchersEl[num].options[switchersEl[num].options.selectedIndex].text;
    };

    /**
   * Remove all list items.
   * @returns {} - clear list items.
   */
    this.clearListCountry = () => {
      if (document.querySelectorAll('.listCountry__countryEl')) {
        document.querySelectorAll('.listCountry__countryEl').forEach((element) => {
          element.remove();
        });
      }
    };

    /**
   * Change the appearance of the list.
   * @returns {css style} - changes css style.
   */
    this.setFocus = () => {
      document.querySelector('.list__inputCountry').value = '';
      document.querySelector('.list').classList.toggle('listFS');
      document.querySelector('.map').classList.toggle('mapNS');
      document.querySelector('#mapid').classList.toggle('mapidNS');
      document.querySelector('.map__sortingСriteria').classList.toggle('mapSC');
      document.querySelector('.map__legend').classList.toggle('opacity');
      document.querySelector('.switchers').classList.toggle('switchUp');
      document.querySelector('.list__listCountry').classList.toggle('switchUp');
    };
  }

  /**
 * Get markup for the List.
 * @param {string} - the string by which sorting occurs.
 * @param {string} - value from first,second,third select.
 * @returns {DOM element} - DOM element with list elements.
 */
  createListCountry(sorter,
    valueName = this.returnSwitchersEl(0),
    period = this.returnSwitchersEl(1),
    valueType = this.returnSwitchersEl(2)) {
    let valueNameNow = this.returnSettingKeys[valueName];
    const periodNow = this.returnSettingKeys[period];
    const valueTypeNow = this.returnSettingKeys[valueType];

    if (periodNow) {
      valueNameNow = periodNow + valueName[0].toUpperCase() + valueName.slice(1);
    }

    this.dataBase.then((result) => {
      result
        .sort((a, b) => {
          if (valueTypeNow) {
            return Math.floor((b[valueNameNow] / (b.population / this.oneHundredThousand)))
              - Math.floor((a[valueNameNow] / (a.population / this.oneHundredThousand)));
          }
          return b[valueNameNow] - a[valueNameNow];
        })
        .filter((el) => {
          if (sorter) {
            return el.country.toLowerCase().includes(sorter.toLowerCase());
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
            / (element.population / 100000))) : element[valueNameNow];
          countryEl.className = 'listCountry__countryEl';
          countryEl.innerHTML = `<img src='${element.countryInfo.flag}' alt='${element.country}' class ='countryEl__Img'>
    <span class ='countryEl__name'>${element.country}</span>
    <span class ='countryEl__count'>${countPerson}</span>`;
          document.querySelector('.list__listCountry').append(countryEl);
        });
    });
  }

  /**
 * Handler for updating all the data in the app.* Handler for updating all the data in the app.
 */
  updateDataHandler() {
    this.clearListCountry();
    this.createListCountry();
  }

  /**
  * Change the appearance of the list.
  * @returns {css style} - changes css style.
  */
  clearFocus() {
    document.querySelector('.list__inputCountry').value = '[enter country]';

    if (document.querySelector('.searchBody')) {
      document.querySelector('.searchBody').remove();
    }

    document.querySelector('.list').classList.toggle('listFS');
    document.querySelector('.map').classList.toggle('mapNS');
    document.querySelector('#mapid').classList.toggle('mapidNS');
    document.querySelector('.switchers').classList.toggle('switchUp');
    document.querySelector('.list__listCountry').classList.toggle('switchUp');
    setTimeout(() => {
      this.clearListCountry();
      document.querySelector('.list__listCountry').classList.toggle('opacity');
      document.querySelector('.map__sortingСriteria').classList.toggle('mapSC');
    }, 100);
    setTimeout(() => {
      this.createListCountry();
      document.querySelector('.map__legend').classList.toggle('opacity');
      document.querySelector('.list__listCountry').classList.toggle('opacity');
    }, 400);
  }

  /**
  * Sorts the list of countries.
  * @param {letter} - the characters by which the list is sorted.
  * @returns {DOM element} - new list of countries.
  */
  changeSearch(e) {
    document.querySelector('.list__listCountry').classList.toggle('opacity');
    setTimeout(() => {
      if (!document.querySelector('.searchBody')) {
        document.body.append(createElement('div', 'searchBody', ''));
      }

      if (new RegExp('[a-zA-Z]').test(e.key)) {
        this.clearListCountry();
        this.createListCountry(document.querySelector('.list__inputCountry').value);
      }
      document.querySelector('.list__listCountry').classList.toggle('opacity');
      setTimeout(() => {
      }, 100);
    }, 750);
  }

  /**
  * EventListener on click to input.
  * @returns {EventListener} - add eventListener to input.
  */
  clickInputCountry() {
    document.querySelector('.list__inputCountry').addEventListener('click', () => {
      this.setFocus();
    });
  }

  /**
  * EventListener on blur to input.
  * @returns {EventListener} - add eventListener to inputs.
  */
  blurInputCountry() {
    document.querySelector('.list__inputCountry').addEventListener('blur', () => {
      this.clearFocus();
    });
  }

  /**
  * EventListener on keyup to input.
  * @returns {EventListener} - adds a restriction on entered characters.
  */
  keyPressInputCountry() {
    document.querySelector('.list__inputCountry').addEventListener('keyup', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
      this.changeSearch(e);
    });
  }

  /**
  * Get markup for the body list.
  * @returns {DOM element} - DOM element with list elements.
  */
  createList() {
    document.querySelector('#root').append(createElement('div', 'list', ''));

    const listBody = document.querySelector('.list');

    listBody.append(createElement('div', 'list__queryCountry', ''));
    document.querySelector('.list__queryCountry').append(createElement('input', 'list__inputCountry', ''));
    document.querySelector('.list__inputCountry').value = '[enter country]';
    document.querySelector('.list__inputCountry').setAttribute('contenteditable', 'true');

    this.clickInputCountry();
    this.blurInputCountry();
    this.keyPressInputCountry();

    listBody.append(createElement('div', 'list__sortingСriteria', ''));
    this.createQueryCountry();

    listBody.append(createElement('div', 'list__listCountry', ''));
    this.createListCountry();

    this.bindSelectChange();

    this.switchersContainer = listBody.querySelector('.switchers');
  }

  bindSelectChange() {
    document.querySelectorAll('.switchers').forEach((el) => {
      el.addEventListener('change', (evt) => {
        this[evt.target.name] = evt.target.value;
        this.clearListCountry();
        this.createListCountry();
      });
    });
  }
}
