from django import template

register = template.Library()


@register.filter
def js_boolean(val):
    if val is True:
        return "true"
    return "false"
