import datetime

from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError

from .models import Shift, Employee, FieldOfEmployment


class ShiftTestCase(TestCase):

    def setUp(self):
        super().setUp()
        self.foe = FieldOfEmployment(name="testFOE")
        self.foe.save()

        self.emp = Employee(first_name="test_first_name",
                            last_name="test_last_name")
        self.emp.save()
        self.emp.fields_of_employment.add(self.foe)
        self.emp.save()

        start = timezone.now() - datetime.timedelta(hours=8)
        end = timezone.now()
        self.shift = Shift(
            employee=self.emp, field_of_employment=self.foe, start=start, end=end)

    def test_shift_not_longer_than_12_hours(self):
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
