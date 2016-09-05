from django.core.validators import ValidationError
from django.utils.translation import ugettext_lazy as _

def validation_password_register(valore):

   '''Controllo dei campi password su form di registrazione ,
      verifica che esista un carattere numerio,
      verifica che esista un carattere maiuscolo,
      verifica la lunghezza della password
   '''
   passoword_lenght = 8

   if not any(char.isdigit() for char in valore):
             raise ValidationError(_('Password deve contenere un valore numerico'),params={ 'valore':valore})

   if not any(char.isupper() for char in valore):
            raise ValidationError(_('Password deve contenere un carattere maiuscolo'),params={ 'valore':valore})

   if len(valore) <  passoword_lenght:
        raise ValidationError(_('Password deve essere maggiore di 8 caratteri (ha lunghezza {0})').format(len(valore)), params={'valore':valore})

def validation_password_login(valore):

    '''Controllo dei campi password su form di Login ,
       verifica la lunghezza della password
   '''
    passoword_lenght = 8

    if len(valore) <  passoword_lenght:
        raise ValidationError(_('Password deve essere maggiore di 8 caratteri (ha lunghezza {0})').format(len(valore)), params={'valore':valore})
