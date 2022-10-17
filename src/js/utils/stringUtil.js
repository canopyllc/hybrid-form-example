export function toTitleCase(input) {
  if (input === '') return input;
  return input.split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function isString(value) {
  return typeof value === 'string';
}
