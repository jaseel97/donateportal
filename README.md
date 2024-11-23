# DonatePortal

## Starting the Application

1. Start docker desktop
2. In the repo, create a dev.env file based on the sample.env file at the project root directory

To start the application normally:
```bash
docker compose up
```

To rebuild containers when changes aren't reflecting:
```bash
docker compose up --build
```

## Loading Dummy Data
Do this only if you haven't done this previously!!!

Once all containers are running:

1. Open Docker Desktop
2. Navigate to the **`containers`** page
3. Select **`django-app-1`**
4. Click on the **`exec`** tab
5. Run the following command:
```bash
   python manage.py loaddata dummy_data.json
```

If you want to CLEAR the database of ALL PREVIOUS DATA,
Run the following command in the **`exec`** tab:
```bash
   python manage.py flush
```

To take a snapshot of the current database values to share with others,
Run the following command in the **`exec`** tab:
```bash
   python manage.py dumpdata api --indent 4 > dummy_data.json
```