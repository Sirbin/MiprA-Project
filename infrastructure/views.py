from django.shortcuts import render

# Create your views here.

from django.shortcuts import render,HttpResponseRedirect,Http404,HttpResponse,render_to_response
from django.contrib.auth.models import User,check_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.urlresolvers import reverse,reverse_lazy
from django.views.generic import View,TemplateView
from .forms import InfrastructureForm
from .models import Infrastructure
from django.shortcuts import get_object_or_404
from django.template import RequestContext,loader

from datetime import datetime

class InfrastructureCreate(View):

    '''
    Create a Infrastructure
    '''
    def get(self,request,*args,**kwargs):

        template = 'infrastructure/createInfrastructure.html'
        formq = InfrastructureForm
        context = {'formq':formq}
        return render(request,template,context)



    def post(self,request,*args,**kwargs):

        template = 'infrastructure/createInfrastructure.html'
        formq = InfrastructureForm(self.request.POST or None)
        if formq.is_valid():
           formq.save()
           messages.success(self.request,'Il dato è stato salvato con successo')
           return HttpResponseRedirect(reverse('dashboard'))
        context = {'formq':formq}
        return render(request,template,context)


class InfrastructureInformation(View):
    '''
    List Infrastructure
    '''

    def get(self,request,*args,**kwargs):

        template = 'infrastructure/listInfrastructure.html'
        InfrastructureInformation = Infrastructure.objects.all()

        context = {}
        context['infr'] = InfrastructureInformation
        return render(request,template,context)


class InfrastructureEdit(View):
    '''
    Edit Infrastruture
    '''


    def get(self,request,infr_id):
        template = 'infrastructure/editInfrastructure.html'
        infrastructure_id=get_object_or_404(Infrastructure,pk=infr_id)
        infrastructure_id_dict = {'NomeOspedale':infrastructure_id.NomeOspedale,
                         'ViaOspedale':infrastructure_id.ViaOspedale,
                         'CittaOspedale':infrastructure_id.CittaOspedale,
                         'NumeroTelOspedale':infrastructure_id.NumeroTelOspedale,
                         'EmailOspedale':infrastructure_id.EmailOspedale,
                         'logoOspedale':infrastructure_id.logoOspedale,
                         'backOspedale':infrastructure_id.backOspedale,
                         'CordinateGps':infrastructure_id.CordinateGps}

        formq = InfrastructureForm(initial=infrastructure_id_dict)

        content = {'formq':formq}
        return render(request,template,content)

    def post(self,request,infr_id):
         template ='infrastructure/editInfrastructure.html'
         instance = Infrastructure.objects.get(pk=infr_id)
         formq = InfrastructureForm(self.request.POST or None,instance=instance)
         if formq.is_valid():
            formq.save()
            messages.success(self.request,'La modifica è avvenuta con successo')
            return HttpResponseRedirect(reverse('information_infrastructure'))
         context = {'formq':formq}
         return request(request,template,context)

class InfrastructureDelete(View):
    '''
    Delete Infrastructure ID
    '''

    def get(self,request,infr_id):

        template = 'infrastructure/deleteInfrastructure.html'
        infrastrucuture_id = get_object_or_404(Infrastructure,pk=infr_id)
        context = {'infr_id':infrastrucuture_id.pk,'nome':infrastrucuture_id.NomeOspedale}
        return render(request,template,context)

    def post(self,request,infr_id):

        if self.request.user.is_superuser:
            cancella = Infrastructure.objects.get(pk=infr_id)
            messages.success(self.request,"L'Infrastruttura %s è stata eliminata con successo" % cancella.NomeOspedale)
            cancella.delete()
            return HttpResponseRedirect(reverse('information_infrastructure'))
        else:
             messages.error(request,"L'utente non ha i permessi necessari")
             return HttpResponseRedirect(reverse('information_infrastructure'))
