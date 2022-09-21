import {isString, toTitleCase} from '@/js/utils/stringUtil';

export default {
  data() {
    return {
      isFocused: false,
      localValue: null,
    };
  },
  emits: ['blur', 'focus', 'update:modelValue', 'enterKeydown', 'click', 'inputEvent'],
  props: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * The label for the field, supports HTML
     */
    label: {
      type: String,
      required: false,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hideLabel: {
      type: Boolean,
    },
    labelClass: {
      type: [Object, Array],
      required: false,
      default: () => ({}),
    },
    placeholder: {
      type: String,
      default: '',
    },
    // The "value" prop is reserved for v-model when specified. Whatever variable is passed to v-model will be accessible through the "value" prop.
    // See https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components for details.
    modelValue: {
      type: [Object, Array, String, Number, Boolean, Date],
      required: false,
      default: null,
    },
    /**
     * Automatically focuses this field when visible, only works with text inputs
     * @type {Boolean}
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Array,
      required: false,
      default: () => [],
    },
    hideErrors: {
      type: Boolean,
      default: false,
    },
    /**
     * HTML allowed help text that goes below the input
     */
    helpText: {
      type: String,
      required: false,
    },
    /**
     * A style modifier for the component
     */
    modifier: {
      type: String,
      default: '',
      validator(value) {
        return ['minimal', 'seamless', 'headline', 'float', 'inline-block', 'inline-hack', 'horizontal', 'crops', 'plants', ''].includes(value);
      },
    },
  },
  watch: {
    /**
     * Make sure we are up to date as prop changes
     *
     * Can't debounce this since its in a mixin - vue only calls it for first instance. really is only
     * inefficient for textarea
     */
    modelValue: {
      handler: 'updateLocalValue',
      immediate: true,
    },
  },
  mounted() {
    if ((this.modifier === 'minimal' || this.modifier === 'float')
      && this.placeholder) {
      throw new Error(`You cannot have a placeholder with modifier "${this.modifier}"`);
    }

    if (this.autofocus === true) {
      this.focus();
    }
  },
  computed: {
    fieldId() {
      if (this.id) {
        return this.id;
      }
      return `id_${this.name}`;
    },
    fieldLabel() {
      if (this.label) {
        return this.label;
      }
      if (isString(this.name)) {
        return toTitleCase(this.name);
      }
      return '';
    },
    wrapperClass() {
      return {
        'c-input--float': this.modifier === 'minimal', // must come first
        [`c-input--${this.modifier}`]: this.modifier,
        'is-focused': this.isFocused,
        'is-label-hidden': this.hideLabel,
        'has-value': this.hasValue,
        'has-invalid-feedback': this.errors.length > 0,
        'd-none': this.showConditionalField === false, // should this be somewhere else? like on conditional mixin
      };
    },
    hasValue() {
      if (typeof this.localValue === 'number') {
        return this.localValue >= 0;
      }
      return Boolean(this.localValue);
    },
    inputClass() {
      return {
        'is-invalid': this.errors.length > 0,
      };
    },
  },
  methods: {
    /**
     * @param value - this can either be same as this.value IF its coming from the watcher or if its called from elsewhere it might be different from this.value
     */
    updateLocalValue(value) {
      this.localValue = value === null || value === undefined ? this.modelValue : value;
    },
    /**
     * This is a method to make the local value available to outsiders in a non standard props down/events up scenario
     * @return {null}
     */
    getLocalValue() {
      return this.localValue;
    },
    // Using $refs is an exception not the rule.
    // https://vuejs.org/v2/guide/components-edge-cases.html#Accessing-Child-Component-Instances-amp-Child-Elements
    focus() {
      this.$refs.input.focus();
    },
    onFocus() {
      this.isFocused = true;
      this.$emit('focus');
    },
    onBlur() {
      this.isFocused = false;
      this.$emit('blur');
    },
    onEnter($event) {
      this.$emit('enterKeydown', $event);
    },
    onClick($event) {
      this.$emit('click', $event);
    },
    /**
     * "input" event is used by v-model by default.
     */
    onInput($event) {
      this.updateLocalValue($event.target.value);
      this.$emit('update:modelValue', $event.target.value);
      this.fireInputEvent($event);
    },
    /**
     * "input" event is used by v-model by default.
     * This method is used to fire input events from components that don't use the browser event
     * Such as, froala and vue-select, for instance with vue-select, $event is set to the currently selected option not an event
     * @param value (NOT an InputEvent)
     */
    onInputValue(value) {
      this.updateLocalValue(value);
      this.$emit('update:modelValue', value);
    },
    /**
     * "input" event is used by v-model by default.
     * The checkbox and radio fields store the value in target.checked instead
     * of target.value
     */
    onInputChecked($event) {
      this.updateLocalValue($event.target.checked);
      this.$emit('update:modelValue', $event.target.checked);
      this.fireInputEvent($event);
    },

    /**
     * This is required primarily to support legacy functions that required knowledge
     * of the original event, mainly the following:
     * @see updateResponseAnswer
     */
    fireInputEvent($event) {
      this.$emit('inputEvent', $event);
    },
  },
};
