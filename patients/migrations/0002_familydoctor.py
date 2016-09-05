# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='FamilyDoctor',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, verbose_name='ID', primary_key=True)),
                ('first_name', models.CharField(verbose_name='Nome', max_length=100)),
                ('last_name', models.CharField(verbose_name='Cognome', max_length=100)),
                ('address', models.CharField(verbose_name='Indirizzo', max_length=150)),
                ('city', models.CharField(verbose_name='Città', max_length=100)),
                ('provincia', models.CharField(verbose_name='Provincia', max_length=100)),
            ],
            options={
                'ordering': ('-first_name',),
            },
        ),
    ]
