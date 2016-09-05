# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0003_profilesuser'),
    ]

    operations = [
        migrations.AddField(
            model_name='profilesuser',
            name='pathology',
            field=models.ManyToManyField(related_name='user_patology', to='patients.PatologyUser'),
        ),
    ]
