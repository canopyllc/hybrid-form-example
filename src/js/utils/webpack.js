/**
 * For a require.context statement, require all files matching glob.
 * i.e. to require all SVGs,
 * ```
 * importAll(require.context('@/assets/svg', false, /.svg$/));
 * ```
 *
 * @see https://webpack.js.org/guides/dependency-management/#context-module-api
 */
// eslint-disable-next-line import/prefer-default-export
export function importAll(request) {
  request.keys().forEach(request);
}
