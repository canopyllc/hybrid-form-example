// @see https://github.com/lodash/lodash/blob/ddfd9b11a0126db2302cb70ec9973b66baec0975/lodash.js#L12036
// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#using_tostring_to_detect_object_class
// eslint-disable-next-line import/prefer-default-export
export function isObject(item) {
  const plainObjectTypeString = Object.prototype.toString.call({});
  return Object.prototype.toString.call(item) === plainObjectTypeString;
}
