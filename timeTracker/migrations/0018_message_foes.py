# Generated by Django 2.2.24 on 2021-11-13 18:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0017_messageconfirmation_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='foes',
            field=models.ManyToManyField(blank=True, to='timeTracker.FieldOfEmployment'),
        ),
    ]
