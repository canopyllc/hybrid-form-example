// @see https://github.com/lodash/lodash/blob/ddfd9b11a0126db2302cb70ec9973b66baec0975/lodash.js#L12036
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#using_tostring_to_detect_object_class
// eslint-disable-next-line import/prefer-default-export
export function isObject(item) {
  const plainObjectTypeString = Object.prototype.toString.call({});
  return Object.prototype.toString.call(item) === plainObjectTypeString;
}

/**
 * This method is similar to the `keyById` method but different in that it returns a
 * Javascript Map data structure.
 * One of the main benefits of using a map is:
 * A) It preserves INSERTION ORDER
 * B) With vue 3 and ref() we can have a reactive Map
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 * @see keyById
 *
 *
 * @param {Array} iterable
 * @param {{keyBy: String}} config
 */
export function toMap(iterable, config = {keyBy: 'id'}) {
  if (!Array.isArray(iterable)) throw new Error('right now you can only convert an array to a map');

  // If you give Map constructor array of arrays where each item in array is [key, value] you can use shorthand to create Map
  return new Map(iterable.map((value) => [value[config.keyBy], value]));
}
