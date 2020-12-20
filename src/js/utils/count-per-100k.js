/**
 * Turn absolute parameter into relative per 100k population.
 * @param {number} absoluteValue - Absolute parameter.
 * @param {number} population - Population number.
 * @returns {number} Parameter value per 100k population, two digits after dot.
 */
export default function countPer100k(absoluteValue, population) {
  return (absoluteValue / (population / 100000)).toFixed(4);
}
