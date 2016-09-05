# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0021_auto_20160510_1110'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='threshold_min_max',
            field=django.contrib.postgres.fields.ArrayField(default=list, base_field=models.PositiveIntegerField(), null=True, size=2, blank=True),
        ),
    ]
