from rest_framework import serializers
from .models import Account, Category, Subcategory, Transaction

class AccountSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Account
        fields = ["id", "name", "type", "balance"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "type"]

class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ["id", "name", "category"]

class TransactionSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    subcategory = SubcategorySerializer(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)

    account_id = serializers.PrimaryKeyRelatedField(
        queryset = Account.objects.all(),
        source = 'account', # senza di questo Django non sa che account_id deve popolare il campo account del model
        write_only = True
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset = Category.objects.all(),
        source = 'category',
        write_only = True
    )
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset = Subcategory.objects.all(),
        source = 'subcategory',
        write_only = True,
        allow_null = True,
        required = False
    )

    class Meta:
        model = Transaction
        fields = ["id", "type", "type_display", "date", "account", "account_id", "category", "category_id", "subcategory", "subcategory_id", "amount", "description", "frequency", "frequency_display", "label"]

    


