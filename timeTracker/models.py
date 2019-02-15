from constance import config

from django.db import models
from django.core.exceptions import ValidationError


class FieldOfEmployment(models.Model):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    number = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    fields_of_employment = models.ManyToManyField(FieldOfEmployment)
    sv_nr = models.CharField(max_length=255, default='', blank=True, unique=True, null=True)

    @property
    def current_shift(self):
        try:
            return self.shift_set.filter(end=None).order_by('-start')[0]
        except IndexError:
            return None

    def __str__(self):
        return "%s - %s %s" % (self.number, self.last_name, self.first_name)


class Shift(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT)
    start = models.DateTimeField()
    end = models.DateTimeField(null=True, blank=True)
    field_of_employment = models.ForeignKey(FieldOfEmployment, on_delete=models.CASCADE)
    punch_in_forgotten = models.BooleanField(default=False)
    punch_out_forgotten = models.BooleanField(default=False)
    event = models.IntegerField(null=True, blank=True)

    def clean(self):
        models.Model.clean(self)
        # the end has to be after the start
        if self.end is not None and self.end <= self.start:
            raise ValidationError({'end': 'END_LTE_START'})
        # the shift must not be longer than 12 hours, except punch_out_forgotten is set
        if self.end is not None and \
           (self.end - self.start).total_seconds() > config.MAX_WORKING_TIME and \
           not self.punch_out_forgotten:
            raise ValidationError('DURATION_GT_MAXWORKTIME')

    def __str__(self):
        return "%s %s: %s - %s" % (self.field_of_employment, self.employee, self.start, self.end)


class Break(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.PROTECT)
    start = models.DateTimeField()
    end = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return "%s - %s" % (self.start, self.end)
