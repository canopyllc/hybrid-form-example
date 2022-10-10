from django import forms

from crispy_forms.helper import FormHelper

from apps.recipes.models import Recipe


class RecipeForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(RecipeForm, self).__init__(*args, **kwargs)
        self.fields['is_diet_friendly'].base_template = 'hybrid_forms/widgets/radio.html'

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
        labels = {
            'is_diet_friendly': "Is this recipe diet friendly?",
            'diet_types': "What diet types are supported?"
        }
