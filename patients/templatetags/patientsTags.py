from django import template


register = template.Library()

from ..models import FamilyDoctor,PatologyUser,ProfilesUser
from Login.models import User

@register.simple_tag
def totalDoctor():

    total_doctor = FamilyDoctor.objects.filter().count()
    return total_doctor


@register.simple_tag()
def totalPathology():

    return PatologyUser.objects.filter().count()

@register.simple_tag()
def totalPatients():

    return ProfilesUser.objects.filter().count()



@register.simple_tag()
def totalUser():
    return User.objects.filter().count()

@register.simple_tag()
def activeUser():
    return User.objects.filter(is_active=True).count()
