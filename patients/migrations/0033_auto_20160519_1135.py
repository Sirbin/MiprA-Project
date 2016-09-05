# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0032_auto_20160519_1133'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profilesuser',
            name='pathology',
            field=models.ManyToManyField(to='patients.PatologyUser', related_name='user_patology', blank=True, verbose_name='Patologie'),
        ),
    ]
