from django.shortcuts import render,render_to_response,Http404,HttpResponse,redirect,HttpResponseRedirect
from django.views.generic import View,TemplateView
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib import messages
from django.template import RequestContext
from django.views.generic import CreateView,DeleteView
from django.core.urlresolvers import reverse,reverse_lazy


from .forms import PatientsForms,MedicForms,PhatologyForms,ModelBloodValue
from .models import FamilyDoctor,PatologyUser,ProfilesUser,BloodValueUser
from infrastructure.models import Infrastructure

from .tasks import connect_to_serial_bt,connet_to_Broker,somma,send_to_device

from .SerialBt import connect_to_serial
import datetime
import json



class PatientsRegistration(View):
    '''
    Registration Patients
    '''
    def get(self,request):
        template = 'patients/createPatients.html'
        self.initial = {'thresholdMax_min_max' :[90,120],'thresholdMin_min_max':[60,110],'thresholdHr_min_max':[60,90]}
        formq = PatientsForms(initial=self.initial)
        context = {'formq':formq}
        return render(request,template,context)

    def post(self,request):

        template = 'patients/createPatients.html'
        formq = PatientsForms(self.request.POST or None)
        if formq.is_valid():
            c = ProfilesUser.objects.create(#id_blood=formq.cleaned_data['id_blood'], # da eliminare

                                            first_name=formq.cleaned_data['first_name'],
                                            last_name = formq.cleaned_data['last_name'],
                                           date_born = formq.cleaned_data['date_born'],
                                           sex = formq.cleaned_data['sex'],
                                           ssn = formq.cleaned_data['ssn'],
                                           city = formq.cleaned_data['city'],
                                           address = formq.cleaned_data['address'],
                                           cap = formq.cleaned_data['cap'],
                                           thresholdMax_min_max = formq.cleaned_data['thresholdMax_min_max'],
                                           thresholdMin_min_max = formq.cleaned_data['thresholdMin_min_max'],
                                           thresholdHr_min_max = formq.cleaned_data['thresholdHr_min_max']
                                            )
            c.pathology.add(*formq.cleaned_data['pathology']),
            c.family_doctor.add(*formq.cleaned_data['family_doctor'])
            c.save()
            messages.success(self.request,'Il paziente %s%s è stato creato con successo' % (c.first_name,c.last_name))
            return HttpResponseRedirect(reverse('patients'))
        context = {'formq':formq}
        return render(request,template,context)

class PatientsEdit(View):
    '''
    Edit Patients
    '''
    def get(self,request,pat_id):
        if self.request.user.is_superuser:
            template = 'patients/editPatients.html'
            patient_id_edit = get_object_or_404(ProfilesUser,pk=pat_id)
            self.initial = {'thresholdMax_min_max' :[90,120],'thresholdMin_min_max':[60,110],'thresholdHr_min_max':[60,90]}
            #patient_id_phatology = PatologyUser.objects.filter(user_patology__id_blood=pat_id)
            print (patient_id_edit.thresholdMax_min_max)
            patient_id_dict = {
                         'first_name':patient_id_edit.first_name,
                         'last_name':patient_id_edit.last_name,
                         'date_born':patient_id_edit.date_born,
                         'sex':patient_id_edit.sex,
                         'ssn':patient_id_edit.ssn,
                         'city':patient_id_edit.city,
                         'address':patient_id_edit.address,
                         'cap':patient_id_edit.cap,
                         'pathology':patient_id_edit.pathology.all,
                         'family_doctor':patient_id_edit.family_doctor.all,
                         'thresholdMax_min_max': self.threasholdValue('thresholdMax_min_max',patient_id_edit.thresholdMax_min_max),
                         'thresholdMin_min_max':self.threasholdValue('thresholdMin_min_max',patient_id_edit.thresholdMin_min_max),
                         'thresholdHr_min_max':self.threasholdValue('thresholdHr_min_max',patient_id_edit.thresholdHr_min_max)
                         }
            formq = PatientsForms(initial=patient_id_dict)
            content = {'formq':formq}
            return render(request,template,content)
        messages.error(self.request,"L'utente %s non ha i permessi necessari" % self.request.user)
        return HttpResponseRedirect(reverse('dashboard'))

    def threasholdValue(self,key,valore):
        '''

        @param key:
        @param valore: Inserisci i valori di soglia se non esistenti
        @return:
        '''
        self.valore_dato = []
        if key in self.initial:
            if not valore:
                self.valore_dato.append(self.initial[key][0])
                self.valore_dato.append(self.initial[key][1])
                return self.valore_dato
            return valore




    def post(self,request,pat_id):
        template =  'patients/editPatients.html'
        patient_id_edit = get_object_or_404(ProfilesUser,pk=pat_id)
        #patient_id_phatology = PatologyUser.objects.filter(user_patology__id_blood=pat_id)
        formq = PatientsForms(self.request.POST or None,instance=patient_id_edit)
        if formq.is_valid():
            formq.save()
            messages.success(self.request,'I dati del paziente %s sono stati modificati con successo' % patient_id_edit.last_name)
            return HttpResponseRedirect(reverse('patients'))
        content = {'formq':formq}
        return render(request,template,content)

