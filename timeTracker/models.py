from django.db import models
from django.db.models.deletion import CASCADE
from django.core.exceptions import ValidationError


# Create your models here.


class Employee(models.Model):
    number = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    @property
    def current_shift(self):
        try:
            return self.shift_set.filter(end=None).order_by('-start')[0]
        except IndexError:
            return None

    def __str__(self):
        return "%s - %s %s" % (self.number, self.last_name, self.first_name)


class Shift(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    start = models.DateTimeField()
    end = models.DateTimeField(null=True, blank=True)

    def clean(self):
        models.Model.clean(self)
        if self.end <= self.start:
            raise ValidationError('END_LTE_START')

    def __str__(self):
        return "%s: %s - %s" % (self.employee, self.start, self.end)


class Break(models.Model):
    shift = models.ForeignKey(Shift, on_delete=CASCADE)
    start = models.DateTimeField()
    end = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return "%s - %s" % (self.start, self.end)
