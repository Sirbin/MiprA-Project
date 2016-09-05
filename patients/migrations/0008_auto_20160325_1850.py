# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0007_auto_20160323_2252'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='date',
            field=models.DateField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='time',
            field=models.TimeField(auto_now_add=True),
        ),
    ]
