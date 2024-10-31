from django.http import JsonResponse

def index(request):
    return JsonResponse({'msg': 'API is running'}, status=200)