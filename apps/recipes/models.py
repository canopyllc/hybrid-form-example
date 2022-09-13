from django.db import models
from django.urls import reverse


class BaseListModel(models.Model):
    name = models.CharField(max_length=100)

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


class Recipe(models.Model):
    name = models.CharField(max_length=100)
    instructions = models.TextField(null=True, blank=True)
    ingredients = models.TextField(null=True, blank=True)
    recipe_type = models.ForeignKey("recipes.RecipeType", null=True, blank=True, on_delete=models.RESTRICT)
    meal_times = models.ManyToManyField("recipes.MealTime", blank=True)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("recipes:update", args=(self.pk,))
