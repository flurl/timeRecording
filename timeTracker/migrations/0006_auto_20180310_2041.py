# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2018-03-10 19:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0005_auto_20170810_1950'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employee',
            name='number',
            field=models.CharField(max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='employee',
            name='sv_nr',
            field=models.CharField(blank=True, default='', max_length=255, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='fieldofemployment',
            name='name',
            field=models.CharField(max_length=200, unique=True),
        ),
    ]