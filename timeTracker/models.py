from django.db import models
from django.db.models.deletion import CASCADE

# Create your models here.


class Employee(models.Model):
    number = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    def __str__(self):
        return "%s - %s %s" % (self.number, self.last_name, self.first_name)


class Shift(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    start = models.DateTimeField()
    end = models.DateTimeField(null=True)

    def __str__(self):
        return "%s: %s - %s" % (self.employee, self.start, self.end)


class Break(models.Model):
    shift = models.ForeignKey(Shift, on_delete=CASCADE)
    start = models.DateTimeField()
    end = models.DateTimeField(null=True)

    def __str__(self):
        return "%s - %s" % (self.start, self.end)
