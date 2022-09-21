/**
 * Example Usage in form template
 * {% block form_setup %}
 * <script>
 *   SetupForms({
 *     csrfToken: '{{ csrf_token }}',
 *     urls: {
 *         objectDetailUrl: "{{ upload_url }}",
 *     },
 *     conditional: {
 *       {{ form.geo_reach_limit.name }}: {
 *         parent: '{{ form.geo_reach_gaps_in.name }}',
 *         event: 'input',
 *         condition: (value) => Boolean(value),
 *       },
 *     },
 *   });
 * </script>
 * {% endblock form_setup %}
 */

export default {
  inject: ['conditional'],
  data() {
    return {
      showConditionalField: false,
      conditionalParent: {},
    };
  },
  computed: {
    fieldConditional() {
      if (this.conditional && this.conditional[this.name]) {
        return this.conditional[this.name];
      }
      return {};
    },
    fieldHasConditional() {
      return Object.keys(this.fieldConditional).length !== 0;
    },
  },
  mounted() {
    if (!this.fieldHasConditional) {
      this.showConditionalField = true;
      return;
    }

    this.conditionalParent = this.$root.$refs[this.fieldConditional.parent];

    if (this.name === undefined || this.conditionalParent.getLocalValue === undefined) {
      throw new Error('Required fields missing for conditional fields mixin');
    }

    // Run initial test to see if fields should be initially visible
    this.showFieldIfConditionPasses();

    // Setup listener for future changes to re-test conditional
    // WARNING This listener gets torn down if the entire template is added/removed from the DOM it seems
    // because if you add a v-if on the child at root level inside an input component this runs once,
    // but then never runs again.
    this.conditionalParent.$el.addEventListener(this.fieldConditional.event, this.showFieldIfConditionPasses);
  },
  methods: {
    showFieldIfConditionPasses() {
      const shouldShow = this.fieldConditional.condition(this.conditionalParent.getLocalValue());
      this.showConditionalField = Boolean(shouldShow);
    },
  },
};
