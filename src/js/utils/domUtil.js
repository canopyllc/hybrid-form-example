/**
 * @param {Element} elToWrap
 * @param {string} wrapperHtmlString - an HTML string containing a node to wrap around given element
 */
export function wrapEl(elToWrap, wrapperHtmlString) {
  if (!elToWrap) {
    console.warn('Element to wrap is undefined');
    return;
  }
  elToWrap.insertAdjacentHTML('beforebegin', wrapperHtmlString);
  const wrapper = elToWrap.previousElementSibling;
  wrapper.appendChild(elToWrap);
}

/**
 * Important to note that this function parses xml strings with the content type 'text/html'
 * Also, it returns an HTMLElement that wraps the content of the htmlString,
 * so to get result as string you call `wrapper.innerHTML`
 * and to get result as nodeList you would call `wrapper.childNodes`
 *
 * @param htmlString - text html content
 * @return {DocumentFragment} - a doc fragment containing all nodes in htmlstring
 */
export function parseNodesFromHtmlString(htmlString) {
  const parser = new DOMParser(),
        HTMLDocument = parser.parseFromString(htmlString, 'text/html'),
        documentFragment = document.createDocumentFragment();

  documentFragment.append(...HTMLDocument.body.childNodes);
  return documentFragment;
}

/**
 * DocumentFragment API does not include methods for serializing/deserializing nodes as text
 * Given a doc fragment this method gives us a string version of the html inside it.
 * @param {DocumentFragment} documentFragment
 * @return {*}
 */
export function documentFragmentToString(documentFragment) {
  const div = document.createElement('div');
  div.append(...documentFragment.childNodes);
  return div.innerHTML;
}

/**
 * This function takes a string that may contain HTML and returns the string with NO html tags
 * @param {string} html
 * @return {string}
 */
export function stripHtml(html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Scroll to the top (of the page or given element)
 * @param {Element|Window} target
 */
export function scrollTop(target = window) {
  target.scrollTo({top: 0, left: 0, behavior: 'smooth'});
}
