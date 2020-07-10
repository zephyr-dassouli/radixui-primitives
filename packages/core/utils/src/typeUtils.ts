/**
 * Checks whether or not a value is a boolean.
 *
 * @param value
 */
function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks whether or not a value is a function.
 *
 * @param value
 */
function isFunction(value: any): value is Function {
  return !!(value && {}.toString.call(value) === '[object Function]');
}

/**
 * Checks whether or not a value is a number.
 *
 * @param value
 */
function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks whether or not a value is a string.
 *
 * @param value
 */
function isString(value: any): value is string {
  return typeof value === 'string';
}

export { isBoolean, isFunction, isNumber, isString };
