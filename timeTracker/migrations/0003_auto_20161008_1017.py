# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-08 08:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0002_auto_20161007_0948'),
    ]

    operations = [
        migrations.AddField(
            model_name='shift',
            name='punch_in_forgotten',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='shift',
            name='punch_out_forgotten',
            field=models.BooleanField(default=False),
        ),
    ]
