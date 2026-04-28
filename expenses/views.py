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
        account_id = self.request.query_params.get('account')
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        return queryset
    

def home(request):
    return render(request, "home.html")

class TransactionTemplateView(TemplateView):
    template_name = 'transactions.html'
    