class PatientsDelete(View):
    '''
        Delete Patients id
        '''
    def get(self,request,pat_id):

        template = 'patients/deletePatients.html'
        patient_id_delete = get_object_or_404(ProfilesUser,pk=pat_id)
        context = {'patient_id_delete':patient_id_delete.pk,'nome':patient_id_delete.last_name}
        return render(request,template,context)

    def post(self,request,pat_id):

        cancella = ProfilesUser.objects.get(pk=pat_id)

        messages.success(self.request,'Il paziente %s è stato eliminato con successo' % cancella.last_name)
        cancella.delete()
        return HttpResponseRedirect(reverse('patients'))

class PatientsList(View):
    '''
    List of User ,Pathology and geolocations
    '''


    def get(self,request,*args):
        template = 'patients/patientsList.html'

        # start prova
        '''Da eliminare'''
        # pat = BloodValueUser.objects.filter(id_patients_for_ssn='BNILSS77A27C351B').order_by('date','time')
        # pat1 = BloodValueUser.objects.filter(id_patients_for_ssn='BNILSS77A27C351B')
        # value_for_patients= pat.values('blood_pressure_systolic','blood_pressure_diastolic','pulse','date','time','date_time')
        # print (json.dumps({'num_reg':pat.filter().count()}))
        pat = BloodValueUser.get_value.get_ssn_value('BNILSS77A27C351B')
        print (pat)
        # end prova


        pat = ProfilesUser.objects.all()
        # sostituzione del 'id_blood' con il codice fiscale'
        pat_cod_fiscale = ProfilesUser.objects.values_list('ssn', flat=True).order_by('pk')

        pat_ssn = ProfilesUser.objects.values_list('ssn',flat=True).order_by('pk')

        create_blood_value_last_cod_fiscale = []
        for items_cod_fiscale in pat_cod_fiscale:
            create_blood_value_last_cod_fiscale.append(BloodValueUser.objects.filter(id_patients_for_ssn=items_cod_fiscale).order_by('id').values('id_patients_for_ssn','gpsLatitude','gpsLongitude').last())
        context = {'patientslist':pat,'geo':create_blood_value_last_cod_fiscale}
        return render(request,template,context)

    def post(self):
        pass

class Template_nav_bar(TemplateView):

    template_name = 'patients/navbar_content.html'

    count = FamilyDoctor.objects.filter().count()

    def get_context_data(self, **kwargs):
        context = super(Template_nav_bar,self).get_context_data(**kwargs)
        context['count'] = self.count
        print (context)
        return context

class MedicList(View):
    '''
    Lista Medic
    '''
    def get(self, request, *args, **kwargs):
        template = 'medic/listMedic.html'
        lista_medici = FamilyDoctor.objects.all()
        context = {}
        context['medici_lista'] = lista_medici
        return render(request,template,context)

