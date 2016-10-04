from django.http import HttpResponse
from django.core import serializers
from django.shortcuts import get_object_or_404, render

from .models import Employee


def index(request):
    return render(request, 'timeTracker/index.html')


def get_employee_info_by_number(request, emp_number):
    emp = get_object_or_404(Employee, number=emp_number)
    return HttpResponse(serializers.serialize('json', [emp]))
