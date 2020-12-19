import createElement from './utils/create-element';
import SELECTS from './const/selects';
import Switchers from './switchers';

/**
  * Get markup for the Covid Map.
  * @param {function} - takes Data Base.
  * @returns {DOM element} - DOM element with Covid-Map.
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
    this.mapOptions = {
      center: [0, 0],
      zoom: 2,
      worldCopyJump: true,
    };
    this.circleOptions = {
      fill: 'true',
      color: 'red',
      fillColor: 'red',
      fillRule: 'nonzero',
      fillOpacity: 0.4,
      weight: 0.5,
    };
    this.geoOptions = {
      color: 'blue',
      fillColor: 'white',
      fillRule: 'nonzero',
      fillOpacity: 0.1,
      weight: 1,
    };
    this.popupOptions = {
      closeButton: false,
    };
    this.switchersContainer = [];
    this.map = [];
    this.circleLayerGroup = [];
    this.geoLayerGroup = [];
    this.myFetchSetting = {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
    };
    this.oneHundredThousand = 100000;
    this.zoomCircle = 11;
    this.saveEl = ['AFG', 'ALB', 'DZA', 'AGO', 'ARG', 'ARM', 'AUS', 'AUT', 'AZE', 'BHS', 'BGD', 'BLR',
      'BEL', 'BLZ', 'BEN', 'BMU', 'BTN', 'BOL', 'BIH', 'BWA', 'BRA', 'BRN', 'BGR', 'BFA', 'BDI', 'KHM',
      'CMR', 'CAN', 'CAF', 'TCD', 'CHL', 'CHN', 'COL', 'COG', 'CRI', 'HRV', 'CUB', 'CYP', 'CZE', 'CIV',
      'COD', 'DNK', 'DJI', 'DOM', 'ECU', 'EGY', 'SLV', 'GNQ', 'ERI', 'EST', 'ETH', 'FLK', 'FJI', 'FIN',
      'FRA', 'GUF', 'GAB', 'GMB', 'GEO', 'DEU', 'GHA', 'GRC', 'GRL', 'GTM', 'GIN', 'GNB', 'GUY', 'HTI',
      'HND', 'HUN', 'ISL', 'IND', 'IDN', 'IRN', 'IRQ', 'IRL', 'ISR', 'ITA', 'JAM', 'JPN', 'JOR', 'KAZ',
      'KEN', 'KWT', 'KGZ', 'LAO', 'LVA', 'LBN', 'LSO', 'LBR', 'LBY', 'LTU', 'LUX', 'MKD', 'MDG', 'MWI',
      'MYS', 'MLI', 'MLT', 'MRT', 'MEX', 'MDA', 'MNG', 'MNE', 'MAR', 'MOZ', 'MMR', 'NAM', 'NPL', 'NLD',
      'NCL', 'NZL', 'NIC', 'NGA', 'NOR', 'OMN', 'PAK', 'PSE', 'PAN', 'PNG', 'PRY', 'PER', 'PHL', 'POL',
      'PRT', 'QAT', 'ROU', 'RUS', 'RWA', 'KOR', 'SAU', 'SEN', 'SRB', 'SLE', 'SVK', 'SVN', 'SLB', 'SOM',
      'ZAF', 'SSD', 'ESP', 'LKA', 'SDN', 'SUR', 'SWZ', 'SWE', 'CHE', 'SYR', 'TWN', 'TJK', 'TZA', 'THA',
      'TLS', 'TGO', 'TTO', 'TUN', 'TUR', 'ARE', 'GBR', 'USA', 'UGA', 'UKR', 'URY', 'UZB', 'VUT', 'VEN',
      'VNM', 'ESH', 'YEM', 'ZMB', 'ZWE', 'NER'];

    /**
* Creates switchers to the body of the list.
*/
    this.createQueryCountry = () => {
      document.querySelector('.map__sortingСriteria')
        .append(new Switchers(SELECTS.mapSelects).element);
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
  }

  /**
* Sets the position of the map on the country.
* @param {coordinate} - takes coordinates.
*/
  changeLocate(lat, long) {
    this.map.setView(new L.LatLng(lat, long), 3);
  }

  /**
* Get markup for the Map.
* @param {string} - value from first,second,third select.
*/
  createMapBody(valueName = this.returnSwitchersEl(0),
    period = this.returnSwitchersEl(1), valueType = this.returnSwitchersEl(2)) {
    let valueNameNow = this.returnSettingKeys[valueName];
    const periodNow = this.returnSettingKeys[period];
    const valueTypeNow = this.returnSettingKeys[valueType];

    if (periodNow) {
      valueNameNow = periodNow + valueName[0].toUpperCase() + valueName.slice(1);
    }

    if (valueName === 'Cases') {
      this.circleOptions.color = 'red';
      this.circleOptions.fillColor = 'red';
      this.zoomCircle = 11;
    } else if (valueName === 'Deaths') {
      this.circleOptions.color = 'green';
      this.circleOptions.fillColor = 'green';
      this.zoomCircle = 1;
    } else if (valueName === 'Recovered') {
      this.circleOptions.color = 'yellow';
      this.circleOptions.fillColor = 'yellow';
      this.zoomCircle = 8;
    }

    if (this.map.length === 0) {
      this.map = new L.Map('mapid', this.mapOptions);
      const layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', { maxZoom: 10 });
      this.map.addLayer(layer);
    }
    this.geoLayerGroup = new L.LayerGroup();
    this.circleLayerGroup = new L.LayerGroup();

    this.dataBase.then((result) => {
      result.forEach((element) => {
        if (this.saveEl.find((el) => el === element.countryInfo.iso3)) {
          fetch(`https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${element.countryInfo.iso3}.geo.json`,
            this.myFetchSetting)
            .then((res) => res.json())
            .then((data) => {
              const countPerson = valueTypeNow
                ? Math.floor((element[valueNameNow]
                  / (element.population / this.oneHundredThousand)))
                : element[valueNameNow];

              const geo = L.geoJSON(data, this.geoOptions).bindPopup(new L.Popup(this.popupOptions)
                .setLatLng([element.countryInfo.lat, element.countryInfo.long])
                .setContent(`<h2 class = 'map__country_name'>${element.country}</h2><p class = 'map__country_value'>${countPerson} people</p>`))
                .addTo(this.map);

              this.geoLayerGroup.addLayer(geo);
            })
            .then(() => {
              const countPerson = valueTypeNow ? Math.floor((element[valueNameNow]
                / (element.population / this.oneHundredThousand)))
                : element[valueNameNow];

              const circle = L.circle([element.countryInfo.lat, element.countryInfo.long],
                countPerson / this.zoomCircle, this.circleOptions)
                .bindPopup(new L.Popup(this.popupOptions)
                  .setLatLng([element.countryInfo.lat, element.countryInfo.long])
                  .setContent(`<h2 class = 'map__country_name'>${element.country}</h2>
                  <p class = 'map__country_value'>${countPerson} people</p>`));

              this.circleLayerGroup.addLayer(circle);
              this.saveEl.push(element.countryInfo.iso3);
            });
        }
      });
    })
      .then(() => {
        this.geoLayerGroup.addTo(this.map);
      })
      .then(() => {
        this.circleLayerGroup.addTo(this.map);
      });
  }

  /**
* Get markup for the Map legend.
*/
  createMapLegend() {
    document.querySelector('.map').append(createElement('div', 'map__legend', ''));

    document.querySelector('.map__legend').append(createElement('h2', 'map__legend_name', 'Map Legend'));

    document.querySelector('.map__legend').append(createElement('h2', 'map__legend_body', ''));
    for (let i = 0; i < 3; i += 1) {
      document.querySelector('.map__legend_body').append(createElement('div', 'map__legend_item', ''));
    }
    for (let i = 0; i < 3; i += 1) {
      document.querySelectorAll('.map__legend_item')[i].append(createElement('div', 'map__legend_circle', ''));
      document.querySelectorAll('.map__legend_item')[i].append(createElement('div', 'map__legend_circleName', `${Object.keys(this.returnSettingKeys)[i]}`));
    }
    for (let i = 0; i < 3; i += 1) {
      Object.assign(document.querySelectorAll('.map__legend_circle')[i].style, { 'background-color': ['red', 'green', 'yellow'][i] });
    }
  }

  /**
* Get markup for the body map.
*/
  createMap() {
    document.querySelector('#root').append(createElement('div', 'map', ''));
    const mapBody = document.querySelector('.map');

    mapBody.append(createElement('div', 'map__sortingСriteria', ''));
    this.createQueryCountry();

    const mapid = document.createElement('div');
    mapid.id = 'mapid';
    mapBody.appendChild(mapid);

    this.createMapLegend();

    this.createMapBody();

    this.bindSelectChange();

    this.setCountryPlace();

    this.switchersContainer = mapBody.querySelector('.switchers');
  }

  /**
 * Handler for updating all the data in the app.* Handler for updating all the data in the app.
 */
  updateDataHandler() {
    this.geoLayerGroup.clearLayers();
    this.circleLayerGroup.clearLayers();
    this.createMapBody();
  }

  /**
* Determines the selected country from the list.
*/
  setCountryPlace() {
    document.querySelector('.list__listCountry').addEventListener('click', (evt) => {
      if (evt.path[0].className === 'listCountry__countryEl' || evt.path[1].className === 'listCountry__countryEl') {
        this.dataBase.then((result) => {
          const country = result.find((el) => el.country === (evt.path[0].className === 'listCountry__countryEl'
            ? evt.path[0].children[1].innerText : evt.path[1].children[1].innerText)).countryInfo;

          this.changeLocate(country.lat, country.long);
        });
      }
    });
  }

  bindSelectChange() {
    document.querySelectorAll('.switchers').forEach((el) => {
      el.addEventListener('change', (evt) => {
        this[evt.target.name] = evt.target.value;

        this.geoLayerGroup.clearLayers();
        this.circleLayerGroup.clearLayers();
        this.createMapBody();
      });
    });
  }
}
