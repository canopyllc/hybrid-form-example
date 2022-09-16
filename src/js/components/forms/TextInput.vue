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
        ref="input"
        :type="isPassword ? 'password' : 'text'"
        :name="name"
        :value="localValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClass"
        class="form-control c-input__input"
        :aria-describedby="`${fieldId}-help-text`"
        @keydown.enter="onEnter"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      >
      <div v-if="helpText" :id="`${fieldId}-help-text`" class="form-text c-input__help-text">
        {{ helpText }}
      </div>
    </div>
    <template v-if="!hideErrors">
      <div
        v-for="error in errors"
        :key="error"
        class="c-input__errors"
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
  name: 'TextInput',
  mixins: [formInput, conditionalField],
  props: {
    isPassword: {
      type: Boolean,
    },
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    },
  },
};

</script>

<style></style>
