# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0002_familydoctor'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProfilesUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('id_blood', models.PositiveIntegerField(verbose_name='Id Patients')),
                ('first_name', models.CharField(max_length=100, verbose_name='Nome')),
                ('last_name', models.CharField(max_length=100, verbose_name='Cognome')),
                ('date_born', models.DateField(verbose_name='Data di Nascita')),
                ('sex', models.CharField(choices=[('M', 'Maschio'), ('F', 'Femmina')], max_length=1, default='Maschio', verbose_name='sesso')),
                ('ssn', models.CharField(max_length=80, verbose_name='Codice Fiscale')),
                ('city', models.CharField(max_length=100, verbose_name='Città')),
                ('address', models.CharField(max_length=150, verbose_name='Indirizzo')),
                ('cap', models.IntegerField(verbose_name='Cap')),
            ],
        ),
    ]
