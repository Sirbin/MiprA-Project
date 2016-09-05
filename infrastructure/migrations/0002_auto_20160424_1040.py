# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import phonenumber_field.modelfields
import geoposition.fields


class Migration(migrations.Migration):

    dependencies = [
        ('infrastructure', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='infrastruttura',
            name='CittaOspedale',
            field=models.CharField(verbose_name='Città', max_length=100, default=''),
        ),
        migrations.AddField(
            model_name='infrastruttura',
            name='CordinateGps',
            field=geoposition.fields.GeopositionField(verbose_name='Cordinate Gps', max_length=42, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='infrastruttura',
            name='EmailOspedale',
            field=models.EmailField(verbose_name='E-mail', max_length=150, default=''),
        ),
        migrations.AddField(
            model_name='infrastruttura',
            name='NomeOspedale',
            field=models.CharField(verbose_name='Nome Infrastruttura', max_length=150, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='infrastruttura',
            name='NumeroTelOspedale',
            field=phonenumber_field.modelfields.PhoneNumberField(verbose_name='Numero Telfonico', max_length=128, default=''),
        ),
        migrations.AddField(
            model_name='infrastruttura',
            name='ViaOspedale',
            field=models.CharField(verbose_name='Via', max_length=100, default=''),
        ),
        migrations.AddField(
            model_name='infrastruttura',
            name='backOspedale',
            field=models.ImageField(verbose_name='Background Ospedale', blank=True, null=True, upload_to='log-back'),
        ),
        migrations.AddField(
            model_name='infrastruttura',
            name='logoOspedale',
            field=models.ImageField(verbose_name='Logo Ospedale', blank=True, null=True, upload_to='log-back'),
        ),
    ]
