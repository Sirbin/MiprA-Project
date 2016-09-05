from django.apps import AppConfig


class PollsConfig(AppConfig):
    name = 'patients'
    verbose_name = 'Patients Application'

    def ready(self):
        import patients.signals