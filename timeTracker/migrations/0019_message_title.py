# Generated by Django 2.2.24 on 2022-03-12 10:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timeTracker', '0018_message_foes'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='title',
            field=models.CharField(default='UPDATE THIS', max_length=255),
            preserve_default=False,
        ),
    ]
