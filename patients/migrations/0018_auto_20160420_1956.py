# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0017_auto_20160420_1753'),
    ]

    operations = [
        migrations.RenameField(
            model_name='familydoctor',
            old_name='mobile_phone',
            new_name='mobile',
        ),
    ]
