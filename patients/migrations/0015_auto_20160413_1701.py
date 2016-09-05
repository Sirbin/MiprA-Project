# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0014_auto_20160409_1206'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='blood_pressure_diastolic',
            field=models.IntegerField(verbose_name='Pressione Diastolica'),
        ),
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='blood_pressure_systolic',
            field=models.IntegerField(verbose_name='Pressione Sistolica'),
        ),
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='pulse',
            field=models.PositiveSmallIntegerField(verbose_name='Pulsazioni'),
        ),
    ]
