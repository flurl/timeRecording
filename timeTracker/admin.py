from django.contrib import admin

from .models import Employee, Shift, Break, FieldOfEmployment

admin.site.register(Employee)
admin.site.register(Shift)
admin.site.register(Break)
admin.site.register(FieldOfEmployment)
