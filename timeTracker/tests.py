import datetime
import json

from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.urls import reverse

from .models import Shift, Employee, FieldOfEmployment


def create_test_data():
    foe = FieldOfEmployment(name="testFOE")
    foe.save()

    emp = Employee(first_name="test_first_name",
                   last_name="test_last_name",
                   number='1a')
    emp.save()
    emp.fields_of_employment.add(foe)
    emp.save()

    start = timezone.now() - datetime.timedelta(hours=8)
    end = timezone.now()
    shift = Shift(
        employee=emp, field_of_employment=foe, start=start, end=end)
    shift.save()


class ShiftTestCase(TestCase):

    def setUp(self):
        super().setUp()
        create_test_data()
        self.shift = Shift.objects.first()

    def test_shift_not_longer_than_max_working_time(self):
        now = timezone.now()
        self.shift.start = now - datetime.timedelta(hours=12, minutes=1)
        self.shift.end = now
        self.assertRaises(ValidationError, self.shift.full_clean)

    def test_shift_validation_works_when_end_is_None(self):
        self.shift.end = None
        try:
            self.shift.full_clean()
        except:
            self.fail('Shift validation with end set to None failed')

    def test_validate_shift_when_longer_than_12_hours_but_punch_out_forgotten_is_set(self):
        now = timezone.now()
        self.shift.start = now - datetime.timedelta(hours=12, minutes=1)
        self.shift.end = now
        self.shift.punch_out_forgotten = True
        try:
            self.shift.full_clean()
        except:
            self.fail('Shift validation failed with duration greater 12hours and punch out forgotten flag set')


class EmployeeTestCase(TestCase):

    def setUp(self):
        super().setUp()
        create_test_data()

    def test_ajax_get_employee_info_by_number(self):
        # get the test employee
        response = self.client.get(reverse('timeTracker:employee_info', args=('1a',)))
        fields = json.loads(response.content.decode('ascii'))[0]['fields']
        if not (fields['first_name'] == 'test_first_name' and
                fields['last_name'] == 'test_last_name' and
                fields['number'] == '1a'):
            self.fail('Employee with number "1a" not found')

        # expect status of 404 for unknown employee
        response = self.client.get(reverse('timeTracker:employee_info', args=('0',)))
        self.assertEqual(response.status_code, 404, 'No status code 404 for unknown employee')
