from django import forms
from django.contrib.auth.models import User


class NameForm(forms.ModelForm):
    class Meta(object):
        model = User
        fields = ("first_name", "last_name")
