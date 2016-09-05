# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import phonenumber_field.modelfields
import geoposition.fields


class Migration(migrations.Migration):

    dependencies = [
        ('infrastructure', '0002_auto_20160424_1040'),
    ]

    operations = [
        migrations.CreateModel(
            name='Infrastructure',
            fields=[
                ('id', models.AutoField(primary_key=True, verbose_name='ID', auto_created=True, serialize=False)),
                ('NomeOspedale', models.CharField(blank=True, verbose_name='Nome Infrastruttura', max_length=150, null=True)),
                ('ViaOspedale', models.CharField(max_length=100, verbose_name='Via', default='')),
                ('CittaOspedale', models.CharField(max_length=100, verbose_name='Città', default='')),
                ('NumeroTelOspedale', phonenumber_field.modelfields.PhoneNumberField(max_length=128, verbose_name='Numero Telfonico', default='')),
                ('EmailOspedale', models.EmailField(max_length=150, verbose_name='E-mail', default='')),
                ('logoOspedale', models.ImageField(blank=True, verbose_name='Logo Ospedale', upload_to='log-back', null=True)),
                ('backOspedale', models.ImageField(blank=True, verbose_name='Background Ospedale', upload_to='log-back', null=True)),
                ('CordinateGps', geoposition.fields.GeopositionField(blank=True, max_length=42, null=True)),
            ],
        ),
        migrations.DeleteModel(
            name='Infrastruttura',
        ),
    ]
