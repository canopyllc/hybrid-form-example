from django.db.models import CharField, TextField
from django.utils.html import strip_tags


class PlainTextField(TextField):
    description = "A sub-class of the TextField that strips out all HTML."

    def to_python(self, value):
        value = super().to_python(value)
        return strip_tags(value)


class PlainCharField(CharField):
    description = "A sub-class of the CharField that strips out all HTML."

    def to_python(self, value):
        value = super().to_python(value)
        return strip_tags(value)
