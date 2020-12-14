/**
 * Create an HTML element with specified className and innerHTML.
 * @param {string} tag - HTML tag.
 * @param {string} className - Class or number of classes.
 * @param {string} template - Inner HTML of created element.
 * @returns {HTMLElement} - Created HTML element.
 */
export default function createElement(tag, className, template) {
  const element = document.createElement(tag);
  element.innerHTML = template;
  if (className) {
    element.className = className;
  }
  return element;
}
