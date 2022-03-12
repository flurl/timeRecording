from constance import config

from django.db import models
from django.core.exceptions import ValidationError


class Event(models.Model):
    lm_id = models.IntegerField(unique=True)
    date = models.DateField()
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return "%s - %s" % (self.date, self.name)


class FieldOfEmployment(models.Model):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    number = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    fields_of_employment = models.ManyToManyField(FieldOfEmployment)
    sv_nr = models.CharField(max_length=255, blank=True, unique=True, null=True)

    class Meta:
        ordering = ("last_name", "first_name")

    @property
    def current_shift(self):
        try:
            return self.shift_set.filter(end=None).order_by('-start')[0] # pylint: disable=no-member
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
    event = models.ForeignKey(Event, to_field="lm_id", on_delete=models.PROTECT, null=True, blank=True)

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


class Message(models.Model):
    """
    A model for showing messages to the employees on login
    
    confirmation required: the employee has to check the 
        checkbox to confirm the message and continue with punch in
    reoccuring: should the message be displayes solely once
        per employee or on every punch in
    employee: if null, the message is shown to everyone, else
        it's only shown to the selected employees
    """
    text = models.TextField()
    confirmation_required = models.BooleanField(default=False)
    reoccuring = models.BooleanField(default=False)
    employees = models.ManyToManyField(Employee, blank=True)
    foes = models.ManyToManyField(FieldOfEmployment, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.text[0:50]


class MessageConfirmation(models.Model):
    shift = models.ForeignKey(Shift, on_delete = models.PROTECT)
    message = models.ForeignKey(Message, on_delete=models.PROTECT)
    confirmed = models.BooleanField()