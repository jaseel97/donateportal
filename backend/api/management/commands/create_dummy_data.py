from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.utils import timezone
from datetime import datetime, timedelta
from faker import Faker
import random
import decimal
import json

from api.models import Item, Organization, Samaritan

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Generate dummy data for development environment'

    def generate_windsor_essex_point(self):
        latitude = random.uniform(41.9, 42.4)
        longitude = random.uniform(-82.9, -82.5)
        return Point(longitude, latitude)

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy data...')
        
        # Store credentials for separate file
        credentials = []
        created_users = [] 
        all_data = []

        # Create Users
        users_data = []
        for i in range(10):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = fake.user_name()
            email = fake.email()
            plain_password = f"test123_{i}"
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=plain_password,
                first_name=first_name,
                last_name=last_name,
                is_admin=(i == 0)
            )
            created_users.append(user)

            credentials.append({
                'username': username,
                'email': email,
                'password': plain_password,
                'is_admin': i == 0
            })

            users_data.append({
                'model': 'api.user',
                'pk': user.id,
                'fields': {
                    'username': user.username,
                    'email': user.email,
                    'password': user.password,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_admin': user.is_admin,
                    'is_active': True,
                }
            })

        # Create Organizations
        orgs_data = []
        for i in range(3):
            location = self.generate_windsor_essex_point()
            org = Organization.objects.create(
                user=created_users[i],  
                name=fake.company(),
                location=location
            )
            orgs_data.append({
                'model': 'api.organization',
                'pk': org.id,
                'fields': {
                    'user': org.user.id,
                    'name': org.name,
                    'location': f'POINT({location.x} {location.y})'
                }
            })

        # Create Samaritans
        samaritans_data = []
        for i in range(3, 6): 
            samaritan = Samaritan.objects.create(
                user=created_users[i], 
                rating=decimal.Decimal(random.uniform(3.5, 5)).quantize(decimal.Decimal('0.01'))
            )
            samaritans_data.append({
                'model': 'api.samaritan',
                'pk': samaritan.id,
                'fields': {
                    'user': samaritan.user.id,
                    'rating': str(samaritan.rating)
                }
            })

        # Create Items
        items_data = []
        category_descriptions = {
            0: lambda: f"{fake.word()} {random.choice(['Pasta', 'Rice', 'Canned Food', 'Vegetables', 'Fruits'])}",
            1: lambda: f"{fake.color_name()} {random.choice(['Shirt', 'Pants', 'Jacket', 'Sweater'])}",
            2: lambda: f"{fake.catch_phrase()} - {fake.word()} Book",
            3: lambda: f"{fake.color_name()} {random.choice(['Chair', 'Table', 'Desk', 'Shelf'])}",
            4: lambda: f"{fake.word()} {random.choice(['Utensils', 'Plates', 'Cups', 'Cutlery'])}",
            5: lambda: f"{fake.company()} {random.choice(['Phone', 'Laptop', 'Tablet', 'Charger'])}",
            6: lambda: f"{fake.color_name()} {random.choice(['Doll', 'Car', 'Board Game', 'Puzzle'])}",
            7: lambda: f"{fake.word()} {random.choice(['Bandages', 'First Aid Kit', 'Supplies'])}",
            8: lambda: f"{fake.word()} {random.choice(['Food Bowl', 'Toy', 'Bed', 'Leash'])}",
            9: lambda: fake.catch_phrase()
        }

        for i in range(20):
            posted_by = random.choice(created_users)
            reserved_by = random.choice([None] + list(filter(lambda x: x != posted_by, created_users)))
            
            category = random.randint(0, 9)
            description = category_descriptions[category]()
            
            best_before = fake.date_between(start_date='now', end_date='+2y') if category == 0 else None
            reserved_till = fake.future_datetime(end_date='+30d') if reserved_by else None
            pickup_time = fake.future_datetime(end_date='+15d') if random.choice([True, False]) else None
            
            pickup_location = self.generate_windsor_essex_point()
            
            item = Item.objects.create(
                category=category,
                description=description,
                weight=decimal.Decimal(random.uniform(0.1, 100)).quantize(decimal.Decimal('0.01')),
                weight_unit=random.choice(['kg', 'lbs']),
                volume=decimal.Decimal(random.uniform(0.1, 50)).quantize(decimal.Decimal('0.01')),
                volume_unit=random.choice(['m³', 'ft³']),
                best_before=best_before,
                pickup_location=pickup_location,
                reserved_till=reserved_till,
                posted_by=posted_by,
                reserved_by=reserved_by,
                pickup_time=pickup_time,
                is_picked_up=bool(pickup_time)
            )
            items_data.append({
                'model': 'api.item',
                'pk': item.id,
                'fields': {
                    'category': item.category,
                    'description': item.description,
                    'weight': str(item.weight),
                    'weight_unit': item.weight_unit,
                    'volume': str(item.volume),
                    'volume_unit': item.volume_unit,
                    'best_before': item.best_before.isoformat() if item.best_before else None,
                    'pickup_location': f'POINT({pickup_location.x} {pickup_location.y})',
                    'reserved_till': item.reserved_till.isoformat() if item.reserved_till else None,
                    'posted_by': item.posted_by.id,
                    'reserved_by': item.reserved_by.id if item.reserved_by else None,
                    'pickup_time': item.pickup_time.isoformat() if item.pickup_time else None,
                    'is_picked_up': item.is_picked_up
                }
            })

        # Combine all data
        all_data = users_data + orgs_data + samaritans_data + items_data

        # Write credentials to a separate file
        with open('user_credentials.txt', 'w') as f:
            f.write("User Credentials for Login:\n")
            f.write("="*50 + "\n\n")
            for cred in credentials:
                role = 'ADMIN USER' if cred['is_admin'] else 'REGULAR USER'
                f.write(f"{role}\n")
                f.write(f"Username: {cred['username']}\n")
                f.write(f"Email: {cred['email']}\n")
                f.write(f"Password: {cred['password']}\n")
                f.write("-"*30 + "\n\n")

        # Write fixture data to json
        with open('dummy_data.json', 'w') as f:
            json.dump(all_data, f, indent=2)

        self.stdout.write(self.style.SUCCESS('Successfully created dummy data'))
        self.stdout.write(self.style.SUCCESS('User credentials saved to user_credentials.txt'))