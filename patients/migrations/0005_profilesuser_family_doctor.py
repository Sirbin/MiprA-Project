# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0004_profilesuser_pathology'),
    ]

    operations = [
        migrations.AddField(
            model_name='profilesuser',
            name='family_doctor',
            field=models.ManyToManyField(to='patients.FamilyDoctor', related_name='user_family_doctor'),
        ),
    ]
