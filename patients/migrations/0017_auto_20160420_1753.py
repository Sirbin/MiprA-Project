# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0016_bloodvalueuser_date_registration'),
    ]

    operations = [
        migrations.AddField(
            model_name='bloodvalueuser',
            name='gpsLatitude',
            field=models.FloatField(verbose_name='Latitudine', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='bloodvalueuser',
            name='gpsLongitude',
            field=models.FloatField(verbose_name='Longitudine', null=True, blank=True),
        ),
    ]
