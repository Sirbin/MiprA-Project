# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BloodValueUser',
            fields=[
                ('id', models.AutoField(auto_created=True, verbose_name='ID', serialize=False, primary_key=True)),
                ('id_patients', models.PositiveIntegerField(verbose_name='Id Paziente')),
                ('blood_pressure_systolic', models.IntegerField()),
                ('blood_pressure_diastolic', models.IntegerField()),
                ('pulse', models.PositiveSmallIntegerField()),
                ('date', models.DateField()),
                ('time', models.TimeField()),
            ],
        ),
        migrations.CreateModel(
            name='PatologyUser',
            fields=[
                ('id', models.AutoField(auto_created=True, verbose_name='ID', serialize=False, primary_key=True)),
                ('name_of_pathology', models.CharField(verbose_name='Patologie', max_length=100)),
                ('description_of_pathology', models.CharField(verbose_name='Descrizione', max_length=250)),
            ],
            options={
                'db_table': 'patients_patologyuser',
            },
        ),
    ]
