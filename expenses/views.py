from django.shortcuts import render
from rest_framework import viewsets
from .models import Account, Category, Subcategory, Transaction
from .serializers import AccountSerializer, CategorySerializer, SubcategorySerializer, TransactionSerializer
from django.views.generic import TemplateView

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
    queryset = Transaction.objects.all().order_by("-date")
    serializer_class = TransactionSerializer

def home(request):
    return render(request, "home.html")

class TransactionTemplateView(TemplateView):
    template_name = 'transactions.html'
    