class MedicRegister(View):

    '''
    Registrazione Medici
    '''
    def get(self,request,*args,**kwargs):
        template = 'medic/createMedic.html'
        formq = MedicForms()
        content = {'formq':formq}
        return render(request,template,content)

    def post(self,request,*args,**kwargs):
        template = 'medic/createMedic.html'
        formq = MedicForms(self.request.POST)
        if formq.is_valid():
            instace = FamilyDoctor.objects.create(first_name=formq.cleaned_data['first_name'],
                                                   last_name=formq.cleaned_data['last_name'],city=formq.cleaned_data['city'],
                                                   address=formq.cleaned_data['address'],provincia=formq.cleaned_data['provincia'],
                                                   phone=formq.cleaned_data['phone'],mobile=formq.cleaned_data['mobile'])
            instace.save()
            messages.success(self.request,'Il nuovo dato è stato salvato con successo')
            return HttpResponseRedirect(reverse('medic_list'))
        return render(request,template,context={'formq':formq})

class MedicEdit(View):
     '''
     Edit Doctor
     '''

     def get(self,request,medic_id):
        template = 'medic/editMedic.html'
        medic_id=get_object_or_404(FamilyDoctor,pk=medic_id)
        medic_id_dict = {'first_name':medic_id.first_name,
                         'last_name':medic_id.last_name,
                         'address':medic_id.address,
                         'city':medic_id.city,
                         'provincia':medic_id.provincia,
                         'phone':medic_id.phone,
                         'mobile':medic_id.mobile}

        formq = MedicForms(initial=medic_id_dict)

        content = {'formq':formq}
        return render(request,template,content)

     def post(self,request,medic_id):
         template ='medic/editMedic.html'
         instance = FamilyDoctor.objects.get(pk=medic_id)
         formq = MedicForms(self.request.POST or None,instance=instance)
         if formq.is_valid():
            formq.save()
            messages.success(self.request,'La modifica è avvenuta con successo')
            return HttpResponseRedirect(reverse('medic_list'))
         context = {'formq':formq}
         return request(request,template,context)

class MedicDelete(View):
    '''
        Delete Medic id
        '''
    def get(self,request,medic_id):

        template = 'medic/deleteMedic.html'
        medic_id = get_object_or_404(FamilyDoctor,pk=medic_id)
        context = {'medic_id':medic_id.pk,'nome':medic_id.last_name}
        return render(request,template,context)

    def post(self,request,medic_id):

        cancella = FamilyDoctor.objects.get(pk=medic_id)

        messages.success(self.request,'Il medico %s è stato eliminato con successo' % cancella.last_name)
        cancella.delete()
        return HttpResponseRedirect(reverse('medic_list'))

class PathologyList(View):
    '''
    List Phatology
    '''
    def get(self, request, *args, **kwargs):
        template = 'pathology/listPathology.html'
        list_pathologies= PatologyUser.objects.all()
        context = {}
        context['pathology'] = list_pathologies
        return render(request,template,context)

class PhatologyRegister(View):

    '''
    Resitration Phatology
    '''

    def get(self,request):
        template = 'pathology/createPathology.html'
        formq = PhatologyForms()
        context = {'formq':formq}
        return render(request,template,context)

    def post(self,request):
        template = 'pathology/createPathology.html'
        formq = PhatologyForms(self.request.POST)
        if formq.is_valid():
            instace = formq.save(commit=False)
            instace.name = formq.cleaned_data['name_of_pathology']
            instace.description_of_pathology = formq.cleaned_data['description_of_pathology']
            instace.save()
            return HttpResponseRedirect(reverse('pathology_list'))
        context = {'formq':formq}
        return render(request,template,context)

