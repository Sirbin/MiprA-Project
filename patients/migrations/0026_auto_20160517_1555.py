# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import italian_utils.validators


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0025_bloodvalueuser_id_patients_for_ssn'),
    ]

    operations = [
        migrations.RenameField(
            model_name='profilesuser',
            old_name='threshold_min_max',
            new_name='thresholdMax_min_max',
        ),
        migrations.AlterField(
            model_name='bloodvalueuser',
            name='id_patients_for_ssn',
            field=models.CharField(default=str, max_length=16, validators=[italian_utils.validators.validate_codice_fiscale], verbose_name='Id_Paziente_cod_fiscale'),
        ),
    ]
