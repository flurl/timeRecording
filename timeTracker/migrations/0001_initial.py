# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-07 07:07
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Break',
            fields=[
                ('id', models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=255)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='FieldOfEmployment',
            fields=[
                ('id', models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Shift',
            fields=[
                ('id', models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField(blank=True, null=True)),
                ('employee', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, to='timeTracker.Employee')),
                ('field_of_employment', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, to='timeTracker.FieldOfEmployment')),
            ],
        ),
        migrations.AddField(
            model_name='employee',
            name='fields_of_employment',
            field=models.ManyToManyField(to='timeTracker.FieldOfEmployment'),
        ),
        migrations.AddField(
            model_name='break',
            name='shift',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to='timeTracker.Shift'),
        ),
    ]
