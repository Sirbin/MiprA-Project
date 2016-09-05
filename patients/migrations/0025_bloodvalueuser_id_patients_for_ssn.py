# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0024_auto_20160510_1141'),
    ]

    operations = [
        migrations.AddField(
            model_name='bloodvalueuser',
            name='id_patients_for_ssn',
            field=models.CharField(verbose_name='Id_Paziente_cod_fiscale', default=str, max_length=16),
        ),
    ]
