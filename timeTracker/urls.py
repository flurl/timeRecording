'''
Created on Sep 25, 2016

@author: flurl
'''

from django.conf.urls import url

from . import views

app_name = 'timeTracker'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^employee_info_by_number/(?P<emp_number>[\w]+)/$',
        views.get_employee_info_by_number, name='employee_info'),
    url(r'^current_employee_shift/(?P<emp_id>[0-9]+)/$',
        views.get_current_employee_shift, name='current_employee_shift'),
    # TODO: perhaps implement punch out at a specific time
    # url(r'^punch_out/(?P<shift_id>[0-9]+)/(?P<when>[0-9]+)/$',
    #    views.punch_out, name='punch_out_at'),
    url(r'^punch_out/(?P<shift_id>[0-9]+)/$',
        views.punch_out, name='punch_out'),
    url(r'^punch_in/(?P<emp_id>[0-9]+)/(?P<foe_id>[0-9]+)/(?P<when>[0-9]+)/$',
        views.punch_in, name='punch_in_at'),
    url(r'^punch_in/(?P<emp_id>[0-9]+)/(?P<foe_id>[0-9]+)/$',
        views.punch_in, name='punch_in'),
    url(r'^server_time/$',
        views.get_server_time, name='get_server_time'),
    url(r'^fields_of_employment/$',
        views.get_fields_of_employment, name='fields_of_employment'),
    url(r'^fields_of_employment/(?P<emp_id>[0-9]+)/$',
        views.get_fields_of_employment, name='fields_of_employment_for_employee'),
    url(r'^punch_in_forgotten/(?P<emp_id>[0-9]+)/$',
        views.punch_in_forgotten, name='punch_in_forgotten'),
    url(r'^punch_out_forgotten/(?P<shift_id>[0-9]+)/$',
        views.punch_out_forgotten, name='punch_out_forgotten'),
    url(r'^open_shifts/$',
        views.get_open_shifts, name='get_open_shifts'),
]
