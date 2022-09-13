from django import forms

from crispy_forms.helper import FormHelper

from apps.recipes.models import Recipe


class RecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = [
            "name",
            "instructions",
            "ingredients",
            "recipe_type",
            "meal_times",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False