let inFlightRequestCount = 0,
    wrapperEl;
const SPECIAL_INPUT_TYPES = ['radio', 'checkbox'],
      EXCLUDED_INPUT_TYPES = ['hidden', 'files', 'password'];

/**
 * Setups the unsaved changes prompt to trigger when a user leaves the page with changes to form data
 * NOTE - depends on `data-unsaved-changes` added to body if form contains unsaved data that failed validation
 * @param {any} target any valid css selector that will return a form element
 */
export default {
  setup(target) {
    wrapperEl = document.querySelector(target);

    if (wrapperEl === null) {
      throw new Error(`The form target "${target}" was not found. Make sure you pass the correct target to monitor form
        changes. Hint: You might need to use the "layouts/form_ready_only.html" template or you might need to override
        the {% block form_setup %}{% endblock %} block.`.replace(/\n\s+/gm, ' '));
    }

    // save original data
    Array.from(wrapperEl.querySelectorAll('input, textarea')).forEach((el) => {
      if (![...SPECIAL_INPUT_TYPES, ...EXCLUDED_INPUT_TYPES].includes(el.type)) {
        el.dataset.origValue = el.value;
      } else if (SPECIAL_INPUT_TYPES.includes(el.type)) {
        el.dataset.origValue = el.checked;
      }
    });

    // setup listener
    window.addEventListener('beforeunload', (e) => {
      // This relies on the button type for form submissions being of the submission type
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
        return e.returnValue;
      }
      return undefined;
    });
  },
  incrementInFlight() {
    // @todo guard against < 0?
    inFlightRequestCount += 1;
  },
  decrementInFlight() {
    // @todo - guard against < 0?
    inFlightRequestCount -= 1;
  },
  /**
   * Are there unsaved changes from the time you called setup() until now?
   * @throws {Error} if you have not called setup() before calling this method
   * @return {boolean|boolean}
   */
  hasUnsavedChanges() {
    // Check to see if the values in the various input types have changed since page load
    const formHasChanges = Array.from(wrapperEl.querySelectorAll('input, textarea')).some((el) => {
      if (![...SPECIAL_INPUT_TYPES, ...EXCLUDED_INPUT_TYPES].includes(el.type)) {
        return el.dataset.origValue !== el.value;
      } if (SPECIAL_INPUT_TYPES.includes(el.type)) {
        return el.dataset.origValue !== `${el.checked}`;
      }
      return false;
    }),
      // on simple forms if there is a validation error, the initial data loaded on the page
      // will be unsaved data, so we depend on a data attribute existing on the <body> if
      // the form has errors to catch this scenario that would not be caught in formHasChanges
          formHasErrantChanges = document.body.dataset.unsavedChanges;

    if (inFlightRequestCount > 0) {
      return true; // always consider the form to have changes if changes saving are still in flight (even if they're clicking submit)
    }

    if (!this.isUnloadingToSave()) {
      return formHasChanges || formHasErrantChanges;
    }

    return false; // otherwise, no unsaved changes
  },
  /**
   * This relies on the button type being submit (i.e. <button type="submit">)
   * Also relies on document.activeElement which I think has a bug in safari
   * @return {boolean}
   */
  isUnloadingToSave() {
    return document.activeElement.type === 'submit';
  },
};
