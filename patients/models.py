from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.urlresolvers import reverse
from django.core.serializers.json import DjangoJSONEncoder
from phonenumber_field.modelfields import PhoneNumberField
from codicefiscale import build,isvalid
from django.core.validators import ValidationError
from django.utils.translation import ugettext as _
from italian_utils.validators import validate_codice_fiscale, validate_partita_iva
import datetime , json


# Create your models here.


class PatologyUser(models.Model):

       name_of_pathology = models.CharField(verbose_name='Patologie',max_length=100,db_index=True)
       description_of_pathology = models.CharField(verbose_name='Descrizione',max_length=250)

       def __str__(self):
           return self.name_of_pathology

       class Meta:
           db_table='patients_patologyuser'

class BloodValueId(models.Manager):

       def get_weight_value(self):
           get_contenx_w_value = BloodValueUser.objects.filter('id_patients_for_ssn').distinct('id_patients')
           return get_contenx_w_value

       def get_ssn_value(self,ssn):

           pat1 = BloodValueUser.objects.filter(id_patients_for_ssn=ssn)
           value_for_patients= pat1.values('id','blood_pressure_systolic','blood_pressure_diastolic','pulse','weight','date_registration','date','time','date_time').latest('date_time')
           num_lis = json.dumps({'num_reg':pat1.filter().count(),'last_value':value_for_patients},cls=DjangoJSONEncoder)
           return num_lis

       def get_total_pk(self):
           patient_for_ssn = BloodValueUser.objects.filter().latest('id')
           return patient_for_ssn.id

       # def get_date_registaion(self,ssn):
       #     pat1 = BloodValueUser.objects.filter(id_patients_for_ssn=ssn)
       #     date_registraion_for_patients= pat1.values('date_registration','date','time','date_time').latest('date_time')
       #     return date_registraion_for_patients

class BloodValueUser(models.Model):

       id_patients_for_ssn =  models.CharField(verbose_name='Id_Paziente_cod_fiscale',max_length=16,default=str,validators=[validate_codice_fiscale])
       id_patients = models.PositiveIntegerField(verbose_name='Id Paziente',null=True,blank=True)
       blood_pressure_systolic = models.IntegerField(verbose_name='Pressione Sistolica')
       blood_pressure_diastolic = models.IntegerField(verbose_name='Pressione Diastolica')
       pulse = models.PositiveSmallIntegerField(verbose_name='Pulsazioni')
       weight = models.PositiveSmallIntegerField(verbose_name='Peso Paziente',default=int,null=True)
       date = models.DateField()
       time = models.TimeField()
       date_time = models.DateTimeField(null=True,unique=True)
       date_registration = models.DateTimeField(verbose_name='Data Registrazione',auto_now=True)
       gpsLatitude = models.FloatField(verbose_name='Latitudine',blank=True,null=True)
       gpsLongitude = models.FloatField(verbose_name='Longitudine',blank=True,null=True)

       # model Normale
       objects = models.Manager()
       # filtro creato per ssn
       get_value = BloodValueId()

       def __str__(self):
              return 'Nome Paziente {0}'.format(self.id_patients)


       def get_absolute_url(self,*args,**kwargs):
           return reverse ('patients_charts', args=[self.id_patients])

       def time_date(self):
           super(BloodValueUser, self).time_date()
           time_date = datetime.datetime.combine(self.date,self.time)
           return time_date

       def uid(self):
           return 'uid %s' % str(self.id)

class FamilyDoctor(models.Model):

       first_name = models.CharField(verbose_name='Nome',max_length=100)
       last_name = models.CharField(verbose_name='Cognome',max_length=100)
       address = models.CharField(max_length=150,verbose_name='Indirizzo')
       city = models.CharField(max_length=100,verbose_name='Città')
       provincia = models.CharField(verbose_name='Provincia',max_length=100)
       phone = PhoneNumberField(verbose_name='Telefono Studio',default='')
       mobile = PhoneNumberField(verbose_name='Telefono Cellulare',default='')


       def __str__(self):
           return '%d %s %s' % (self.id ,self.first_name,self.last_name)


       class Meta:
           ordering = ('-first_name',)


       def get_absolute_url(self,*args,**kwargs):
           return reverse ('edit_medic', args=[self.id])






class ProfilesUser(models.Model):



      first_name = models.CharField(verbose_name='Nome',max_length=100)
      last_name = models.CharField(verbose_name='Cognome',max_length=100)
      date_born = models.DateField(verbose_name='Data di Nascita')
      sex = models.CharField(max_length=1,verbose_name='sesso',choices=(('M','Maschio'),('F','Femmina'),),default='Maschio')
      ssn = models.CharField(max_length=80,verbose_name='Codice Fiscale') # deve essere unico e controllata dalla libreria codice fiscale
      city = models.CharField(max_length=100,verbose_name='Città')
      address = models.CharField(max_length=150,verbose_name='Indirizzo')
      cap = models.IntegerField(verbose_name='Cap')
      pathology = models.ManyToManyField(PatologyUser,related_name='user_patology',verbose_name='Patologie',blank=True)
      family_doctor = models.ManyToManyField(FamilyDoctor,related_name='user_family_doctor',verbose_name='Medici',blank=True)
      blood_value = models.ForeignKey(BloodValueUser,related_name='user_blood_value',null=True)
      thresholdMax_min_max = ArrayField(models.PositiveIntegerField(),size=2,blank=True,default=list,null=True,verbose_name='Soglie Pressione Massima')
      thresholdMin_min_max = ArrayField(models.PositiveIntegerField(),size=2,blank=True,default=list,null=True,verbose_name='Soglie Pressione Minima')
      thresholdHr_min_max = ArrayField(models.PositiveIntegerField(),size=2,blank=True,default=list,null=True,verbose_name='Soglie Pulsazioni')
      bp_interval = models.PositiveSmallIntegerField(verbose_name='Frequenza di Misurazione',null=True,blank=True)




      def get_absolute_url(self,*args,**kwargs):
          return reverse('patients_charts', args=[self.id])




#
      # def save(self, *args,**kwargs):
      #       super(ProfilesUser,self).save(*args,**kwargs)
      #       if self.blood_value_id():
      #       self.blood_value_id = BloodValueTrue.objects.values_list('id',flat=True).distinct()[0]
      #          print (self.blood_value_id)
#     #
#
#
#     # @classmethod
#     # def create(cls,blood_value_id):
#     #     blood_id = cls(blood_value_id=blood_value_id)
#     #     return blood_id
#
      def __str__(self):
          return '%s %s' %(self.first_name,self.last_name)


