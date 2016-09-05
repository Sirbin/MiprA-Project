# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0033_auto_20160519_1135'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='family_doctor',
            field=models.ManyToManyField(to='patients.FamilyDoctor', verbose_name='Medici', blank=True, related_name='user_family_doctor'),
        ),
    ]
