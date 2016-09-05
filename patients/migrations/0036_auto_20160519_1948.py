# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0035_bloodvalueuser_weight'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='weight',
            field=models.PositiveSmallIntegerField(default=int, verbose_name='Peso Paziente', null=True),
        ),
    ]
