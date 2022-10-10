from django.db import models
from django.urls import reverse

from apps.base.model_fields import PlainCharField, PlainTextField


class BaseListModel(models.Model):
    name = PlainCharField(max_length=100)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class RecipeType(BaseListModel):
    class Choices(models.TextChoices):
        ENTREE = "Entree"
        DRINK = "Drink"
        DESERT = "Desert"
        SNACK = "Snack"
        APPETIZER = "Appetizer"


class MealTime(BaseListModel):
    class Choices(models.TextChoices):
        BREAKFAST = "Breakfast"
        BRUNCH = "Brunch"
        LUNCH = "Lunch"
        DINNER = "Dinner"


class DietType(BaseListModel):
    class Choices(models.TextChoices):
        KETO = "Keto"
        PALEO = "Paleo"
        DAIRY_FREE = "Dairy Free"
        VEGAN = "Vegan"


class Recipe(models.Model):
    name = PlainCharField(max_length=100)
    instructions = PlainTextField(null=True, blank=True)
    ingredients = PlainTextField(null=True, blank=True)
    recipe_type = models.ForeignKey("recipes.RecipeType", null=True, blank=True, on_delete=models.RESTRICT)
    meal_times = models.ManyToManyField("recipes.MealTime", blank=True)
    is_diet_friendly = models.BooleanField(null=True)
    diet_types = models.ManyToManyField("recipes.DietType", blank=True)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("recipes:update", args=(self.pk,))
