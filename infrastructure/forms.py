from django import forms
from .models import Infrastructure


class InfrastructureForm(forms.ModelForm):


    class Meta:
        model = Infrastructure
        fields = ('__all__')
