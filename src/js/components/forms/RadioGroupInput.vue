<template>
  <div
    class="c-input c-input--radio-group"
    :class="wrapperClass"
  >
    <div v-if="showConditionalField" class="c-input__inner">
      <label v-if="!hideLabel" class="form-label d-block c-input__label" v-html="fieldLabel" />
      <div v-for="(option, index) in options" :key="index" class="form-check">
        <input
          :id="optionId(index, fieldId)"
          :key="option[optionLabel]+'input'"
          :value="option[optionValue]"
          :disabled="disabled"
          :checked="isOptionChecked(option)"
          type="radio"
          :class="['form-check-input', option.sub_field ? 'mt-2' : '']"
          :name="name"
          autocomplete="off"
          @change="onInputChecked(option[optionValue])"
        >
        <label
          :key="option[optionLabel]+'label'"
          class="form-check-label"
          :for="optionId(index, fieldId)"
          v-html="option[optionLabel]"
        />
      </div>
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
import formInputOptions from '@/js/mixins/formInputOptions';
import formInput from '@/js/mixins/formInput';
import conditionalField from '@/js/mixins/conditionalField';
import {isObject} from '@/js/utils/javascript';

export default {
  name: 'RadioGroupInput',
  mixins: [formInput, formInputOptions, conditionalField],
  emits: ['update:modelValue'],
  computed: {
    isLocalValueObject() {
      return isObject(this.localValue);
    },
  },
  methods: {
    /**
     * @override
     */
    onInputChecked(value) {
      this.localValue = value;
      if (this.emitsOption) {
        this.$emit('update:modelValue', this.options.find((opt) => opt[this.optionValue] === value));
        return;
      }
      this.$emit('update:modelValue', value);
    },
    isOptionChecked(option) {
      return this.localValue === option[this.optionValue] || (this.isLocalValueObject && this.localValue[this.optionValue] === option[this.optionValue]);
    },
  },
};
</script>
