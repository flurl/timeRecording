from django.contrib import admin

from .models import Employee, Shift, Break, FieldOfEmployment


class ShiftAdmin(admin.ModelAdmin):
    list_display = (
        'employee', 'start', 'end', 'punch_in_forgotten', 'punch_out_forgotten')
    list_filter = ('employee', 'start', 'punch_in_forgotten', 'punch_out_forgotten', 'field_of_employment')
    search_fields = ['employee__first_name', 'employee__last_name']


admin.site.register(Shift, ShiftAdmin)

admin.site.register(Employee)
admin.site.register(Break)
admin.site.register(FieldOfEmployment)
