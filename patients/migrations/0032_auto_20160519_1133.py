# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0031_auto_20160519_1113'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='pathology',
            field=models.ManyToManyField(related_name='user_patology', null=True, to='patients.PatologyUser', blank=True, verbose_name='Patologie'),
        ),
    ]
