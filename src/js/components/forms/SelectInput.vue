<template>
  <div
    class="c-input c-input--select"
    :class="{...wrapperClass, 'c-input--multiselect': multiple}"
  >
    <div v-if="showConditionalField" class="c-input__inner">
      <label
        class="form-label c-input__label"
        :class="{required, 'visually-hidden': hideLabel, ...labelClass}"
        @click="focus"
        v-html="fieldLabel"
      />

      <!--
        This select exists for simple forms where there is no Vue app orchestrating, rendering, and submitting the form.
        Rather in a simple form vue components are rendered into an HTML1.0 form and the form submission is handled by
        the `action` on the `<form>` tag.
      -->
      <select v-model="localValue" :name="name" :multiple="multiple" class="d-none">
        <option v-for="option in options" :key="option[optionLabel]" :value="option[optionValue]">
          {{ formatSelectedOptionLabel(option) }}
        </option>
      </select>

      <v-select
        :id="fieldId"
        ref="select"
        :model-value="localValue"
        :disabled="disabled"
        :multiple="multiple"
        :placeholder="placeholder"
        :options="options"
        :close-on-select="closeOnSelect"
        :clearable="clearable"
        :reduce="reduce"
        :get-option-label="formatSelectedOptionLabel"
        :class="inputClass"
        data-test-key="select-field"
        :aria-describedby="`${fieldId}-help-text`"
        :selectable="option => !option.is_group"
        @update:model-value="onInputValue"
        @search:focus="onFocus"
        @search:blur="onBlur"
        @search="onSearch"
      >
        <template #no-options>
          <span>Sorry, no matching options.</span>
        </template>
        <template v-if="multiple && removeMultiSelectChevron" #open-indicator>
          <!-- This is the least invasive way to remove the chevron if its a multi-select -->
        </template>

        <template #option="option">
          <span :class="{ group: option.is_group }" v-html="formatOptionLabel(option)" />
        </template>
      </v-select>

      <div v-if="helpText" :id="`${fieldId}-help-text`" class="form-text c-input__help-text">
        {{ helpText }}
      </div>
    </div>
    <template v-if="!hideErrors">
      <div
        v-for="error in errors"
        :key="error"
        class="c-input__errors"
        data-test-key="select-input-error"
      >
        {{ error }}
      </div>
    </template>
  </div>
</template>

<script>
// eslint-disable-next-line import/no-unresolved
import vSelect from 'vue-select';
import {isObject} from '@/js/utils/javascript';
import formInput from '@/js/mixins/formInput';
import conditionalField from '@/js/mixins/conditionalField';

export default {
  name: 'SelectInput',
  components: {
    vSelect,
  },
  mixins: [formInput, conditionalField],
  props: {
    /**
     * An array of strings or objects to be used as dropdown choices.
     * @type {Array}
     */
    options: {
      type: Array,
      default: () => [],
    },
    /**
     * Tells vue-select what key to use when generating option
     * labels when each `option` is an object.
     * @return {String}
     */
    optionLabel: {
      type: [String, Function],
      default: 'text',
    },
    /**
     * Tells vue-select what key to use when generating option
     * values when each `option` is an object. By default the whole object is used.
     * @type {String}
     */
    optionValue: {
      type: String,
      required: false,
      default: null,
    },
    /**
     * Equivalent to the `multiple` attribute on a `<select>` input.
     * @type {Boolean}
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Can the user clear the selected property.
     * @type {Boolean}
     */
    clearable: {
      type: Boolean,
      default: true,
    },
    /**
     * Close a dropdown when an option is chosen. Set to false to keep the dropdown
     * open (useful when combined with multi-select, for example)
     * @type {Boolean}
     */
    closeOnSelect: {
      type: Boolean,
      default: true,
    },
    removeMultiSelectChevron: {
      type: Boolean,
      default: true,
    },
    /**
     * HACK
     * This is a prop to handle a one off scenario where we have:
     * 1. Simple form AND
     * 2. has a formset AND
     * 3. formset includes select with OTHER options
     *
     * In this absurdly specific scenario the other field needs the index suffix for the backend
     * to know wtf is going on. Please avoid this if possible.
     */
    otherSuffix: {
      type: Number,
      default: undefined,
      required: false,
    },
  },
  computed: {
    // Checks if the local value is an object
    localValueIsObject() {
      return isObject(this.localValue);
    },
    // returns the option object if the local value is anything other than an object
    localValueOptionObject() {
      if (this.localValueIsObject) {
        return this.localValue;
      }
      // FIND THE RIGHT OBEJCT FROM THE OPTIONS
      return this.options.find((option) => option.value === this.localValue);
    },
    // returns boolean if the sub_field property is on the option object
    localValueHasSubfield() {
      if (this.localValueOptionObject !== undefined) {
        return 'sub_field' in this.localValueOptionObject;
      }
      return false;
    },
    optionSubfield() {
      return this.localValueHasSubfield ? this.localValueOptionObject.sub_field : undefined;
    },
  },
  watch: {
    modelValue() {
      if (this.multiple && this.modelValue) {
        // after options added to DOM
        this.$nextTick(() => {
          const vueSelectRefs = this.$refs.select.$refs,
                selectedOptions = Array.from(vueSelectRefs.selectedOptions.querySelectorAll('.vs__selected')),
                iterableValue = Array.isArray(this.value) ? this.value : [this.value];
          iterableValue.forEach((value, index) => {
            // if value is not an object OR "disabled" attribute is undefined or false, BAIL!
            if (!isObject(value) || !value.disabled) return;
            // add the disabled class if this one is disabled (based on index)
            selectedOptions[index].classList.add('vs__selected--disabled');
          });
        });
      }
    },
  },
  methods: {
    /**
     * This is a bit of a hack, have to do it since I can't reach inside the v-select element any other way
     */
    focus() {
      this.$refs.select.searchEl.focus();
    },
    reduce(option) {
      if (option[this.optionValue] !== undefined) {
        return option[this.optionValue];
      }
      return option;
    },
    /**
     * optionLabel can be a function, so call it if so.
     * If optionLabel is a string, use it to get the label.
     * If the option is a simple value (string/Number) just return it
     * @param option
     * @return {string}
     */
    formatOptionLabel(option) {
      if (typeof this.optionLabel === 'string') {
        if (option[this.optionLabel] !== undefined) {
          return option[this.optionLabel]; // return the label if we got it
        }
        if (option.label !== undefined) {
          return option.label;
        }
        if (typeof option === 'string' || typeof option === 'number') {
          return option; // if the options were an array of primative values, just return the value
        }
        return ''; // we don't know WTF is happening, just give back an empty string.
      }
      return this.optionLabel(option);
    },
    formatSelectedOptionLabel(option) {
      // Get rid of indent from nested values (since it doesn't make sense to render it in this context)
      // Leaving space in case there is &nbsp; in between words.
      const label = this.formatOptionLabel(option);
      if (typeof label === 'string') {
        return label.replace(/&nbsp;/g, ' ');
      }
      return label;
    },
    /**
     * Handler for @search - fired when typing in vue select component.
     * Also fires when a selection is made and the $event is then an empty string at that point
     *
     * Purposefully am not calling `updateLocalValue` because for simple forms it would nuke the current selection
     * @param $event - what was typed into search bar
     */
    onSearch($event) {
      if (this.optionsUrl) {
        this.searchText = $event;
      }
    },
  },

};
</script>
