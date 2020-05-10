import random
from quiz.models import Dictionary

class Question:
    dicts = []
    _dicts = []
    
    @staticmethod
    def set_dicts(q):
        Question.dicts = q.copy()
        random.shuffle(Question.dicts)
        Question._dicts = Question.dicts.copy()

    @staticmethod
    def get_dicts():
        return Question.dicts
    
    @staticmethod
    def get(lang):
        question = Question.dicts.pop()
        st = set()
        st.add(question)
        while(len(st) < 4):
            st.add(random.choice(Question._dicts))
            if len(Question._dicts) < 4:
                st.add(random.choice(Dictionary.objects.all()))
        variants = list(st)
        random.shuffle(variants)
        json = {}
        
        def ques_func(lang_from, lang_to, title):
            return dict(
                question = dict(
                    theme = question.theme.name,
                    id = question.pk,
                    ques = question.__getattribute__(lang_from),
                    title = title
                ),
                variant = dict(
                    a = variants[0].__getattribute__(lang_to),
                    b = variants[1].__getattribute__(lang_to),
                    c = variants[2].__getattribute__(lang_to),
                    d = variants[3].__getattribute__(lang_to)
                )
            )
        
        if lang == 'en':
            return ques_func('en', 'uz', "o'zbek tilida qanday?")
        if lang == 'uz':
            return ques_func('uz', 'en', "translate to Uzbek")
    
    @staticmethod
    def check(id, lang, question, answer):
        d = Dictionary.objects.get(pk=id)
        r = False
        if lang == 'en':
            r = d.en == question and d.uz == answer
        if lang == 'uz':
            r = d.uz == question and d.en == answer
        if r:
            d.correct = d.correct + 1
        else:
            d.incorrect = d.incorrect + 1
        d.save()
        print(d, r)
        return r

    @staticmethod
    def get_correct(id, lang):
        d = Dictionary.objects.get(pk=id)
        if lang == 'en':
            return d.uz
        if lang == 'uz':
            return d.en
        return None

    @staticmethod
    def get_total():
        return len(Question.dicts)