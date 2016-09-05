# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0034_auto_20160519_1136'),
    ]

    operations = [
        migrations.AddField(
            model_name='bloodvalueuser',
            name='weight',
            field=models.PositiveSmallIntegerField(verbose_name='Peso Paziente', default=int),
        ),
    ]
