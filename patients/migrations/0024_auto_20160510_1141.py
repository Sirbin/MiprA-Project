# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0023_auto_20160510_1137'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='family_doctor',
            field=models.ManyToManyField(related_name='user_family_doctor', verbose_name='Medici', to='patients.FamilyDoctor'),
        ),
        migrations.AlterField(
            model_name='profilesuser',
            name='pathology',
            field=models.ManyToManyField(related_name='user_patology', verbose_name='Patologie', to='patients.PatologyUser'),
        ),
    ]
