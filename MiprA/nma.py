import pynma
import datetime


class PyNma(pynma.PyNMA):

    priority = (0,"regular priority")
    key = "b468ab414b419b78d04204a4b90104f4b72eed5f47756e33"


    def __init__(self):
        super(PyNma,self).__init__(apikey=self.key)

    def Celery_start(self):

        self.push("Celery",'Sistema','Celery Avviato alle %s' % datetime.datetime.now())

    def Celery_end(self):

        self.push("Celery",'Sistema','Celery Stop alle %s' % datetime.datetime.now())

    def Threshold_send(self,mqttsend,ssn):

        self.push("MQTT",'Sistema','Soglie inviate per %s ,%s alle %s' % (ssn,mqttsend,datetime.datetime.now())) # da modificare la data

    def threshold_check(self,name,**threshold):

        self.push('Pressione',"Allarme %s" % (name),' %s alle %s' % (threshold,datetime.datetime.now()),priority=2)