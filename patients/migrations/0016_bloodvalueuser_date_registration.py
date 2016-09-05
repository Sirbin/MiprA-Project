# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0015_auto_20160413_1701'),
    ]

    operations = [
        migrations.AddField(
            model_name='bloodvalueuser',
            name='date_registration',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now, verbose_name='Data Registrazione'),
            preserve_default=False,
        ),
    ]
