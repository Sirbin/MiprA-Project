# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0009_profilesuser_blood_value'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patologyuser',
            name='name_of_pathology',
            field=models.CharField(db_index=True, max_length=100, verbose_name='Patologie'),
        ),
    ]
