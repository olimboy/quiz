from django.urls import path
from .views import (
    index, en, uz, end, get_question, 
    post_question, tts, get_themes,
    get_index, theme_add, dict_add,
    themes, select, stat
    )
urlpatterns = [
    path('', get_index),
    path('en-uz/', en),
    path('uz-en/', uz),
    path('end/', end),
    path('get/', get_question),
    path('post/', post_question),
    path('tts/', tts),
    path('get-themes/', get_themes),
    path('theme-add/', theme_add),
    path('dict-add/', dict_add),
    path('get-index/', get_index),
    path('themes/', themes),
    path('select/', select),
    path('stat/', stat),
]