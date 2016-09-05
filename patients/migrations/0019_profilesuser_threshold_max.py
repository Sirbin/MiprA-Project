# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0018_auto_20160420_1956'),
    ]

    operations = [
        migrations.AddField(
            model_name='profilesuser',
            name='threshold_max',
            field=django.contrib.postgres.fields.ArrayField(null=True, base_field=models.PositiveIntegerField(), blank=True, size=2),
        ),
    ]