class PathologyEdit(View):
     '''
     Edit Pathology
     '''

     def get(self,request,pathology_id):
        template = 'pathology/editPathology.html'
        pathology_id_edit =get_object_or_404(PatologyUser,pk=pathology_id)
        pathology_id_dict = {'name_of_pathology':pathology_id_edit.name_of_pathology,
                         'description_of_pathology':pathology_id_edit.description_of_pathology,
                         }
        formq = PhatologyForms(initial=pathology_id_dict)
        content = {'formq':formq}
        return render(request,template,content)

     def post(self,request,pathology_id):
         template ='pathology/editPathology.html'
         instance = PatologyUser.objects.get(pk=pathology_id)
         formq = PhatologyForms(self.request.POST or None,instance=instance)
         if formq.is_valid():
            formq.save()
            messages.success(self.request,'La modifica è avvenuta con successo')
            return HttpResponseRedirect(reverse('pathology_list'))
         context = {'formq':formq}
         return render(request,template,context)

class PathologyDelete(View):
    '''
        Delete Patholy id
        '''
    def get(self,request,pathology_id):

        template = 'pathology/deletePathology.html'
        pathology_id_delete = get_object_or_404(PatologyUser,pk=pathology_id)
        context = {'pathology_id':pathology_id_delete.pk,'nome':pathology_id_delete.name_of_pathology}
        return render(request,template,context)

    def post(self,request,pathology_id):

        cancella = PatologyUser.objects.get(pk=pathology_id)

        messages.success(self.request,'La Patologia %s è stata eliminata con successo' % cancella.name_of_pathology)
        cancella.delete()
        return HttpResponseRedirect(reverse('pathology_list'))




class TotalPkMixin(object):


    def get(self,*args,**kwargs):
        kwargs['total_pk'] = BloodValueUser.get_value.get_total_pk()
        return kwargs

class PatientsCharts(View,TotalPkMixin):
    '''
    crea le soglie da inviare, prova se il paziente è esistente e crea il json da inviare al diagramma

    '''
    def get(self, request,patient_id):

        total_pk = super(PatientsCharts,self).get()
        patient_single = get_object_or_404(ProfilesUser, pk=patient_id)
        create_thresholds_dict = {"BP_Max_High": patient_single.thresholdMax_min_max[1],
                               "BP_Max_Low":patient_single.thresholdMax_min_max[0],
                               "BP_Min_High":patient_single.thresholdMin_min_max[1],
                               "BP_Min_Low":patient_single.thresholdMin_min_max[0],
                               "BP_HR_High":patient_single.thresholdHr_min_max[1],
                               "BP_HR_Low":patient_single.thresholdHr_min_max[0]}
        try:
            patient_for_ssn = BloodValueUser.objects.filter(id_patients_for_ssn=patient_single.ssn).order_by('date','time')
        except BloodValueUser.DoesNotExist:
            patient_for_ssn = None
        value_for_patients= patient_for_ssn.values('id_patients_for_ssn','blood_pressure_systolic','blood_pressure_diastolic','pulse','date','time','date_time')
        for key in value_for_patients:
            for value in key:
                if value in 'date_time':
                    key['date_time'] = datetime.datetime.combine(key['date'],key['time']).strftime('%d-%m-%Y %H:%M')

        json_value_for_patients = json.dumps(list(value_for_patients),cls=DjangoJSONEncoder,)
        eta = (datetime.date.today().year - patient_single.date_born.year)
        content = {'single':patient_single,'eta':eta,'json_patients':json_value_for_patients,'pat':patient_for_ssn,'patient_thresholds_dict':create_thresholds_dict,
        'num_id':patient_for_ssn.filter().count()}
        if total_pk:
            content.update(total_pk)
        template = 'patients/patientscharts.html'
        return render(request,template,content)

    def post(self,request):
        pass


    def getJson(self,request,patient_id):
        patient_single = get_object_or_404(ProfilesUser, pk=patient_id)
        pat = BloodValueUser.objects.filter(id_patients_for_ssn=patient_single.ssn).order_by('date','time')
        value_for_patients= pat.values('blood_pressure_systolic','blood_pressure_diastolic','pulse','date','time','date_time')
        if value_for_patients:
            JsonAjax = json.dumps(list(value_for_patients),cls=DjangoJSONEncoder,)
            return HttpResponse(JsonAjax,content_type="application/json")
        return Http404('Json not created')





