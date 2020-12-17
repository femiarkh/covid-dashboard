/**
 * Format any number adding commas to its integer part.
 * @param {number} number - A number.
 * @returns {string} String of a number formatted with commas.
 */
export default function addCommas(number) {
  const array = number.toString().split('');
  const decimalIndex = array.indexOf('.');
  const startingIndex = decimalIndex === -1 ? array.length - 1 : decimalIndex - 1;
  const STARTING_ORDER = 1;
  const DIVIDE_BY = 3;
  let order = STARTING_ORDER;
  for (let i = startingIndex; i > 0; i -= 1) {
    if (order % DIVIDE_BY === 0) {
      array.splice(i, 0, ',');
    }
    order += 1;
  }
  return array.join('');
}
