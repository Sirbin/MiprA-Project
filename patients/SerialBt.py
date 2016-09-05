from django.utils import timezone

from .models import ProfilesUser,BloodValueUser
import serial
import simplejson
import datetime


def controllo_date_and_time(string,time,data):
        try:
            data_ = (datetime.date.strftime(string[data],'%d%m%Y').date())
            time_ = (datetime.date.strftime(string[time],'%H%m').time())
            return data_,time_
        except ValueError:
            pass


def connect_to_serial(port):

    '''Servizio per collegamento seriale bt
    Dal database recupero l'ultimo inserimento bloodvalue per id, collegandosi tramite Bt viene recuperato
    il dato in formato json che viene confrontao con ogni signolo valore del file json precedentmente estrapolato dal db.
    Serie di if per match con i campi, se esistono i valori pass altrimenti salva nel db BloodValue
    '''

    # richiamare tutti gli id dal database ed inserirli in un dict'''


    try:
        ser = serial.Serial(port=port,timeout=3)
        if ser.is_open:
            while True:
                id_patients_for_serial = BloodValueUser.objects.values('id_patients','date','time','date_time').order_by('date','time').latest('date_time')
                print(ser.name)
                # Legge da seriale
                format_json = ser.readline().decode('utf-8')
                gt = list(' ')
                gt.append(format_json)
                print (len(gt[1]),type(gt[1]))
                if len(gt[1]) > 2:
                    # creazione del json
                     myJSONdata =simplejson.loads(gt[1])
                     print (type(myJSONdata['Latitude']),myJSONdata['Longitude'])

                     '''Controlla se id è esistete'''
                     try:
                         id_pat = BloodValueUser.objects.filter(id_patients=myJSONdata['ID']).exists()
                         print('id_paziente',id_pat)
                     except BloodValueUser.DoesNotExist:
                         instance = BloodValueUser.objects.create(id_patients=myJSONdata['ID'],blood_pressure_systolic=myJSONdata['Systolic'],blood_pressure_diastolic=myJSONdata['Diastolic'],\
                                                          pulse=myJSONdata['Pulse'],date=strdate_change_date,time=strtime_change_time,date_time=value_data_time,\
                                                                  gpsLatitude=myJSONdata['Latitude'],gpsLongitude=myJSONdata['Longitude'])
                         instance.save()
                         print ('salvio')
                     id_patients_for_serial_take_id_datetime = BloodValueUser.objects.filter(id_patients=myJSONdata['ID']).values_list('date_time',flat=True)

                     # cambio le str time e date in formato datatime per salvarli ned db
                     strtime_change_time = timezone.datetime.strptime(myJSONdata['Time'],'%H%M').time()
                     strdate_change_date  = datetime.datetime.strptime(myJSONdata['Date'],'%d%m%Y').date()

                     #merge data e tempo
                     value_data_time = datetime.datetime.combine(strdate_change_date,strtime_change_time)
                     if not value_data_time in id_patients_for_serial_take_id_datetime:
                        print('Posso salvare')
                        instance = BloodValueUser.objects.create(id_patients=myJSONdata['ID'],blood_pressure_systolic=myJSONdata['Systolic'],blood_pressure_diastolic=myJSONdata['Diastolic'],\
                                                         pulse=myJSONdata['Pulse'],date=strdate_change_date,time=strtime_change_time,date_time=value_data_time,\
                                                                 gpsLatitude=myJSONdata['Latitude'],gpsLongitude=myJSONdata['Longitude'])
                        instance.save()
                     else:
                         print ('E presente')
                else:
                     pass
        return False
    except ValueError:
        print ('Errore sulla connessione alla seriale ')
        connect_to_serial(port)
