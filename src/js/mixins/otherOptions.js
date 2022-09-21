import {debounce} from 'lodash';
import TextInput from '@/js/components/forms/TextInput';
import NumberInput from '@/js/components/forms/NumberInput';
import {isString} from '@/js/utils/stringUtil';
import {isObject} from '@/js/utils/javascript';

export default {
  props: {
    /**
     * Object where the key is unique id for field and value is "other" field value
     * When `input-subfield` event is emitted, the object emitted will use same key
     */
    subfieldValue: {
      type: [String, Object],
      default: '',
    },
  },
  emits: ['input-subfield'],
  data() {
    return {
      subfieldLocalValue: null,
    };
  },
  created() {
    if (Array.isArray(this.options) === false) {
      throw new Error('Other option mixin requires options to be set and to be an array');
    }
  },
  watch: {
    /**
     * Make sure we are up to date from backend on initial load and as prop changes
     */
    subfieldValue: {
      handler() {
        if (isString(this.subfieldValue)) {
          if (this.subfieldCount > 1) {
            this.subfieldLocalValue = {...this.optionSubfieldValues};
          } else {
            this.subfieldLocalValue = this.subfieldValue;
          }
        } else {
          this.subfieldLocalValue = this.subfieldValue;
        }
      },
      immediate: true,
    },
  },
  computed: {
    optionSubfieldValues() {
      return this.options
        .filter((option) => option.sub_field)
        .reduce((optionValues, option) => (
          {...optionValues, [option.sub_field.name]: option.sub_field.value}
        ), {});
    },
    subfieldCount() {
      return Object.keys(this.optionSubfieldValues).length;
    },
  },
  methods: {
    /**
     * debounce curries the args to the throttled function
     * Use debounce instead of throttle since we just want to wait to update until they're done typing
     * @override
     */
    onInput: debounce(function($event, optionSlug) {
      if (isObject(this.subfieldLocalValue)) {
        this.subfieldLocalValue[optionSlug] = $event.target.value;
      } else {
        this.subfieldLocalValue = $event.target.value;
      }
      this.$emit('input-subfield', this.subfieldLocalValue);
    }, 400),
    getComponent(componentKey) {
      // Beware cyclical dependencies if you add types to this enum
      const allowedSubfieldTypes = {
        text: TextInput,
        number: NumberInput,
      };
      return allowedSubfieldTypes[componentKey];
    },
    getSubfieldValue(option) {
      if (isString(this.subfieldLocalValue)) {
        return this.optionSubfieldValues[option.sub_field.name];
      }
      return this.subfieldLocalValue[option.sub_field.name];
    },
  },
};
