<template>
  <div
    class="c-input c-input--textarea"
    :class="wrapperClass"
  >
    <div v-if="showConditionalField" class="c-input__inner">
      <label
        class="form-label c-input__label"
        :class="{required, 'visually-hidden': hideLabel, ...labelClass}"
        :for="fieldId"
        v-html="fieldLabel"
      />
      <textarea
        :id="fieldId"
        ref="input"
        :name="name"
        :value="localValue"
        :disabled="disabled"
        class="form-control c-input__input"
        :class="{[`resize-${resize}`]: resize, ...inputClass}"
        :rows="rows"
        :placeholder="placeholder"
        :aria-describedby="`${fieldId}-help-text`"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      <div v-if="helpText" :id="`${fieldId}-help-text`" class="form-text c-input__help-text">
        {{ helpText }}
      </div>
    </div>
    <div
      v-for="error in errors"
      :key="error"
      class="c-input__errors"
    >
      {{ error }}
    </div>
  </div>
</template>

<script>
import formInput from '@/js/mixins/formInput';
import conditionalField from '@/js/mixins/conditionalField';

export default {
  name: 'TextAreaInput',
  mixins: [formInput, conditionalField],
  props: {
    rows: {
      type: Number,
      default: 3,
    },
    // correlates to resize css values - https://css-tricks.com/almanac/properties/r/resize/#article-header-id-0
    // Its a custom utility class defined in src/scss/utilities.scss
    resize: {
      type: String,
      default: '',
    },
  },
};

</script>

<style></style>
