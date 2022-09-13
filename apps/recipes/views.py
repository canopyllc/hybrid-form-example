from django.contrib import messages
from django.urls import reverse
from django.views.generic import CreateView, DeleteView, ListView, UpdateView

from apps.recipes.forms import RecipeForm
from apps.recipes.models import Recipe


class FormSuccessMixin:
    def get_success_url(self) -> str:
        messages.success(self.request, "Recipe successfully saved.")
        return reverse("recipes:list")


class StaticContextMixin:
    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data.update(getattr(self, "static_context", {}))
        return data


class RecipeListView(StaticContextMixin, ListView):
    model = Recipe
    static_context = {"page_title": "Recipes"}


class RecipeCreateView(StaticContextMixin, FormSuccessMixin, CreateView):
    model = Recipe
    form_class = RecipeForm
    static_context = {"page_title": "Create Recipe"}


class RecipeUpdateView(StaticContextMixin, FormSuccessMixin, UpdateView):
    model = Recipe
    form_class = RecipeForm
    static_context = {"page_title": "Update Recipe"}


class RecipeDeleteView(StaticContextMixin, DeleteView):
    model = Recipe
    static_context = {"page_title": "Delete Recipe"}

    def get_success_url(self) -> str:
        messages.success(self.request, "Recipe successfully deleted.")
        return reverse("recipes:list")
