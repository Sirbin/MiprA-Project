# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0027_auto_20160517_1559'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='thresholdHr_min_max',
            field=django.contrib.postgres.fields.ArrayField(null=True, size=2, base_field=models.PositiveIntegerField(), verbose_name='Soglie Pulsazioni', blank=True, default=list),
        ),
    ]
