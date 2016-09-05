"""iEnergy URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.conf.urls.static import static
from django.contrib.auth import views as auth_viewlogin


#Local
from Login import views
from reports.views import getJason
from patients.views import PatientsRegistration,PatientsList,MedicRegister,\
    PhatologyRegister,PatientsCharts,PatientsChartsId,PatientsChartsNew,PatientChartDelete,\
    MedicEdit,MedicList,MedicDelete,PathologyList,PatientsEdit,PatientsDelete,\
    PathologyEdit,PathologyDelete
from infrastructure.views import InfrastructureCreate,InfrastructureInformation,\
    InfrastructureDelete,InfrastructureEdit



urlpatterns = [
    #url(r'^$',views.login_,name='login'),

    # Manager User
    url(r'^login/$','django.contrib.auth.views.login',name='login'),
    url(r'^logout/$','django.contrib.auth.views.logout',name='logout'),
    url(r'^logout-then-login/$','django.contrib.auth.views.logout_then_login',name='logout_the_login'),
    url(r'^profile-manager/$', views.ProfileList, name='user_manager'),
    # Change password url
    url(r'^profile-manager/password-change/$','django.contrib.auth.views.password_change', name='password_change'),
    url(r'^profile-manager/password-change/done/$', 'django.contrib.auth.views.password_change_done', name='password_change_done'),
    # Profile Url
    url(r'^profile-manager/registration/$',views.RegistrationUser, name='registration_user'),#Registrazion User
    url(r'^profile-manager/(?P<user_id>\d+)/edit-profile$' , views.EditUser, name='edit_user'), #Edit User
    url(r'^profile-manager/(?P<user_id>\d+)/delete-profile/$' , views.DeleteUser, name='delete_user'), #Delete User
    # Admin Url
    #url(r'^admin/', include(admin.site.urls)),
    # Base Url
    url(r'^$', views.dashboard, name='dashboard'),
    # Patients Url
    url(r'^patients/$',PatientsList.as_view() ,name='patients'), #Patients List
    url(r'^patients/registration-patients/$',PatientsRegistration.as_view(), name='registration_patients'),#Registration Patients
    url(r'^patients/(?P<pat_id>\d+)/edit-patients/$',PatientsEdit.as_view(),name='edit_patients'), #Edit Patients
    url(r'^patients/(?P<pat_id>\d+)/delete-patients/$',PatientsDelete.as_view(),name='delete_patients'), #Delete Patients
    # Medic Url
    url(r'^medic/$', MedicList.as_view(), name='medic_list'), #Medic List
    url(r'^medic/registration-medic/$',MedicRegister.as_view(), name='registration_medic'), #Registrazion Medic
    url(r'^medic/(?P<medic_id>\d+)/edit-medic/$',MedicEdit.as_view(),name='edit_medic'), #Edit Medic
    url(r'^medic/(?P<medic_id>\d+)/delete-medic/$',MedicDelete.as_view(),name='delete_medic'), #Delete Medic
    # Pathologies Url
    url(r'^pathologies/$', PathologyList.as_view(), name='pathology_list'), #Pathologies List
    url(r'^pathologies/registration-phatology/$',PhatologyRegister.as_view(), name='registration_pathology'),#Registration Pathology
    url(r'^pathologies/(?P<pathology_id>\d+)/edit-phatology/$',PathologyEdit.as_view(), name='edit_pathology'),#Edit Pathology
    url(r'^pathologies/(?P<pathology_id>\d+)/delete-phatology/$' ,PathologyDelete.as_view(), name='delete_pathology'),#Delete Pathology

    url(r'^patients/charts/(?P<patient_id>\d+)/$',PatientsCharts.as_view(), name='patients_charts'),
    # da elimnare solo prove con ajax
    url(r'^patients/charts/ajax/$',getJason.as_view(), name='patients_charts_ajax'),

    #Edit Blood Value
    url(r'^patients/charts/(?P<patient_id>\d+)/(?P<patientblood_id>\d+)/edit/$', PatientsChartsId.as_view(), name='patients_charts_blood'),
    #Create Blood Value
    url(r'^patients/charts/(?P<patient_id>\d+)/create/$', PatientsChartsNew.as_view(), name='patients_charts_blood_create'),
    #Delete Blood Value
    url(r'^patients/charts/(?P<patient_id>\d+)/(?P<patientblood_id>\d+)/delete/$',  PatientChartDelete.as_view(), name='patients_charts_blood_delete'),
    # Infrastructure Url
    url(r'^infrastructure/$', InfrastructureInformation.as_view(), name='information_infrastructure'), #Information Infrastructure
    url(r'^infrastructure/registration/$', InfrastructureCreate.as_view(), name='registration_infrastructure'), #Registration_Infrastructure
    url(r'^infrastructure/(?P<infr_id>\d+)/edit-infrastructure/$',InfrastructureEdit.as_view(),name='edit_infrastructure'), #Edit Infrastructure
    url(r'^infrastructure/(?P<infr_id>\d+)/delete-infrastructure/$',InfrastructureDelete.as_view(),name='delete_infrastructure'), #Delete Infrastructure


    url(r'^media/(?P<path>.*)$','django.views.static.serve',{'document_root':settings.MEDIA_ROOT}),
] + static(settings.STATIC_URL, document_root = settings.STATIC_ROOT)
