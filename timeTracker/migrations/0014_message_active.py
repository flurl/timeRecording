# Generated by Django 2.2.24 on 2021-11-05 15:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0013_auto_20211105_1630'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
