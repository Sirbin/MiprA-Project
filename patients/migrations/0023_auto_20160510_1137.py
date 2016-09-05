# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0022_auto_20160510_1113'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='threshold_min_max',
            field=django.contrib.postgres.fields.ArrayField(null=True, base_field=models.PositiveIntegerField(), blank=True, default=list, verbose_name='Soglia Pressione Massima', size=2),
        ),
    ]
