from django.core.serializers.json import DjangoJSONEncoder
from django.db.models.signals import post_save,pre_save
from django.dispatch import receiver
from django.shortcuts import get_object_or_404

from .models import ProfilesUser,BloodValueUser

from .tasks import connect_to_serial_bt,connet_to_Broker,send_to_device
from MiprA.nma import PyNma
import uuid
import pusher
import datetime
import requests

@receiver(post_save,sender=ProfilesUser)
def model_post_save(sender,**kwargs):
     '''

     @param sender:
     @param kwargs:
     @return: spedisce il task dopo aver salvato nel db il paziente
     '''

     # prendo dal profile user id del paziente
     p = PyNma()
     get_id = get_object_or_404(ProfilesUser,id=(kwargs['instance'].id))
     # creo il dizionato da pubblicare nel payload
     create_thresholds_dict = {"BP_Max_High": get_id.thresholdMax_min_max[1],
                               "BP_Max_Low":get_id.thresholdMax_min_max[0],
                               "BP_Min_High":get_id.thresholdMin_min_max[1],
                               "BP_Min_Low":get_id.thresholdMin_min_max[0],
                               "BP_HR_High":get_id.thresholdHr_min_max[1],
                               "BP_HR_Low":get_id.thresholdHr_min_max[0]}
     #print (create_thresholds_dict)
     #send = send_to_device.apply_async(('BP/'+str(kwargs['instance'].ssn)+'/Thresholds',str(create_thresholds_dict)))
     send_to_device.delay('BP/'+str(kwargs['instance'].ssn)+'/Thresholds',str(create_thresholds_dict))
     #if send.status == 'SUCCESS':
     print (kwargs)
     p.Threshold_send(mqttsend=str(create_thresholds_dict),ssn=str(kwargs['instance'].ssn))


@receiver(post_save,sender=BloodValueUser,dispatch_uid=str(uuid.uuid1()))
def model_prost_save_send_threshold(sender,instance,*args,**kwargs):
    '''
    Controlla dopo aver  salvato nel database se esistono dei valori di pressione e pulzazioni fuori soglia
    @param sender: Database delle letture dispositivi
    @param args:
    @param kwargs: Dizionario invio dati post_save
    @return:
    '''



    p = PyNma()

    '''
    da controllare se funziona
    '''

    # inizio verifica

    pusher_client = pusher.Pusher(
    app_id='220026',
    key='faaf2f5dfc0442542ba5',
    secret='cfd486a31208916ebb52',
    cluster='eu',
    ssl=False
    )



    # se la chiave key created è true(cioe è stato salvato un nuovo record invia il trigger
    if kwargs['created'] == True:
        channel = 'save in database %s'
        id = '%s ' % instance.id_patients_for_ssn


        # crea l'eveto
        event_data = get_patient_id(instance.id_patients_for_ssn)


        # invia l'evento
        pusher_client.trigger('channel', 'id_all', event_data)



    #fine verifica

    # creo il dizionario con soglie per singolo paziente
    # controllo se il Profilo Utente è esistente invia le relative soglie altrimenti Profilo non esistente inviando un False
    try:
        get_id = ProfilesUser.objects.get(ssn=instance.id_patients_for_ssn)
        create_thresholds_dict = {"BP_Max_High": get_id.thresholdMax_min_max[1],
                               "BP_Max_Low":get_id.thresholdMax_min_max[0],
                               "BP_Min_High":get_id.thresholdMin_min_max[1],
                               "BP_Min_Low":get_id.thresholdMin_min_max[0],
                               "BP_HR_High":get_id.thresholdHr_min_max[1],
                               "BP_HR_Low":get_id.thresholdHr_min_max[0]}
        send_to_nma = {}
        # controllo se le letture sono fuori soglia
        if instance.blood_pressure_systolic <= int(create_thresholds_dict["BP_Max_Low"]):
            send_to_nma['Pressione Massima'] = str(instance.blood_pressure_systolic)+'<'+str(get_id.thresholdMax_min_max[0])
        elif instance.blood_pressure_systolic >= int(create_thresholds_dict["BP_Max_High"]):
            send_to_nma['Pressione Massima'] = str(instance.blood_pressure_systolic)+'>'+str(get_id.thresholdMax_min_max[1])
        if instance.blood_pressure_diastolic <= int(create_thresholds_dict["BP_Min_Low"]):
            send_to_nma['Pressione Minima'] = str(instance.blood_pressure_diastolic)+'<'+str(get_id.thresholdMin_min_max[0])
        elif instance.blood_pressure_diastolic >= int(create_thresholds_dict["BP_Min_High"]):
            send_to_nma['Pressione Minima'] = str(instance.blood_pressure_diastolic)+'<'+str(get_id.thresholdMin_min_max[1])
        if instance.pulse <= int(create_thresholds_dict["BP_HR_Low"]):
            send_to_nma['Pulsazioni'] = str(instance.pulse)+'<'+str(get_id.thresholdHr_min_max[0])
        elif instance.pulse >= int(create_thresholds_dict["BP_HR_High"]):
            send_to_nma['Pulsazioni'] = str(instance.pulse)+'>'+str(get_id.thresholdHr_min_max[1])
        # se non è presente nessun valore nel diz non invia nessuna notifica
        if not send_to_nma:
            return False
        # invia notifica
        p.threshold_check(name=get_id.last_name,**send_to_nma)
        return True
    except ProfilesUser.DoesNotExist:
        return False



def get_patient_id(ssn):
    '''
    Inserisce in un json ultima lettura per singolo paziente
    aggiunge anche il numero totale letture
    @param ssn:id paziente
    @return: ultima lettura per singolo id paziente
    '''
    add_element_in_table = BloodValueUser.get_value.get_ssn_value(ssn)
    return add_element_in_table
#