from django.contrib import admin

from .models import Employee, Shift, Break

admin.site.register(Employee)
admin.site.register(Shift)
admin.site.register(Break)
