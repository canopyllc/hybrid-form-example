from typing import List

from django.conf import settings
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path

from apps.accounts.urls import accounts_router
from apps.base.views import NameChange, http_404, http_500

urlpatterns: List[path] = []

# Debug/Development URLs
if settings.DEBUG is True:
    import debug_toolbar

    urlpatterns += [
        path("__debug__/", include(debug_toolbar.urls)),
        path("admin/doc/", include("django.contrib.admindocs.urls")),
    ]

# Includes
urlpatterns += [path(r"admin/", admin.site.urls)]


def index(request):
    return redirect("/recipes/")


# Project Urls
urlpatterns += [
    path("", index, name="index"),
    path("recipes/", include("apps.recipes.urls", namespace="recipes")),
    path("api/accounts/", include(accounts_router.urls)),
    path("500/", http_500),
    path("404/", http_404),
    path("accounts/name/", NameChange.as_view(), name="account_change_name"),
    path("accounts/", include("allauth.urls")),
]
