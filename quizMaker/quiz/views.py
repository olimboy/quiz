from django.shortcuts import render, redirect
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.decorators import user_passes_test
from quiz.models import Theme, Dictionary
from quiz.serializers import ThemeSerializer, DictionarySerializer
from quiz.common import Question
import random, json

def is_login(user):
    print(user)
    return user.is_authenticated

# @user_passes_test(is_login, '/login/')
def index(request: HttpRequest):
    u = User.objects.count()
    t = Theme.objects.count()
    d = Dictionary.objects.count()
    stat = {'user': u, 'theme': t, 'dict': d}
    return render(request, 'quiz/index.html', {'user': request.user, 'stat': stat})

@user_passes_test(is_login, '/login/')
def en(request: HttpRequest):
    return render(request, 'quiz/game.html')

@user_passes_test(is_login, '/login/')
def uz(request: HttpRequest):
    return render(request, 'quiz/game.html')

@user_passes_test(is_login, '/login/')
def end(request: HttpRequest):
    return render(request, 'quiz/end.html')

@user_passes_test(is_login, '/login/')
def get_question(request: HttpRequest):
    p = json.loads(request.body)
    print(p)
    if  p.get('start', False) or Question.get_dicts == []:
        theme_id = p.get('theme', 1)
        theme = Theme.objects.get(pk=theme_id)
        Question.set_dicts(theme.get_dicts())
        return JsonResponse({'total': Question.get_total(), 'bonus': 1})
    if Question.get_total() == 0:
        return JsonResponse({'finish': True})
    lang = p.get('lang', 'en')
    data = Question.get(lang)
    data['voice'] = tts_base64(data['question']['ques']) if lang == 'en' else False
    return JsonResponse(data)

@user_passes_test(is_login, '/login/')
def post_question(request: HttpRequest):
    p = json.loads(request.body)
    print(p)
    reqireds = ['id', 'lang', 'question', 'answer']
    for r in reqireds:
        if r not in p:
            return JsonResponse({'ok': False, 'error': f'{r} required'})
    data = {'answer': 'incorrect'}
    if Question.check(p['id'], p['lang'], p['question'], p['answer']):
        data['answer'] = 'correct'
    data['correct'] = Question.get_correct(p['id'], p['lang'])
    return JsonResponse(data)

@user_passes_test(is_login, '/login/')
def tts(request):
    p = json.loads(request.body)
    print(p)
    text = p.get('text', 'Text not found')
    import pyttsx3, os
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[1].id)
    engine.setProperty('rate', 120)
    # engine.say(text)
    engine.save_to_file(text, "output.ogg")
    engine.runAndWait()
    fname="output.ogg"
    f = open(fname,"rb") 
    ogg = f.read()
    response = HttpResponse()
    response.write(ogg)
    response['Content-Type'] ='audio/ogg'
    response['Content-Length'] =os.path.getsize(fname )
    return response

def tts_base64(text):
    import pyttsx3
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[1].id)
    engine.setProperty('rate', 120)
    # engine.say(text)
    engine.save_to_file(text, "output.ogg")
    engine.runAndWait()
    # from gtts import gTTS
    # tts = gTTS(text)
    # tts.save("output.ogg")
    import base64
    fname="output.ogg"
    f = open(fname,"rb") 
    ogg = f.read()
    ogg = base64.b64encode(ogg)
    ogg_str = str(ogg,'ascii', 'ignore')
    ogg_str = 'data:audio/ogg;base64,' + ogg_str
    return ogg_str

@user_passes_test(is_login, '/login/')
def get_themes(request: HttpRequest):
    p = json.loads(request.body)
    print(p)
    reqireds = ['offset', 'limit']
    for r in reqireds:
        if r not in p:
            return JsonResponse({'ok': False, 'error': f'{r} required'})
    offset = int(p['offset'])
    limit = int(p['limit'])
    objs = []
    total = 0
    try:
        objs = list(request.user.themes.all()) + list(Theme.objects.filter(type=1))
        l = len(objs)
        total = l
        if offset not in range(0, l) or limit < 1:
            objs = []
            1 / 0
        if l >= limit and l - offset < limit:
            offset = l - limit
        objs = objs[offset : offset + limit]
    finally:
        themes = []
        for theme in objs:
            themes.append({'id': theme.pk, 'name': theme.name, 'dicts_count': theme.dicts.count()})
        return JsonResponse({'themes': themes, 'total': total})

@user_passes_test(is_login, '/login/')
def theme_add(request: HttpRequest):
    if request.method == 'POST':
        p = json.loads(request.body)
        print(p)
        theme = Theme()
        theme.name = p['name']
        theme.type = p['type']
        theme.user = request.user
        theme.save()
        return JsonResponse({'ok': True})
    return render(request, 'quiz/theme_add.html')

@user_passes_test(is_login, '/login/')
def dict_add(request: HttpRequest):
    if request.method == 'POST':
        p = json.loads(request.body)
        print(p)
        theme = Theme(pk=p['theme'])
        dict = Dictionary()
        dict.theme = theme
        dict.en = p['en']
        dict.uz = p['uz']
        dict.min_ask = p['min_ask']
        dict.save()
        return JsonResponse({'ok': True})
    return render(request, 'quiz/add.html')

@user_passes_test(is_login, '/login/')    
def get_index(request: HttpRequest):
    return render(request, 'quiz/index.html')

@user_passes_test(is_login, '/login/')    
def select(request: HttpRequest):
    return render(request, 'quiz/select.html')

def login(request: HttpRequest):
    if request.method == 'POST':
        username = request.POST['login']
        password = request.POST['password']
        user = auth.authenticate(request, username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect(request.GET.get('next', '/'))
    return render(request, 'quiz/login.html')

@user_passes_test(is_login, '/login/') 
def logout(request: HttpRequest):
    auth.logout(request)
    return redirect('/')

def reg(request: HttpRequest):
    if request.method == 'POST':
        username = request.POST['login']
        password1 = request.POST['password1']
        password2 = request.POST['password2']
        if password1 != password2:
            return render(request, 'quiz/reg.html')
        try:
            user = User.objects.create_user(username, password=password1)
            auth.login(request, user)
            return redirect(request.GET.get('next', '/'))
        except:
            return render(request, 'quiz/reg.html')
    return render(request, 'quiz/reg.html')

@user_passes_test(is_login, '/login/') 
def themes(request: HttpRequest):
    return render(request, 'quiz/themes.html')

@user_passes_test(is_login, '/login/') 
def stat(request: HttpRequest):
    objs = list(request.user.themes.all()) + list(Theme.objects.filter(type=1))
    dicts = []
    for item in objs:
        dicts.extend(item.dicts.all())
    return render(request, 'quiz/stat.html', {'dicts': dicts, 'i': 0})