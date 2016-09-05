# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0028_auto_20160517_1625'),
    ]

    operations = [
        migrations.AddField(
            model_name='profilesuser',
            name='bp_interval',
            field=models.PositiveSmallIntegerField(null=True, verbose_name='Frequenza di Misurazione', blank=True),
        ),
    ]
