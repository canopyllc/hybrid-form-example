import SelectInput from '@/js/components/forms/SelectInput';
import TextInput from '@/js/components/forms/TextInput';
import NumberInput from '@/js/components/forms/NumberInput';
// import DateTimeInput from '@/js/components/forms/DateTimeInput';
import TextareaInput from '@/js/components/forms/TextareaInput';
import RadioGroupInput from '@/js/components/forms/RadioGroupInput';
// import CheckboxInput from '@/js/components/forms/CheckboxInput';
import RichTextInput from '@/js/components/forms/RichTextInput';
// import RangeInput from '@/js/components/forms/RangeInput';

// left side is form config value, right side is component
export const componentTypeMap = {
  select: SelectInput,
  text: TextInput,
  number: NumberInput,
  // datetime: DateTimeInput,
  textarea: TextareaInput,
  // checkbox: CheckboxInput,
  rich_text: RichTextInput,
  radio: RadioGroupInput,
  // range: RangeInput,
},
             dynamicFormStyle = {
               FULL: 'full',
               SUMMARY: 'summary',
             };
