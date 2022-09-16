<template>
  <div
    class="c-input"
    :class="wrapperClass"
  >
    <div v-if="showConditionalField" class="c-input__inner">
      <label
        class="form-label c-input__label"
        :class="{required, 'visually-hidden': hideLabel, ...labelClass}"
        :for="fieldId"
        v-html="fieldLabel"
      />
      <input
        :id="fieldId"
        type="number"
        :min="min"
        :max="max"
        :name="name"
        :value="localValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="form-control c-input__input"
        :class="{...inputClass, 'text-end': modifier === 'seamless', 'c-input--arrowless-number': hideArrows}"
        :step="step"
        :aria-describedby="`${fieldId}-help-text`"
        @input="validateInput"
        @focus="onFocus"
        @blur="onBlur"
        @wheel="$event.target.blur()"
      >
      <!-- SLOT FOR SUBFIELD HERE !-->
      <slot name="subfield" />
      <slot name="afterLabel" />
      <div v-if="helpText" :id="`${fieldId}-help-text`" class="form-text c-input__help-text">
        {{ helpText }}
      </div>
    </div>
    <template v-if="!hideErrors">
      <div
        v-for="error in errors"
        :key="error"
        class="c-input__errors"
        data-test-key="number-input-error"
      >
        {{ error }}
      </div>
    </template>
  </div>
</template>

<script>
import formInput from '@/js/mixins/formInput';
import conditionalField from '@/js/mixins/conditionalField';

export default {
  name: 'NumberInput',
  mixins: [formInput, conditionalField],
  props: {
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
    },
    max: {
      type: Number,
      default: null,
    },
    isFloat: {
      type: Boolean,
      default: false,
    },
    hideArrows: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    validateInput($event) {
      if ((this.min >= 0 && $event.data === '-') // allow negative lat/long values by setting min to -1 (or anything less than 0)
              || $event.data === 'e' || $event.data === 'E' // disallow scientific notation numbers
      ) {
        $event.target.value = this.modelValue; // don't change the value if you input a minus
      } else if ($event.data === '.' && this.isFloat === false) {
        /**
         * This is just to disallow floating numbers within an integer field.
         * Because the browser just uses the whole number part as the number and doesn’t recognize the period as part of the value.
         * So to get rid of the period you have to set th value to zero and then reset it to the number it was before to actually remove the period.
         * https://oeieksu.atlassian.net/browse/PEARS-4298
         */
        $event.target.value = 0;
        $event.target.value = this.modelValue;
      }
      this.onInput($event);
    },
  },
};

</script>

<style></style>
