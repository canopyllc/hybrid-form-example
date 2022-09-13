from django.urls import path

from .views import RecipeCreateView, RecipeDeleteView, RecipeListView, RecipeUpdateView

app_name = "recipes"
urlpatterns = [
    path("", RecipeListView.as_view(), name="list"),
    path("create/", RecipeCreateView.as_view(), name="create"),
    path("<int:pk>/", RecipeUpdateView.as_view(), name="update"),
    path("<int:pk>/delete/", RecipeDeleteView.as_view(), name="delete"),
]
