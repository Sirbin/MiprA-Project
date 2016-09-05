from django import forms
from django.contrib.auth.models import User
from django.contrib.auth import models
from .validators import validation_password_register

from django.utils.translation import ugettext_lazy as _

class LoginForm(forms.ModelForm):


    #username = forms.CharField(required=True,label='Username',max_length=250,error_messages={'required':'Please enter your Username'})
    #email = forms.EmailField(required=True,label='Email',max_length=250,error_messages={'required':'Please enter your Email'})
    password = forms.CharField(widget=forms.PasswordInput,label='Password',max_length=200,error_messages = {'required':'Please enter a Password'})
    password_confirm = forms.CharField(widget=forms.PasswordInput,label='Confirm Password',max_length=200,error_messages = {'required':'Please Confirm Password'})


    def clean_password_confirm(self):
        password_model = self.cleaned_data['password']
        password_model_confirm = self.cleaned_data['password_confirm']
        if password_model != password_model_confirm:
            raise forms.ValidationError('Errore')
        return password_model_confirm

    class Meta:
        model = User
        fields = ['username','is_active']
    # def clean_username(self):
    #     user_form = self.cleaned_data['username']
    #     user = User.objects.get(username=user_form)
    #     print (user)
    #     return user



class Registraion(forms.ModelForm):


    password = forms.CharField(widget=forms.PasswordInput,label='Password',max_length=200,error_messages = {'required':'Please enter a Password'})

    password_confirm = forms.CharField(widget=forms.PasswordInput,label='Confirm Password',max_length=200,error_messages = {'required':'Please Confirm Password'})


    def clean_password_confirm(self):
        password_model = self.cleaned_data['password']
        password_model_confirm = self.cleaned_data['password_confirm']
        print (password_model_confirm,password_model)
        if password_model != password_model_confirm:
            raise forms.ValidationError("Password don't maching")
        return password_model_confirm


    class Meta:
        model = User
        fields = ['username','first_name','last_name','email','is_active','is_staff','is_superuser']

class Edituser(forms.ModelForm):


    password = forms.CharField(widget=forms.PasswordInput,label='Password',max_length=200,error_messages = {'required':'Please enter a Password'})

    password_confirm = forms.CharField(widget=forms.PasswordInput,label='Confirm Password',max_length=200,error_messages = {'required':'Please Confirm Password'})


    def clean_password_confirm(self):
        password_model = self.cleaned_data['password']
        password_model_confirm = self.cleaned_data['password_confirm']
        print (password_model_confirm,password_model)
        if password_model != password_model_confirm:
            raise forms.ValidationError("Password don't maching")
        return password_model_confirm

    def clean_username(self):
         user_form = self.cleaned_data.get('username',None)
         #user = User.objects.filter(username=user_form).exists()
         return user_form


    class Meta:
        model = User
        fields = ['username','first_name','last_name','email','is_active','is_staff','is_superuser']
        # importante cambia i dati di default
        # labels = {
        #     'is_staff': _('Writer'),
        # }
        # help_texts = {
        #     'is_staff': _('Some useful help text.'),
        # }
        # error_messages = {
        #     'is_staff': {
        #         'max_length': _("This writer's name is too long."),
        #     },
        # }

    # def save(self, commit=True):
    #        instance = super(Edituser,self).save(commit=False)
    #       #if models.check_password(self.cleaned_data['password'],encoded=self.cleaned_data['password']):
    #
    #        instance.password = self.cleaned_data['password']
    #        print (instance.password)
    #        if commit:
    #             instance.save()
    #        return instance
