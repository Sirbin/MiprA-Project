# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0029_profilesuser_bp_interval'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profilesuser',
            name='id_blood',
        ),
    ]
