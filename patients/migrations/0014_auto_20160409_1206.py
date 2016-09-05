# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0013_bloodvalueuser_date_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='date_time',
            field=models.DateTimeField(unique=True, null=True),
        ),
    ]
