from django import forms
from django.forms import RadioSelect, Textarea

from apps.recipes.models import Recipe


class RecipeForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(RecipeForm, self).__init__(*args, **kwargs)
        is_diet_friendly = self.fields["is_diet_friendly"]
        is_diet_friendly.widget = RadioSelect(choices=is_diet_friendly.widget.choices)

    class Meta:
        model = Recipe
        fields = [
            "name",
            "instructions",
            "ingredients",
            "recipe_type",
            "meal_times",
            "is_diet_friendly",
            "diet_types",
        ]
        labels = {"is_diet_friendly": "Is this recipe diet friendly?", "diet_types": "What diet types are supported?"}
