'''
Created on Sep 25, 2016

@author: flurl
'''

from django.conf.urls import url

from . import views

app_name = 'timeTracker'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^employee_info_by_number/(?P<emp_number>[0-9]+)/$',
        views.get_employee_info_by_number, name='employee_info'),
]
