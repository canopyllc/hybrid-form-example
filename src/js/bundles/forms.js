import { createApp } from 'vue';
import SelectInput from '@/components/forms/SelectInput';
import TextInput from '@/components/forms/TextInput';
import NumberInput from '@/components/forms/NumberInput';
import RichTextInput from '@/components/forms/RichTextInput';
import TextareaInput from '@/components/forms/TextareaInput';

window.SetupForms = () => {
  const app = createApp({}),
    globalComponents = [
      TextareaInput,
      SelectInput,
      TextInput,
      NumberInput,
      RichTextInput,
    ];

  // Register global components
  globalComponents.forEach((component) => {
    app.component(component.name, component);
  });

  app.mount('#vue-form');
};
