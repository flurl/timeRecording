# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-08-10 17:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0003_auto_20161008_1017'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='sv_nr',
            field=models.CharField(default='', max_length=255),
        ),
    ]
