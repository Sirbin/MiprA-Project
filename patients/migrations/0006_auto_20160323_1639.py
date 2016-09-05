# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import phonenumber_field.modelfields


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0005_profilesuser_family_doctor'),
    ]

    operations = [
        migrations.AddField(
            model_name='familydoctor',
            name='mobile_phone',
            field=phonenumber_field.modelfields.PhoneNumberField(verbose_name='Telefono Cellulare', default='', max_length=128),
        ),
        migrations.AddField(
            model_name='familydoctor',
            name='phone',
            field=phonenumber_field.modelfields.PhoneNumberField(verbose_name='Telefono Studio', default='', max_length=128),
        ),
    ]
