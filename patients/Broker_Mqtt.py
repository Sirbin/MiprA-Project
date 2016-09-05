from django.core.serializers.json import DjangoJSONEncoder
from django.contrib import messages
from django.utils import timezone


from .models import BloodValueUser
import paho.mqtt.client as mqtt
import threading
import simplejson
import datetime
import time

from .SerialBt import connect_to_serial
import datetime


class Connect_to_Mqtt(object):


    host = "192.168.0.10"
    port = 1883
    collector = "Dovrebbe essere il codice fiscale"

    def connect_to(self,host,port,collector,):

        topic = 'BP/#'

        try:
            self.client = mqtt.Client()
            print('Topic set to '+str(topic),str(self.client.loop()))
            #self.keep_loop(1)
        except:
            pass
        try:
             self.client.connect(self.host,self.port, 60)
             print('Connected to > '+str(self.host)+' port '+str(self.port)+' timeout '+str(datetime.datetime.now())+' status '+str(self.client._client_id))
             #self.keep_loop(1)
             self.mqtt_callback()
        except:
             print('Not connected !!!!')
             self.client.reconnect()

        #self.mqtt_send()
        #self.live = threading.Thread(target=self.live_threaded)
        #self.live.start()


    def __str__(self, id, **kwargs):
         pass

    def check_google(self):
        '''
        return false if google website is down
        '''
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("google.com",80))
            s.close()
            return True
        except:
            s.close()
            return False

    def reconnect(self,host,port,collector):
        global last_host
        global last_port
        global last_collector

        connected = False
        retry = 5
        if self.check_google() ==True:
            while connected != True & retry > 0:
                try:
                    print('Reconnection in progress !!!!')
                    #logging.warning('Reconnecting Host > '+str(host)+' port >>> '+str(port))
                    #was hung when reconnect .....added forced disconnect()
                    try:
                        print('Trying to disconnect !!!!')
                        self.client.disconnect()
                    except:
                        print('Failed to disconnect brocker !!!')
                    time.sleep(10)
                    print('Trying to connect again !!!!')
                    try:
                        mqttc.connect(last_host,last_port, timeout, True)
                        print('Reconnected to '+str(last_host))
                        mqttc.on_connect = on_connect
                        mqttc.on_message = on_message
                        mqttc.on_disconnect = on_disconnect
                        connected = True
                        retry=3
                    except:
                        pass
                    try:
                        mqttc.subscribe(str(last_collector['device_name'])+'/Setup/'+str(last_collector['portfolio'])+'/'+str(last_collector['building'])+'/#', 2)
                        #logging.warning('Subscribed to > '+str(last_collector['device_name'])+'/Setup/'+str(last_collector['portfolio'])+'/'+str(last_collector['building'])+'/#')
                    except:
                        print('Unable to subscribe to '+str(last_collector['device_name'])+'/Setup/'+str(last_collector['portfolio'])+'/'+str(last_collector['building']))
                    return True
                except:
                    #logging.warning('Unable to reconnect > '+str(last_collector['device_name'])+'/Setup/'+str(last_collector['portfolio'])+'/'+str(last_collector['building'])+'/#')
                    print('Unable to connect MQTT brocker '+str(last_host) + ' retry '+ str(retry))
                    retry -=1
        else:
            print('No internet connection waiting 1 minute!!!!')
            time.sleep(60)
        time.sleep(60)

    def keep_loop(self,connessione):
        '''
        Connessione alive con il Broker
        '''
        try:
            if int(self.client.loop()) != 0:
                time.sleep(connessione)
                self.reconnect(self.host, self.port, self.collector)
                #self.client.publish(topic='BP/LPRVTM69S29C351R/Thresholds', payload="{'prova':180,'prova2':300}", qos=2)
                print (int(self.client.loop()))
                return True
            else:

                #self.mqtt_callback()
                print(int(self.client.loop()))
                return False
        except Exception as e:
            print('Error MQTT keep loop ' + str(e) + 'run = ' + str(self.client._client_id))
            #reconnect(last_host, last_port, last_collector)


    def mqtt_callback(self):
        '''
        @return: Ciclo per recuperare le varie letture dai dispositivi.
        '''

        self.client.on_connect = self.connected
        self.client.on_message = self.messaged
        self.run = True
        while self.run:
            time.sleep(2)
            self.client.loop_start()


    def mqtt_send(self,topic=None,dato=None):
           #self.client.subscribe('BP/#',2)
           self.client.publish(topic='BP/TKDKKE80H67Z219C/Threshold', payload="ciao", qos=2)
           #r = self.client.publish(topic='BP/TKDKKE80H67Z219C/Threshold', payload="{'prova':180,'prova2':300}", qos=2)




    def connected(self, client, userdata, flags, rc):

            if rc == 0:
                print('Connesso ', rc)
                self.client.subscribe('BP/#')
            else:
                print('Non Connesso')

    def live_threaded(self):

         self.client._keepalive = True
         while self.client._keepalive:
             self.client.loop()
         self.client.disconnect()

    def disconnected(self, mosq, obj, rc):
         print ('Disconesso')


    def published(self, mosq, obj, mid):
         pass


    def subscribed(self, mosq, obj, mid, qos_list):
         print("Subscribe with mid "+str(mid)+" received.")

    def unsubscribed(self, mosq, obj, mid):
        pass

    def messaged(self, mosq, obj, msg):
        '''

        @param mosq:
        @param obj:
        @param msg:
        @return: Salva nel db le varie letture dei dati pressori dei pazienti , il controllo id è per codice fiscale
        '''
        gt = list(' ')
        gt.append(msg.payload.decode('utf-8'))
        #print (len(gt[1]),type(gt[1]))
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
                      print ('salvio')
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