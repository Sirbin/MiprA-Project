from django.shortcuts import render,HttpResponseRedirect,Http404,HttpResponse,render_to_response
from django.contrib.auth.models import User,check_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.urlresolvers import reverse,reverse_lazy
from django.db.models import Max

from django.shortcuts import get_object_or_404
from django.template import RequestContext,loader
from .forms import LoginForm,Registraion,Edituser

from patients.models import ProfilesUser,BloodValueUser
from django.core.serializers.json import DjangoJSONEncoder
import datetime
import json





def login_(request):
    form = LoginForm(request.POST or None)
    context = {'form': form}
    template = 'account/login1.html'
    if form.is_valid():
        user = form.cleaned_data['user']
        password = form.cleaned_data['password']
        print ('entrato',user)
        try:
            user_auth = User.objects.get(username=user)
        except User.DoesNotExist:
            user_auth = None
        if user_auth is not None:
            user = authenticate(username=user_auth.username, password = password)
            if user is None:
                messages.add_message(request, messages.INFO, 'User or password are incorrect')
                return HttpResponseRedirect('/')
            elif user.is_active:
                login(request,user)
                return HttpResponseRedirect('dashboard')
        messages.add_message(request, messages.INFO, 'User or password are incorrect')
        return HttpResponseRedirect('/')
    return render(request, template, context)

@login_required()
def dashboard(request):
    user_log = User.get_username(request.user)
    template = 'base/index.html'
    try:
        patients_list_default = ProfilesUser.objects.values_list('ssn',flat=True).order_by('pk')
    except ProfilesUser.DoesNotExist:
        patients_list_default = None
    patientList = ProfilesUser.objects.all() # List of Patients
    list_of_patient_and_blood = []
    list_of_id_max = []
    if patients_list_default:
        for i in patients_list_default:
            patient_id_max_systolic = BloodValueUser.objects.filter(id_patients_for_ssn=i).aggregate(Max('blood_pressure_systolic'))
            patient_id_max_diastolic = BloodValueUser.objects.filter(id_patients_for_ssn=i).aggregate(Max('blood_pressure_diastolic'))
            pat = BloodValueUser.objects.filter(id_patients_for_ssn=i).order_by('date','time')
            value_for_patients = pat.values('id_patients','id_patients_for_ssn','blood_pressure_systolic','blood_pressure_diastolic','time').order_by('date')
            create_dict_blood_value_max = {'id_patients_for_ssn':i,'id_patients':i,'max_sys':patient_id_max_systolic['blood_pressure_systolic__max'],'max_dia':patient_id_max_diastolic['blood_pressure_diastolic__max']}
            list_of_id_max.append(create_dict_blood_value_max)
            json_value_for_patients =list_of_patient_and_blood.append(json.dumps(list(value_for_patients),cls=DjangoJSONEncoder,))
        context = {'json':list_of_patient_and_blood[0],'patList':patientList,'value_pressure_max':list_of_id_max}
    else:
       context = {}
    messages.success(request, 'Welcome {0}'.format(user_log))
    return render(request,template, context)

@login_required()
def ProfileList(request):
    template = 'profileManager/profileList.html'
    userList = User.objects.all()
    context = {'userList':userList}
    #messages.info(request,'user is ok')
    return render(request,template,context)

@login_required()
def RegistrationUser(request):
    template = 'profileManager/register.html'
    formq = Registraion(request.POST or None)
    context = {'formq':formq}
    if formq.is_valid():
        username = formq.cleaned_data['username']
        password = formq.cleaned_data['password']
        email = formq.cleaned_data['email']
        new_user = User.objects.create_user(username,email=email,password=password)
        new_user.first_name = formq.cleaned_data['first_name']
        new_user.last_name = formq.cleaned_data['last_name']
        new_user.is_active = formq.cleaned_data['is_active']
        new_user.is_staff = formq.cleaned_data['is_staff']
        new_user.is_superuser = formq.cleaned_data['is_superuser']
        new_user.save()
        messages.success(request, "L'Utente è stato registrato correttamente")
        return HttpResponseRedirect('/profile-manager/',RequestContext(request))
    return render(request,template,context)

@login_required()
def EditUser(request, user_id):
    user_edit = get_object_or_404(User,pk=user_id)
    template = 'profileManager/edit.html'
    if request.user.is_superuser:
        initial = {'username':user_edit.username,'first_name':user_edit.first_name,
               'last_name':user_edit.last_name,
               'email':user_edit.email,
               'is_active':user_edit.is_active,
               'is_staff':user_edit.is_staff,
               'is_superuser':user_edit.is_superuser}

        if request.method == 'POST':
            formq = Edituser(data=request.POST,instance=user_edit)
            if formq.is_valid():
                instance = formq.save(commit=False)
                instance.set_password(formq.cleaned_data['password_confirm'])
                messages.success(request,"L'utente è stato salvato correttamente")
                instance.save()
                return HttpResponseRedirect(reverse('user_manager'))
        else:
            formq =Edituser(initial=initial)
        context = {'formq':formq}
        return render(request,template,context)
    messages.error(request,"L'utente %s non ha i permessi necessari" % request.user)
    return HttpResponseRedirect(reverse('dashboard'))

@login_required()
def DeleteUser(request,user_id):

    user_edit = User.objects.filter(pk=user_id).get()
    template = 'profileManager/deleteUser.html'
    if request.user.is_superuser:
        if request.method == 'POST':
            user_edit.delete()
            messages.success(request,'User is delete')
            return HttpResponseRedirect(reverse('user_manager'))

    else:
        messages.error(request,"L'utente non ha i permessi necessari")
        return HttpResponseRedirect(reverse('user_manager'))
    context ={'user_id':user_edit.pk,'user_name':user_edit.username}
    return render(request,template,context)




def logout(request):
    template = '/logged_out.html'
    context = locals()
    logout(request)
    return render(request,template,context)
