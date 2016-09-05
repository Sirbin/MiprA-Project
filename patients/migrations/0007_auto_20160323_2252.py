# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0006_auto_20160323_1639'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='id_blood',
            field=models.PositiveIntegerField(unique=True, verbose_name='Id Patients'),
        ),
    ]
