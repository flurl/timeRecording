# Generated by Django 2.2.24 on 2021-11-13 16:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0016_remove_messageconfirmation_employee'),
    ]

    operations = [
        migrations.AddField(
            model_name='messageconfirmation',
            name='message',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='timeTracker.Message'),
            preserve_default=False,
        ),
    ]
