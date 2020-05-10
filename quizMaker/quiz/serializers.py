from rest_framework import serializers, viewsets, routers
from quiz.models import Theme, Dictionary

class DictionarySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Dictionary
        fields = '__all__'

class ThemeSerializer(serializers.HyperlinkedModelSerializer):
    dicts = DictionarySerializer(many=True)
    class Meta:
        model = Theme
        fields = '__all__'


class ThemeViewSet(viewsets.ModelViewSet):
    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer
