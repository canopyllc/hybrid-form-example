import Swal from 'sweetalert2';

const defaultAlert = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    container: 'c-swal',
    cancelButton: 'btn btn-naked',
    confirmButton: 'btn btn-primary',
  },
  focusConfirm: false,
  showCancelButton: true,
});

// eslint-disable-next-line one-var
const snackbarAlert = Swal.mixin({
  toast: true,
  position: 'bottom',
  showConfirmButton: false,
  icon: undefined,
  // timerProgressBar: true,
  showClass: {
    popup: 'is-shown',
  },
  hideClass: {
    popup: 'is-hidden',
  },
  showCloseButton: true,
  onOpen: (theSnackbar) => {
    theSnackbar.addEventListener('mouseenter', Swal.stopTimer);
    theSnackbar.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

/**
 * Info Dialog - don't show cancel button, defaults to confirm button text of ok
 * @param title
 * @param text - the body. overrides html if both are given. Optional if html is provided
 * @param html - same as text, but allows html. If provided it will override text
 * @param confirmButtonText
 * @return {Promise<SweetAlertResult>}
 */
export async function success({
  title, text, html, confirmButtonText = 'Ok',
}) {
  return defaultAlert.fire({
    title,
    text,
    html,
    confirmButtonText,
    showCancelButton: false,
    icon: 'success',
  });
}

/**
 * Warning Dialog - A specific type of CONFIRM
 * @param title
 * @param text
 * @param html - same as text, but allows html. If provided it will override text
 * @param confirmButtonText
 * @return {Promise<Boolean>}
 */
export async function warning({
  title = 'Warning', text, html, confirmButtonText = 'Ok',
}) {
  const result = await defaultAlert.fire({
    title,
    text,
    html,
    confirmButtonText,
    icon: 'warning',
    customClass: {
      container: 'c-swal',
      cancelButton: 'btn btn-naked',
      confirmButton: 'btn btn-warning',
    },
  });
  return !!result.value;
}

/**
 * Error Dialog - don't show cancel button, defaults to confirm button text of ok
 * @param title
 * @param text
 * @param html - same as text, but allows html. If provided it will override text
 * @return {Promise<SweetAlertResult>}
 */
export async function error({title = 'Error', text, html}) {
  return defaultAlert.fire({
    title,
    text,
    html,
    icon: 'error',
    showCancelButton: false,
    customClass: {
      container: 'c-swal',
      confirmButton: 'btn btn-danger',
    },
  });
}

/**
 * @param title
 * @param text
 * @param confirmButtonText
 * @param type
 * @param html - same as text, but allows html. If provided it will override text
 * @return {Promise<Boolean>}
 */
export async function confirmPrompt({
  title = 'Confirm Delete', text, confirmButtonText = 'Yes, delete', type = 'error', html,
}) {
  if (!['success', 'error', 'warning'].includes(type)) throw new Error('type must be success or error');
  const result = await defaultAlert.fire({
    text,
    html,
    confirmButtonText,
    title,
    icon: type,
    customClass: {
      container: 'c-swal',
      cancelButton: 'btn btn-naked',
      confirmButton: `btn btn-${type === 'error' ? 'danger' : type}`,
    },
  });
  return !!result.value;
}

/**
 * Snackbars provide brief messages about app processes at the bottom of the screen.
 * @see https://material-components.github.io/material-components-web-catalog/#/component/snackbar
 * Note: don't need to return anything on this one.
 *
 * @param text - what should snackbar say?
 * @param type - one of warning, error, success, info, or question. right now just success or error implemented
 * @param timer - in ms, timeout before closing. 0 for infinite
 * @param target - The container element for adding popup into.
 */
export function snackbar({
  text, type = 'success', timer = 6000, position = 'bottom-end',
}) {
  if (!['success', 'error'].includes(type)) throw new Error(`Type must be success or error, instead found type "${type}"`);
  snackbarAlert.fire({
    position,
    timer: timer === 0 ? undefined : timer,
    title: text,
    customClass: {
      container: ['c-swal', 'c-swal--snackbar', `c-swal--${type}`].join(' '),
    },
  });
}

/**
 * Show arbitrary html inside a swal.
 *
 * NOTE - pass EITHER html or HTMLElement, NOT BOTH. Element is used by default. Using html is setting it to a static string of html
 * whereas the HTMLElement is a "live" element and any changes made to it will be rendered out as they're made.
 * This was done to support Vue updating dom nodes within a swal.
 *
 * @param {Object} params - Params
 * @param {String} params.html - a valid HTML string
 * @param {HTMLElement} params.HTMLElement - an actual element to be inserted
 * @param {String} params.title - optional title
 */
export function customAlert({html, HTMLElement, title}) {
  return Swal.fire({
    title,
    html: HTMLElement || html,
    showConfirmButton: false,
    customClass: {
      container: 'c-swal',
    },
  });
}
