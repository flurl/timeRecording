# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-07 07:48
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='break',
            name='shift',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='timeTracker.Shift'),
        ),
        migrations.AlterField(
            model_name='shift',
            name='employee',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='timeTracker.Employee'),
        ),
    ]
