from django.shortcuts import render
from rest_framework import viewsets
from .models import Account, Category, Subcategory, Transaction
from .serializers import AccountSerializer, CategorySerializer, SubcategorySerializer, TransactionSerializer
from django.views.generic import TemplateView
from rest_framework.permissions import AllowAny

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SubcategoryViewSet(viewsets.ModelViewSet):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Transaction.objects.all().order_by("-date")
        fields = ['type', 'date', 'account', 'category', 'subcategory', 'amount', 'frequency', 'label']
        params = {}
        for key in fields:
            value = self.request.query_params.get(key)
            if value:
                params[key] = value

        if 'type' in params:
            queryset = queryset.filter(type=params['type'])
        if 'date' in params:
            queryset = queryset.filter(date=params['date'])
        if 'account' in params:
            queryset = queryset.filter(account_id=params['account'])
        if 'category' in params:
            queryset = queryset.filter(category_id=params['category'])
        if 'subcategory' in params:
            queryset = queryset.filter(subcategory_id=params['subcategory'])
        if 'amount' in params:
            queryset = queryset.filter(amount=params['amount'])
        if 'frequency' in params:
            queryset = queryset.filter(frequency=params['frequency'])
        if 'label' in params:
            queryset = queryset.filter(label=params['label'])
            
        return queryset
    

def home(request):
    return render(request, "home.html")

class TransactionTemplateView(TemplateView):
    template_name = 'transactions.html'
    