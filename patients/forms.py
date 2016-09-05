from django import forms
from django.contrib.postgres.forms import SimpleArrayField
from django.forms import Textarea
from .models import ProfilesUser,FamilyDoctor,PatologyUser,BloodValueUser


from phonenumber_field.formfields import PhoneNumberField

class PatientsForms(forms.ModelForm):


     # query = BloodValueTrue.objects.values_list('id_patients',flat=True).distinct()
     # print (query)
     # c =[('',None)]+ [(id,id) for id in query]
     # print (c)
     # blood_value_id = forms.ChoiceField(c,required=False,widget=forms.Select(attrs={'row':3}))
     #
     #
     #
     def __init__(self, *args, **kwargs):
            super(PatientsForms, self).__init__(*args, **kwargs)

            self.fields['thresholdMax_min_max'].delimiter = '-'
            self.fields['thresholdMax_min_max'].help_text = 'Inserire Soglie Pressione Minima-Massima'

            self.fields['thresholdMin_min_max'].delimiter = '-'
            self.fields['thresholdMin_min_max'].help_text = 'Inserire Soglie Pressione Minima-Massima'


            self.fields['thresholdHr_min_max'].delimiter = '-'
            self.fields['thresholdHr_min_max'].help_text = 'Inserire Soglie Pulsazioni Minima-Massima'

     def clean(self):
         '''

         @return: Controlla per ogni soglia i valori minimi e massimi
         '''
         cleaned_data = super(PatientsForms,self).clean()
         threasoldMax = cleaned_data.get('thresholdMax_min_max')
         threasoldMin = cleaned_data.get('thresholdMin_min_max')
         threasoldHr = cleaned_data.get('thresholdHr_min_max')




         # Valore soglia Minina
         if threasoldMin[0] < 40 or threasoldMin[0] > 60:
             self.add_error('thresholdMin_min_max','Il valore minimo deve essere compreso fra 40 e 60')
         if threasoldMin[1] < 80 or threasoldMin[1] > 130:
             self.add_error('thresholdMin_min_max','Il valore massimo deve essere compreso fra 80 e 130')

         # Valore Soglia Massima
         if threasoldMax[0] < 50 or threasoldMax[0] > 100:
             self.add_error('thresholdMax_min_max','Il valore minimo deve essere compreso fra 50 e 100')
         if threasoldMax[1] < 80 or threasoldMax[1] > 160:
             self.add_error('thresholdMax_min_max','Il valore massimo deve essere compreso fra 80 e 160')


         # Valore Soglia Pulsazioni
         if threasoldHr[0] < 50 or threasoldHr[0] > 100:
                self.add_error('thresholdHr_min_max','Il valore minimo deve essere compreso fra 50 e 100')
         if threasoldHr[1] < 70 or threasoldHr[1] > 120:
                self.add_error('thresholdHr_min_max','Il valore massimo deve essere compreso fra 70 e 120')

     #def save(self, commit=True):
     #       s = ProfilesUser()
     #       s.blood_value_id = self.blood_value_id
     #       if commit:
     #           s.save()
     #       return s

     class Meta:

        model = ProfilesUser
        exclude = ['blood_value']

        widgets = {'pathology':forms.CheckboxSelectMultiple(),
                   'family_doctor':forms.SelectMultiple(),

                   }

class ModelBloodValue(forms.ModelForm):






    class Meta:

        model = BloodValueUser
        exclude = ['id_patients','date','time','date_time']

class MedicForms(forms.ModelForm):



    class Meta:

        model = FamilyDoctor

        fields = '__all__'

class PhatologyForms(forms.ModelForm):

    class Meta:

        model = PatologyUser

        fields = '__all__'

        widgets = {'description_of_pathology': Textarea(attrs={'cols':80,'row':20}),

        }

