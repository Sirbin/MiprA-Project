from django.db import models
from django.contrib.auth.models import User
# Create your models here.



class UserAdd(models.Model):

    user = models.OneToOneField(User,on_delete=models.CASCADE)

    password_confirm = models.CharField(max_length=24)


    def __unicode__(self):
        return self.user


