<template>
  <div
    class="c-input"
    :class="wrapperClass"
  >
    <div class="c-input__inner">
      <label
        class="form-label c-input__label"
        :class="{required, 'visually-hidden': hideLabel, ...labelClass}"
        :for="fieldId"
        v-html="fieldLabel"
      />
      <froala
        :id="fieldId"
        ref="input"
        :name="name"
        :placeholder="placeholder"
        :options="options"
        :value="localValue"
        :disabled="disabled"
        :class="inputClass"
        :aria-describedby="`${fieldId}-help-text`"
        @keydown.enter="onEnter"
        @input="onInputValue"
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
import Froala from '@/js/components/abstract/Froala';
import formInput from '@/js/mixins/formInput';
import conditionalField from '@/js/mixins/conditionalField';

export default {
  name: 'RichTextInput',
  components: {Froala},
  mixins: [formInput, conditionalField],
  props: {
    /**
     * Options for froala like toolbarButtons etc
     * @see https://froala.com/wysiwyg-editor/docs/options/
     * example: {height: 400}
     */
    options: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