class PatientsChartsId(View):

    '''Visulizza e modifica i dati di pressione arteriosa e pulsazioni e peso in un form'''


    def get(self,request,patient_id,patientblood_id):


            patient_single = get_object_or_404(ProfilesUser, pk=patient_id)

            # Filtra tutti id pazienti uguale a patient_single.id_blood(uguale ad 1) ed le singole battute che sono uguali a pk = patientblood_id(in questo caso esempio 52)
            pat = BloodValueUser.objects.filter(id_patients_for_ssn=patient_single.ssn,pk=patientblood_id).order_by('date','time')
            pat1 = get_object_or_404(BloodValueUser, id_patients_for_ssn=patient_single.ssn,pk=patientblood_id)
            formBloodValue = ModelBloodValue(PatientsChartsId.createDict(pat))
            template = 'patients/modal/patientschartsid.html'
            content = {'formB':formBloodValue,'patient_single':patient_single.pk,'patientblood_id':pat1.pk}
            return render(request,template,content)


    def post(self,request,patient_id,patientblood_id):

        patient_single = get_object_or_404(ProfilesUser, pk=patient_id)
        pat = BloodValueUser.objects.get(id_patients_for_ssn=patient_single.ssn,pk=patientblood_id)
        pat1 = get_object_or_404(BloodValueUser,id_patients_for_ssn=patient_single.ssn,pk=patientblood_id)
        formBloodValue = ModelBloodValue(self.request.POST or None,instance=pat1)
        if formBloodValue.is_valid():
            instance = formBloodValue.save(commit=False)
            instance.date = pat.date
            instance.time = pat.time
            instance.date_time = pat.date_time
            instance.save()
            messages.success(self.request,'I valori per il  paziente %s %s sono  stati salvati correttamente'% (patient_single.first_name,patient_single.last_name))
            return HttpResponseRedirect(reverse('patients_charts', args=(patient_single.pk,)))
        template = 'patients/modal/patientschartsid.html'
        content = {'formB':formBloodValue}
        return render(request,template,content)

    def id_create(self,patient_id=None,**kwargs):
        patients_id_create = ProfilesUser.objects.filter(blood_value__id_patients=patient_id)
        k = tuple(j for j in patients_id_create)
        j = tuple((k,v )for k,v in kwargs.items())
        print (patients_id_create,j)
        return patients_id_create

    @classmethod
    def createDict(self,queryset):
        '''

        @param queryset: inserisce una queryset di django e crea una dizionario da inserire all'interno del form come instance
        @return:
        '''
        blooddict = {}

        for valueBlood in queryset:
            blooddict['id_patients_for_ssn'] = valueBlood.id_patients_for_ssn # da eliminare una volta che viene salvata
            blooddict['blood_pressure_systolic'] = valueBlood.blood_pressure_systolic
            blooddict['blood_pressure_diastolic'] = valueBlood.blood_pressure_diastolic
            blooddict['weight'] = valueBlood.weight
            blooddict['pulse'] = valueBlood.pulse
            blooddict['gpsLatitude'] = valueBlood.gpsLatitude
            blooddict['gpsLongitude'] = valueBlood.gpsLongitude
        return blooddict

