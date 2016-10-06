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
    url(r'^current_employee_shift/(?P<emp_id>[0-9]+)/$',
        views.get_current_employee_shift, name='current_employee_shift'),
    # TODO: perhaps implement punch out at a specific time
    # url(r'^punch_out/(?P<shift_id>[0-9]+)/(?P<when>[0-9]+)/$',
    #    views.punch_out, name='punch_out_at'),
    url(r'^punch_out/(?P<shift_id>[0-9]+)/$',
        views.punch_out, name='punch_out'),
    url(r'^punch_in/(?P<emp_id>[0-9]+)/(?P<when>[0-9]+)/$',
        views.punch_in, name='punch_in_at'),
    url(r'^punch_in/(?P<emp_id>[0-9]+)/$',
        views.punch_in, name='punch_in'),
    url(r'^server_time/$',
        views.get_server_time, name='get_server_time'),
]
