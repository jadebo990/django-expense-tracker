from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r"accounts", views.AccountViewSet)
router.register(r"categories", views.CategoryViewSet)
router.register(r"subcategories", views.SubcategoryViewSet)
router.register(r"transactions", views.TransactionViewSet, basename="transaction")

urlpatterns = [
    path('', views.home, name='home'),
    path('api/', include(router.urls)),
    path('transactions/', views.TransactionTemplateView.as_view(), name='transactions'),
]