class PatientsChartsNew(CreateView):
    '''
    Creo una nuova lettura  pressione e pulsazioni , verranno salvate nel database
    utilizzo il CreateView di django
    '''


    model = BloodValueUser
    fields = ('blood_pressure_systolic','blood_pressure_diastolic','pulse','weight')
    template_name = 'patients/modal/patientschartcreate.html'





    def dispatch(self,*args, **kwargs):

        '''
        Prendo  id del paziente dal db
        '''

        self.patient_id = get_object_or_404(ProfilesUser, pk=self.kwargs['patient_id']) #self.patient_id dizionario che si riferisce url

        # query per prendere pk/id associato all'paziente
        self.query_set = BloodValueUser.objects.filter(id_patients_for_ssn=self.patient_id.ssn).values_list('id_patients_for_ssn',flat=True).distinct('id_patients_for_ssn')
        self.query_set_id  = get_object_or_404(Infrastructure,id=1)
        return super(PatientsChartsNew,self).dispatch(*args,**kwargs)


    def get_success_url(self):
        '''
        Ritorna la corretta url passando il pk
        '''
        messages.success(self.request,'La Lettura è stata inserita con successo')
        return reverse('patients_charts', args=(self.patient_id.pk,))


    def get_context_data(self, **kwargs):
        ''''
        invio tramite dizionario,  id utente associato al paziente, nel template di inserimento letture pressione
        '''
        context = super(PatientsChartsNew,self).get_context_data(**kwargs)
        context['single_id'] = self.patient_id.pk
        return context


    def form_invalid(self, form):

         messages.success(self.request,"Errore su alcuni campi")
         return reverse('patients_charts', args=(self.patient_id.pk,))

    def get_initial(self):
         '''
         @return: crea una query per inviare al campo del db weight l'ultimo peso inserito dall'utente manuelmante
          o recuperato dal dispositivo di pressione
         '''
         put_value_on_fields = BloodValueUser.objects.filter(id_patients_for_ssn=self.patient_id.ssn).values_list('weight','date_registration')
         get_value_weight = put_value_on_fields.exclude(weight=0).order_by('date_registration').last()
         return {'weight':get_value_weight[0]}

    def form_valid(self, form):
         '''
         @param form: convalida il form, inserisce valori in base a pk utente ,data,tempo,e timestamp
         @return: salva nel database
         '''

         if self.query_set:
         #if self.query_set.__len__() != 0:
            form.instance.id_patients_for_ssn = self.query_set[0]
            form.instance.date = datetime.datetime.now().date()
            form.instance.time = datetime.datetime.now().time()
            form.instance.date_time = datetime.datetime.now()
            form.instance.gpsLatitude = self.query_set_id.CordinateGps.latitude
            form.instance.gpsLongitude = self.query_set_id.CordinateGps.longitude

            return super(PatientsChartsNew,self).form_valid(form)
         else:
            form.instance.id_patients_for_ssn = self.patient_id.ssn
            form.instance.date = datetime.datetime.now().date()
            form.instance.time = datetime.datetime.now().time()
            form.instance.date_time = datetime.datetime.now()
            form.instance.gpsLatitude = self.query_set_id.CordinateGps.latitude
            form.instance.gpsLongitude = self.query_set_id.CordinateGps.longitude

            return super(PatientsChartsNew,self).form_valid(form)

class PatientChartDelete(View):
    '''
    Cancella le letture delle misurazioni
    '''

    def get(self,request,patient_id,patientblood_id):
       template = 'patients/modal/patientschartdelete.html'
       patient_single= get_object_or_404(ProfilesUser, pk=patient_id)
       patient_single_id_blood = get_object_or_404(BloodValueUser, id_patients_for_ssn=patient_single.ssn,pk=patientblood_id)
       context = {'patient_single':patient_single.pk,'patientblood_id':patient_single_id_blood.pk,'Nome':patient_single.first_name,'Numero':patient_single_id_blood.pk}
       return render(request,template,context)


    def post(self,request,patient_id,patientblood_id):

       patient_single= get_object_or_404(ProfilesUser, pk=patient_id)
       #pat = BloodValueUser.objects.filter(id_patients=patient_single.id_blood,pk=patientblood_id).order_by('date','time')
       patient_single_id_blood = get_object_or_404(BloodValueUser, id_patients_for_ssn=patient_single.ssn,pk=patientblood_id)
       try:
           cancella = BloodValueUser.objects.filter(pk=patientblood_id,id_patients_for_ssn=patient_single.ssn)
           cancella.delete()
           messages.success(self.request,'La Lettura %d è stata cancellata con successo' % patient_single_id_blood.pk)
           return HttpResponseRedirect(reverse('patients_charts', args=(patient_single.pk,)))
       except ValueError:
           raise Http404('Impossibile cancellare')

