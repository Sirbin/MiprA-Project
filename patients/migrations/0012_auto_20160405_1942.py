# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0011_auto_20160404_1628'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='date',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='time',
            field=models.TimeField(),
        ),
    ]
