import {createApp} from 'vue';
import SelectInput from '@/js/components/forms/SelectInput';
import TextInput from '@/js/components/forms/TextInput';
import NumberInput from '@/js/components/forms/NumberInput';
import TextareaInput from '@/js/components/forms/TextareaInput';
import RadioGroupInput from '@/js/components/forms/RadioGroupInput';

window.SetupForms = ({csrfToken, conditional = true, urls = {}} = {}) => {
  const app = createApp({}),
        globalComponents = [
          TextareaInput,
          SelectInput,
          TextInput,
          NumberInput,
          RadioGroupInput,
        ];

  // Register global components
  globalComponents.forEach((component) => {
    app.component(component.name, component);
  });

  app.provide('csrfToken', csrfToken);
  app.provide('conditional', conditional);
  app.provide('urls', urls);

  app.mount('#vue-form');
};
