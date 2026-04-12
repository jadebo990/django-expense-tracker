from django.contrib import admin
from expenses.models import Account, Category, Subcategory, Transaction 

admin.site.register(Account)
admin.site.register(Category)
admin.site.register(Subcategory)
admin.site.register(Transaction)