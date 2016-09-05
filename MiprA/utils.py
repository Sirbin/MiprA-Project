from patients.models import BloodValueUser
import pusher
import json




# class Pusher_create(pusher.Pusher):
#   '''
#   Classe che importa il pusher, creiamo un metodo per
#   inviare i vati trigger
#   '''
#
#
#
#
#   def send_to_id_blood_pressure_value(self,ssn):
#          pat = BloodValueUser.objects.filter(id_patients_for_ssn=ssn).order_by('date','time')
#          pat1 = BloodValueUser.objects.filter(id_patients_for_ssn=ssn)
#          value_for_patients= pat.values('blood_pressure_systolic','blood_pressure_diastolic','pulse','date','time','date_time').order_by('date_time')
#          #print (pat.filter().count(),pat1.values('blood_pressure_systolic','blood_pressure_diastolic','pulse','date','time','date_time').latest('date_time'))
#          num_lis = json.dumps({'num_reg':pat.filter().count()})
#          # if value_for_patients:
#          #     if pat.filter().count() != request.GET.get('numeroDati'):
#          #return num_lis
#          return num_lis
#
#
#
#          #
#          # self.pusher_client.trigger('channel', 'id_all', {'message': time.time()})
#          # self.pusher_client.trigger('test_channel', 'my_event', {'message': 'hello world'})
#
# if __name__ == '__main__':
#   f = Pusher_create('220026','faaf2f5dfc0442542ba5','cfd486a31208916ebb52')
#   f.t