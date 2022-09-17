import json

from django import template
from django.forms.models import ModelChoiceIteratorValue
from django.forms.renderers import TemplatesSetting
from django.utils.safestring import mark_safe

register = template.Library()


@register.simple_tag
def hybrid_form(form):
    renderer = TemplatesSetting()
    return mark_safe(renderer.render("hybrid_forms/base_form.html", {"form": form}))


@register.simple_tag
def hybrid_field(field):
    field.vue_value = field.value() if field.value() is not None else ""
    if isinstance(field.vue_value, str):
        field.vue_value = json.dumps(field.vue_value)
    choices = getattr(field.field.widget, "choices", None)
    if choices is not None:
        field.vue_options = mark_safe(
            [{"value": v.value if isinstance(v, ModelChoiceIteratorValue) else v, "name": n} for v, n in choices]
        )
    field.vue_errors = [str(e) for e in field.form.errors.get(field.name, [])]
    field.required = field.field.required
    field.vue_multiple = getattr(field.field.widget, "allow_multiple_selected", False)
    field.hide_label = getattr(field, "hide_label", False)
    # Update widget properties to work with vue_widget templates
    widget = field.field.widget
    widget.get_context = lambda name, value, attrs: {"field": field}
    widget.template_name = widget.template_name.replace("django/forms/widgets", "hybrid_forms/widgets")
    field.input_type = getattr(widget, "input_type", "")
    field.help_text = field.help_text or ""
    return mark_safe(field.as_widget())