from django.core.serializers.json import DjangoJSONEncoder
from django.contrib import messages
from django.utils import timezone


from .models import BloodValueUser
import paho.mqtt.client as mqtt
import simplejson
import time
import socket
import datetime

class Connect_to_Mqtt(object):
    '''
    Connet_to_mqtt si collega ad un server mqtt se questo è up, altrimenti
    sel il server mqtt è down , prova a collegarsi ogno 5 sec,, un volta up
    si collega e attende i dati dai dispositivi di pressione.
    Controlla inoltre se i dati pressori sono gia salvati nel db,
    se cosi non fosse vengono salvati come nuove letture.
    Letture di dati pressori con nuovi id(codice fiscale) vengono salvati.

    '''

    host_web = "192.155.90.139"
    host = "192.168.0.10"
    port = 1883
    topic = "BP/#"


    def __init__(self):

        try:
            self.client = mqtt.Client()
            print('Topic set to '+str(self.topic),str(self.client.loop()))
            if self.check_google() == True:
                self.client.connect(self.host,self.port, 60)
                print('Connected to > '+str(self.host)+' port '+str(self.port)+' timeout '+str(datetime.datetime.now())+' status '+str(self.client._client_id))
            else:
                time.sleep(5)
                print ('No Connect')
                self.reconnect_to_mqtt(self.host,self.port)
        except:
            pass

    def connect_to(self,host):
        '''

        @return: se esiste un host
        '''

        if self.host:
            return self.host_web
        return host


    def __str__(self, id, **kwargs):
         pass

    def reconnect_to_mqtt(self,host,port):
        '''

        @param host:
        @param port:
        @return:
        '''
        print ('Retry to Conneto to server mqtt')
        while self.check_google() == False:
            time.sleep(5)
            print ('Reconnect to > '+ str(self.host)+'port '+str(self.port)+'timeout '+str(time.sleep(5))+'id client '(self.client._client_id))
        else:
            self.client.connect(host,port)
            self.client.on_connect = self.connected
            print ('Connect to > '+ str(self.host)+'port '+str(self.port)+'timeout '+str(time.sleep(5))+'id client '(self.client._client_id))
            return True


    def check_google(self):
        '''

        @return: True se si collega a google
        '''
        s = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        try:
            s.connect(("google.com",80))
            s.close()
            return True
        except:
            s.close()
            return False

    def mqtt_callback(self):
        '''
        @return: Ciclo per recuperare le varie letture dai dispositivi.
        '''

        self.client.on_connect = self.connected
        self.client.on_message = self.messaged
        self.client.on_disconnect =self.disconnected
        self.run = True
        while self.run:
            self.client.loop_start()


    def mqtt_send(self,topic,dato):
           '''

           @param topic:
           @param dato:
           @return: Pubblica sul server mqtt il topic e payload
           '''
           self.client.loop_start()
           self.client.on_connect = self.connected
           self.client.publish(topic=topic, payload=dato, qos=2)
           self.client.on_disconnect = self.disconnected


           self.client.on_disconnect = self.disconnected




    def connected(self, client, userdata, flags, rc):

            if rc == 0:
                print('Connesso ', rc)
                self.client.subscribe(self.topic)
            else:
                print('Non Connesso')

    def live_threaded(self):

         self.client._keepalive = True
         while self.client._keepalive:
             self.client.loop()
         self.client.disconnect()

    def disconnected(self, mosq, obj, rc):
         print (rc)
         if rc != 0:
            print ('Disconesso')
            self.reconnect_to_mqtt(self.host,self.port)



    def published(self, mosq, obj, mid):
         pass


    def subscribed(self, mosq, obj, mid, qos_list):
         print("Subscribe with mid "+str(mid)+" received.")

    def unsubscribed(self, mosq, obj, mid):
        pass

    def messaged_pub(self, mosq, obj, msg):
        print (msg.topic,msg.payload)


    def messaged(self, mosq, obj, msg):
        '''

        @param mosq:
        @param obj:
        @param msg:
        @return: Salva nel db le varie letture dei dati pressori dei pazienti , il controllo id è per codice fiscale
        '''
        gt = list(' ')
        gt.append(msg.payload.decode('utf-8'))
        if len(gt[1]) > 200:
                try:
                    self.myJSONdata =simplejson.loads((gt[1]))
                except:
                    print ('json errore')

                print(self.myJSONdata[0]['ID_Paziente'])

                '''Controllo se il Cod_Fiscale è presente'''
                try:
                     id_pat = BloodValueUser.objects.filter(id_patients_for_ssn=self.myJSONdata[0]['ID_Paziente']).exists()
                except BloodValueUser.DoesNotExist:

                      instance = BloodValueUser.objects.create(id_patients_for_ssn=self.myJSONdata[0]['ID_Paziente'],weight=self.myJSONdata[0]['Patient_Weight'],blood_pressure_systolic=self.myJSONdata[0]['BP_Max'],blood_pressure_diastolic=self.myJSONdata[0]['BP_Min'],\
                                                            pulse=self.myJSONdata[0]['BP_HR'],date=self.strdate_change_date,time=self.strtime_change_time,date_time=self.value_data_time,\
                                                                    gpsLatitude=self.myJSONdata[0]['Latitude'],gpsLongitude=self.myJSONdata[0]['Longitude'])
                      instance.save()
                      print ('salvo')
                self.id_patients_for_serial_take_id_datetime = BloodValueUser.objects.filter(id_patients_for_ssn=self.myJSONdata[0]['ID_Paziente']).values_list('date_time',flat=True)


                # cambio le str time e date in formato datatime per salvarli ned db
                self.strtime_change_time = timezone.datetime.strptime(self.myJSONdata[0]['Time'],'%H%M%S').time()
                self.strdate_change_date  = datetime.datetime.strptime(self.myJSONdata[0]['Date'],'%d%m%Y').date()

                #merge data e tempo
                self.value_data_time = datetime.datetime.combine(self.strdate_change_date,self.strtime_change_time)

                if not self.value_data_time in self.id_patients_for_serial_take_id_datetime:
                         print('Posso salvare')
                         instance_id=  BloodValueUser.objects.filter().latest('pk')
                         print (instance_id.id)
                         instance = BloodValueUser.objects.create(id_patients_for_ssn=self.myJSONdata[0]['ID_Paziente'],weight=self.myJSONdata[0]['Patient_Weight'],blood_pressure_systolic=self.myJSONdata[0]['BP_Max'],blood_pressure_diastolic=self.myJSONdata[0]['BP_Min'],\
                                                           pulse=self.myJSONdata[0]['BP_HR'],date=self.strdate_change_date,time=self.strtime_change_time,date_time=self.value_data_time,\
                                                                   gpsLatitude=self.myJSONdata[0]['Latitude'],gpsLongitude=self.myJSONdata[0]['Longitude'])
                         instance.save()
                else:
                     print ('E presente')
        else:
            pass

