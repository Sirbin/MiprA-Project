# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0026_auto_20160517_1555'),
    ]

    operations = [
        migrations.AddField(
            model_name='profilesuser',
            name='thresholdHr_min_max',
            field=django.contrib.postgres.fields.ArrayField(size=2, null=True, default=list, verbose_name='Soglie Pulsazioni Minima', blank=True, base_field=models.PositiveIntegerField()),
        ),
        migrations.AddField(
            model_name='profilesuser',
            name='thresholdMin_min_max',
            field=django.contrib.postgres.fields.ArrayField(size=2, null=True, default=list, verbose_name='Soglie Pressione Minima', blank=True, base_field=models.PositiveIntegerField()),
        ),
        migrations.AlterField(
            model_name='profilesuser',
            name='thresholdMax_min_max',
            field=django.contrib.postgres.fields.ArrayField(size=2, null=True, default=list, verbose_name='Soglie Pressione Massima', blank=True, base_field=models.PositiveIntegerField()),
        ),
    ]
