from django.db import models


class RecipeType(models.Model):
    name = models.CharField(max_length=100)

    class Choices(models.TextChoices):
        ENTREE = "Entree"
        DRINK = "Drink"
        DESERT = "Desert"
        SNACK = "Snack"
        APPETIZER = "Appetizer"


class MealTime(models.Model):
    name = models.CharField(max_length=100)

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
