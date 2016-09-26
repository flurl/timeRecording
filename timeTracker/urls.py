'''
Created on Sep 25, 2016

@author: flurl
'''

from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
]
