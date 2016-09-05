from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from geoposition.fields import GeopositionField
# Create your models here.


class Infrastructure(models.Model):



    NomeOspedale = models.CharField(verbose_name='Nome Infrastruttura',max_length=150,blank=True,null=True)
    ViaOspedale = models.CharField(verbose_name='Via',max_length=100,default="")
    CittaOspedale = models.CharField(verbose_name='Città',max_length=100,default="")
    NumeroTelOspedale = PhoneNumberField(verbose_name='Numero Telfonico',default="")
    EmailOspedale = models.EmailField(verbose_name='E-mail',max_length=150,default="")
    logoOspedale = models.ImageField(verbose_name='Logo Ospedale',upload_to='log-back',blank=True,null=True)
    backOspedale = models.ImageField(verbose_name='Background Ospedale',upload_to='log-back',blank=True,null=True)
    CordinateGps = GeopositionField(blank=True,null=True)


    def __str__(self):
           return '%d %s %s' % (self.id ,self.NomeOspedale)