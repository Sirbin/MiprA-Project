from celery.task import PeriodicTask
from celery.schedules import crontab

from celery.utils.log import get_task_logger
from celery import signals,task
from celery.signals import task_revoked

from .ConMqtt import Connect_to_Mqtt
from .SerialBt import connect_to_serial
from MiprA.nma import PyNma

import datetime

logger = get_task_logger(__name__)


@task(name='Connessione Loop')
def connect_to_serial_bt(port):

    logger.info('Connect to bt %s' % port)

    return connect_to_serial(port)


def connet_to_Broker():
    '''

    @return:Avvia il collegamento con il server Mqtt
    '''
    logger.info('Connect to Broker')
    p = Connect_to_Mqtt()

    return p.mqtt_callback()

@task(name='send_to_device')
def send_to_device(topic,dato):
    '''

    @return: pubblica nel server mqtt topic e payload
    '''

    p = Connect_to_Mqtt()
    p.mqtt_send(topic,dato)

    return True




class run_periodic_task(PeriodicTask):
     '''
     il task si avvia una sola volta all'avvio del server web, rimane in ascolta sul broker mqtt
     '''
     strtime = datetime.datetime.now() + datetime.timedelta(minutes=0.1)
     ignore_result = True
     run_every =  crontab(month_of_year=strtime.month,day_of_month=strtime.day,hour=strtime.hour,minute=strtime.minute)
     name = 'Connect to Broker'


     def run(self,*args,**kwargs):

        PyNma().Celery_start()
        return connet_to_Broker()

     def on_failure(self, exc, task_id, args, kwargs, einfo):

         print (task_id,args,kwargs)



@task(name='somma')
def somma():

    strtime = datetime.datetime.now() + datetime.timedelta(minutes=1)

    return strtime.month


#Possibile inviare i task direttamente da qui
#somma.apply_async(args=(1,1),)