from django.http import HttpResponse, Http404
from django.core import serializers
from django.shortcuts import get_object_or_404, render
from django.utils import timezone

from .models import Employee, Shift


def index(request):
    return render(request, 'timeTracker/index.html')


def get_employee_info_by_number(request, emp_number):
    emp = get_object_or_404(Employee, number=emp_number)
    return HttpResponse(serializers.serialize('json', [emp]))


def get_current_employee_shift(request, emp_id):
    emp = get_object_or_404(Employee, pk=emp_id)
    shift = emp.current_shift
    if shift is None:
        raise Http404("No current shift")
    return HttpResponse(serializers.serialize('json', [shift]))


def punch_out(request, shift_id, when=None):
    shift = get_object_or_404(Shift, pk=shift_id)
    if when is None:
        when = timezone.now()
    shift.end = when
    shift.save()
    return HttpResponse('OK')


def punch_in(request, emp_id, when=None):
    emp = get_object_or_404(Employee, pk=emp_id)
    if when is None:
        when = timezone.now()
    shift = Shift(employee=emp, start=when)
    shift.save()
    return HttpResponse('OK')
