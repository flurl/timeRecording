from datetime import date, timedelta
import time
import calendar

from django.contrib import admin
from django_admin_listfilter_dropdown.filters import DropdownFilter, RelatedDropdownFilter, ChoiceDropdownFilter


from .models import Employee, Shift, Break, FieldOfEmployment, Event

class StartDateRangeListFilter(admin.SimpleListFilter):
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = 'Date'

    # Parameter for the filter that will be used in the URL query.
    parameter_name = 'daterange'

    def lookups(self, request, model_admin):
        """
        Returns a list of tuples. The first element in each
        tuple is the coded value for the option that will
        appear in the URL query. The second element is the
        human-readable name for the option that will appear
        in the right sidebar.
        """
        x = 10
        now = time.localtime()
        months = [time.localtime(time.mktime((now.tm_year, now.tm_mon - n, 1, 0, 0, 0, 0, 0, 0)))[:2] for n in range(x)]

        lookups = tuple([("%s-%s" % (month[0],month[1]), "%s-%02d" % (month[0],month[1])) for month in months])

        return lookups

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        # Compare the requested value (either '80s' or '90s')
        # to decide how to filter the queryset.
        datestr = self.value()
        if datestr:
            year, month = [int(d) for d in datestr.split('-')]
            start = date(year, month, 1)
            end = date(year + (month+1)//12, (month+1)%12, 1)
            return queryset.filter(start__gte=start,
                               start__lt=end)


class ShiftAdmin(admin.ModelAdmin):
    readonly_fields = ('get_period',)
    list_display = (
        'employee', 'start', 'end', 'punch_in_forgotten', 'punch_out_forgotten', 'get_period')
    list_filter = (StartDateRangeListFilter, ('employee', RelatedDropdownFilter), ('event', RelatedDropdownFilter), 'start', 'punch_in_forgotten', 'punch_out_forgotten', 'field_of_employment')
    search_fields = ['employee__first_name', 'employee__last_name']
    fields = (
        'employee', 'start', 'end', 'punch_in_forgotten', 'punch_out_forgotten', 'get_period')

    def get_period(self, obj):
        try:
            return obj.end - obj.start
        except TypeError as e: # pylint: disable=unused-variable
            return "open"


admin.site.register(Shift, ShiftAdmin)

admin.site.register(Employee)
admin.site.register(Break)
admin.site.register(FieldOfEmployment)
admin.site.register(Event)
