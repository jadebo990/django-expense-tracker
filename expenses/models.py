from django.db import models

class Account(models.Model):
    class AccountType(models.TextChoices):
        CASH = "cash", "Cash"
        CARD = "card", "Card"
        BANK_ACCOUNT = "bank_account", "Bank Account"
        SAVINGS = "saving", "Savings"
        LOAN = "loan", "Loan"
        BONUS = "bonus", "Bonus"

    @property
    def balance(self):
        transactions = self.account_transactions.all()
        total_expenses = 0
        total_income = 0
        for t in transactions:
            if t.type == 'expense':
                total_expenses += t.amount
            elif t.type == 'income':
                total_income += t.amount
        balance = total_income - total_expenses
        return balance

    name = models.CharField(max_length=50)
    type = models.CharField(choices=AccountType)

    def __str__(self):
        return f"{self.name}"

class Category(models.Model):
    # verbose_name_plural definisce il nome plurale dell'oggetto (di default aggiunge una s e basta alla fine del nome)
    class Meta:
        verbose_name_plural = "Categories"

    class CategoryType(models.TextChoices):
        EXPENSE = "expense", "Expense"
        INCOME = "income", "Income"

    name = models.CharField(max_length=50)
    type = models.CharField(choices=CategoryType)

    def __str__(self):
        return f"{self.name}"

class Subcategory(models.Model):
    class Meta:
        verbose_name_plural = "Subcategories"

    name = models.CharField(max_length=50)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name}"


class Transaction(models.Model):

    class TransactionType(models.TextChoices):
        EXPENSE = "expense", "Expense"
        INCOME = "income", "Income"
        TRANSFER = "transfer", "Transfer"

    class TransactionFrequency(models.TextChoices):
        ONE_TIME = "one_time", "One Time"
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    type = models.CharField(choices=TransactionType)
    date = models.DateField()
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='account_transactions')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.ForeignKey(
        Subcategory, 
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(null=True, blank=True)
    frequency = models.CharField(choices = TransactionFrequency, default = TransactionFrequency.ONE_TIME)
    label = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.amount} ({self.date})"

