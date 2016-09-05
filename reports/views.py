from django.shortcuts import render,render_to_response,Http404,HttpResponse,redirect,HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.core.serializers.json import DjangoJSONEncoder
from django.views.generic import View,TemplateView
from patients.models import FamilyDoctor,PatologyUser,ProfilesUser,BloodValueUser
from patients.signals import model_prost_save_send_threshold
import json


class getJason(View):

    def get(self,request,patient_id=None):
        patient_single = get_object_or_404(ProfilesUser, pk=2)
        pat = BloodValueUser.objects.filter(id_patients_for_ssn=patient_single.ssn).order_by('date','time')
        value_for_patients= pat.values('blood_pressure_systolic','blood_pressure_diastolic','pulse','date','time','date_time')
        print (pat.filter().count())
        if value_for_patients:
            if pat.filter().count() != self.request.GET.get('numeroDati'):
                JsonAjax = json.dumps(list(value_for_patients),cls=DjangoJSONEncoder,)
                return HttpResponse(JsonAjax,content_type="application/json")
        return Http404('Json not created')