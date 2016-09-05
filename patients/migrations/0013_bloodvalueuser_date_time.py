# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0012_auto_20160405_1942'),
    ]

    operations = [
        migrations.AddField(
            model_name='bloodvalueuser',
            name='date_time',
            field=models.DateTimeField(null=True),
        ),
    ]
