/**
 * This supports functionality supported by form inputs that are actually a group
 * of <input>'s like a checkbox list or a radio group. They have options.
 */
export default {
  props: {
    options: {
      type: Array,
      required: true,
      default: () => [],
    },
    /**
     * The option text to show the user
     * Specifically the name of the attribute on the object to use
     * i.e. <input type="radio" /> option[optionLabel]
     */
    optionLabel: {
      type: String,
      default: 'display_name',
    },
    /**
     * The actual value on the input
     * Specifically the name of the attribute on the object to use
     * i.e. <input type="radio" value="option[optionValue]"
     */
    optionValue: {
      type: String,
      required: true,
      default: 'id',
    },

    /**
     * If TRUE, don't just emit the ID, but the whole option from the list of options
     * Requires that options is an array of objects
     */
    emitsOption: {
      type: Boolean,
    },

    /**
     * attribute on an option item to group by
     * i.e.
     * if options are [{display_name: 'rp1', year: 2020}, {display_name: 'rp2', year: 2020}]
     * and you pass group-by="year", you'll get:
     * {2020: [{display_name: 'rp1', year: 2020}, {display_name: 'rp2', year: 2020}]}
     */
    groupBy: {
      type: String,
      default: '',
    },
  },
  computed: {
    /**
     * Get array of the group names or keys we will use to group - only needed for grouped inputs
     * keys is necessary bc groupedOptions is sorted desc bc keys are integers
     * @return {Array}
     */
    groupKeys() {
      if (!this.groupBy) return [];
      return this.options.reduce((groupKeys, option) => {
        const value = `${option[this.groupBy]}`;
        if (!groupKeys.includes(value)) {
          groupKeys.push(value);
        }
        return groupKeys;
      }, []);
    },
    /**
     * Get array of the options by group key - only needed for grouped inputs
     * @return {Array}
     */
    groupedOptions() {
      if (!this.groupBy) return this.options;
      return this.options.reduce((options, item) => ({
        ...options,
        [item[this.groupBy]]: [
          ...(options[item[this.groupBy]] || []), // for first insert, can't spread undefined in array
          item,
        ],
      }), {});
    },
  },
  mounted() {
    if (this.localValue === undefined) {
      throw new Error('You must use the formInputOptions mixin within the context of a form component');
    }
  },
  methods: {
    optionId(index, fieldId) {
      return `${fieldId}-input-${index}`;
    },
    isOptionChecked(option) {
      return Boolean(this.localValue && this.localValue.includes(option[this.optionValue]));
    },
  },
};
