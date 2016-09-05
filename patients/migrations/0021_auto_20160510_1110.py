# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0020_auto_20160509_1903'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profilesuser',
            name='threshold_max',
        ),
        migrations.AddField(
            model_name='profilesuser',
            name='threshold_min_max',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.PositiveIntegerField(), null=True, default=list, blank=True, size=4),
        ),
    ]
