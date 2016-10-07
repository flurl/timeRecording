# standard library
import time
from datetime import datetime

# Django
from django.http import HttpResponse, Http404, HttpResponseServerError
from django.core import serializers
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.core.exceptions import ValidationError


# local Django
from .models import Employee, Shift


def index(request):
    return render(request, 'timeTracker/index.html')


def get_employee_info_by_number(request, emp_number):
    emp = get_object_or_404(Employee, number=emp_number)
    # TODO: use JsonResponse object
    return HttpResponse(serializers.serialize('json', [emp]))


def get_current_employee_shift(request, emp_id):
    emp = get_object_or_404(Employee, pk=emp_id)
    shift = emp.current_shift
    if shift is None:
        raise Http404("No current shift")
    # TODO: use JsonResponse object
    return HttpResponse(serializers.serialize('json', [shift]))


def punch_out(request, shift_id, when=None):
    shift = get_object_or_404(Shift, pk=shift_id)
    if when is None:
        when = timezone.now()
    shift.end = when

    try:
        shift.full_clean()
    except ValidationError as e:
        return HttpResponseServerError(str(e.message_dict))

    shift.save()
    # TODO: use JsonResponse object
    return HttpResponse('OK')


def punch_in(request, emp_id, when=None):
    emp = get_object_or_404(Employee, pk=emp_id)
    if when is None:
        when = timezone.now()
    else:
        when = datetime.fromtimestamp(int(when), tz=timezone.utc)

    # round to minutes
    minutes = when.minute if when.second < 30 else when.minute + 1
    when = when.replace(minute=minutes, second=0, microsecond=0)

    shift = Shift(employee=emp, start=when)
    shift.save()
    # TODO: use JsonResponse object
    return HttpResponse('OK')


def get_server_time(request):
    # TODO: use JsonResponse object
    return HttpResponse(int(time.time()))
