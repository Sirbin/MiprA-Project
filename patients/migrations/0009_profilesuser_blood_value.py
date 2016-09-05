# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0008_auto_20160325_1850'),
    ]

    operations = [
        migrations.AddField(
            model_name='profilesuser',
            name='blood_value',
            field=models.ForeignKey(to='patients.BloodValueUser', default=int, related_name='user_blood_value'),
            preserve_default=False,
        ),
    ]
