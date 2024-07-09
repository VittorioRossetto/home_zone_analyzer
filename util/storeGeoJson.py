import json
import os
from time import sleep
from dotenv import load_dotenv
import psycopg2

# Read the GeoJSON file
with open('PoI_complete.geojson', 'r') as file:
    geojson_data = json.load(file)

# Load environment variables from .env file
load_dotenv()

# Retrieve database connection details from environment variables
dbname = os.getenv('DB_NAME')
user = os.getenv('DB_USER')
password = os.getenv('DB_PASSWORD')
host = os.getenv('DB_HOST')
port = os.getenv('DB_PORT')

max_retries = 10
retries = 0

while retries < max_retries:
    try:
        conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        print("Connected to the database")
        break
    except psycopg2.OperationalError as e:
        retries += 1
        print(f"Failed to connect to database. Retrying in 5 seconds... ({retries}/{max_retries})")
        sleep(5)
else:
    print("Max retries reached. Could not connect to the database.")
    exit(1)
cur = conn.cursor()

# Create a table (if not exists)
cur.execute("""
    CREATE TABLE IF NOT EXISTS poi_data (
        nome_area VARCHAR(255),
        tipologia_punto_di_interesse VARCHAR(255),
        nome_punto_di_interesse VARCHAR(255),
        five_min BOOLEAN,
        ten_min BOOLEAN,
        fifteen_min BOOLEAN,
        latitude FLOAT,
        longitude FLOAT
    )
""")

# Insert data into the database
for feature in geojson_data['features']:
    properties = feature['properties']
    coordinates = feature['geometry']['coordinates']
    cur.execute("""
        INSERT INTO poi_data (nome_area, tipologia_punto_di_interesse, nome_punto_di_interesse, five_min, ten_min, fifteen_min, latitude, longitude)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        properties['nome_area'],
        properties['tipologia_punto_di_interesse'],
        properties['nome_punto_di_interesse'],
        properties['5_min'] == 'Sì',
        properties['10_min'] == 'Sì',
        properties['15_min'] == 'Sì',
        coordinates[1],  # Latitude
        coordinates[0]   # Longitude
    ))
    print(f"Inserted {properties['nome_punto_di_interesse']}")

# Commit changes and close connection
conn.commit()
cur.close()
conn.close()