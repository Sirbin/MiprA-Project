# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0019_profilesuser_threshold_max'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='threshold_max',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.PositiveIntegerField(), default=list, blank=True, size=2),
        ),
    ]
