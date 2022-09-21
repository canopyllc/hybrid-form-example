import {v4 as uuidv4} from 'uuid';

export function toTitleCase(input) {
  if (input === '') return input;
  return input.split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

// @see https://learnersbucket.com/examples/javascript/how-to-format-phone-number-in-javascript/
export function formatPhoneNumber(phone) {
  // Filter only numbers from the input
  let cleaned = (`${phone}`).replace(/\D/g, ''),
      // Check if the input is of correct length
      match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    // Start with 2, drop leading 1 if present
    return `(${match[2]}) ${match[3]}-${match[4]}`;
  }

  return phone;
}

export function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Naive implementation, suitable for average words
 * @see https://www.quickanddirtytips.com/education/grammar/a-versus-an for instance
 * @param {string} followingWord - the object following the indefinite article
 * @return {string} - a or an
 */
export function indefiniteArticle(followingWord) {
  return followingWord && /^[aieouAIEOU].*/.test(followingWord) ? 'an' : 'a';
}

export function isString(value) {
  return typeof value === 'string';
}

/**
 * Format as a currency
 * @param number
 * @return {string}
 */
export function asCurrency(number, options = {sign: false}) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  if (options.sign) {
    const parts = formatter.formatToParts(number);
    return parts.filter((part) => part.type !== 'currency').map((part) => part.value).join('');
  }
  return formatter.format(number);
}

/**
 * Add commas
 * @see https://docs.djangoproject.com/en/4.0/ref/contrib/humanize/#intcomma if you are in django template context - django equivalent filter
 * @param number
 * @return {string}
 */
export function formatInteger(number) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
  }).format(number);
}

/**
 * Transforms an integer value into its alphabetical equivalent
 * @example
 * intToChar(0) -> 'a'
 * intToChar(1) -> 'b'
 * intToChar(1, true) -> 'B'
 *
 * @param int {Number} the integer you want to convert
 * @param toCapital {Boolean} want a capital letter?
 * @returns {String} the character that represents the integer
 */
export function intToChar(int, toCapital = false) {
  // Will either be 65 for capital letters or 97 for lowercase letters
  const charCode = toCapital ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);

  return String.fromCharCode(charCode + int);
}

/**
 * Same as above but reverse
 * @param char the character you want to convert
 * @param toCapital are we converting from Capitals?
 * @return {Number}  the integer that represents the character
 */
export function charToInt(char, toCapital = false) {
  // Will either be 65 for capital letters or 97 for lowercase letters
  const charCode = toCapital ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
  return char.charCodeAt(0) - charCode;
}

export function generateUUID() {
  return uuidv4();
}
