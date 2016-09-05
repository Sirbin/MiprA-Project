# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0010_auto_20160330_0010'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='blood_value',
            field=models.ForeignKey(null=True, to='patients.BloodValueUser', related_name='user_blood_value'),
        ),
    ]
