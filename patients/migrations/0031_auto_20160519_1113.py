# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0030_remove_profilesuser_id_blood'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='id_patients',
            field=models.PositiveIntegerField(verbose_name='Id Paziente', null=True, blank=True),
        ),
    ]
