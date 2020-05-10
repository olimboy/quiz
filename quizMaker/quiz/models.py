from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Theme(models.Model):
    user = models.ForeignKey(User, models.CASCADE, 'themes')
    name = models.CharField(max_length=255)
    type = models.IntegerField(default=0, choices=(
        (0, 'private'),
        (1, 'public'),
    ))
    
    def __str__(self):
        return self.name
    
    def get_dicts(self):
        dicts = []
        for d in self.dicts.all():
            if not d.is_done():
                data = dict(
                    id = d.pk,
                    en = d.en,
                    uz = d.uz,
                )
                dicts.append(d)
        return dicts

class Dictionary(models.Model):
    theme = models.ForeignKey(Theme, models.CASCADE, 'dicts')
    en = models.CharField(max_length=255)
    uz = models.CharField(max_length=255)
    correct = models.IntegerField(default=0)
    incorrect = models.IntegerField(default=0)
    min_ask = models.IntegerField(default=10)
    

    def __str__(self):
        return self.en + ' - ' + self.uz
    
    def is_done(self) -> bool:
        sum = self.correct + self.incorrect
        if sum == 0:
            return False
        return int(self.correct / sum * 100) > 95 and sum > self.min_ask
    
    def percent(self) -> int:
        sum = self.correct + self.incorrect
        if sum == 0:
            return 0
        return int(self.correct / sum * 100)
    