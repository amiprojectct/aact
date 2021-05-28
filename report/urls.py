from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('ajax/getStudies', views.getStudies, name='getStudies'),
    path('ajax/getConditionTerms', views.getConditionTerms, name='getConditionTerms'),
]