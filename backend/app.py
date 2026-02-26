import os
from dotenv import load_dotenv
import json
import sys
import psycopg2
from flask import Flask, request, jsonify
import time

app = Flask(__name__)

def main():
    try:
        app.run(host='0.0.0.0', port=3000)
    except Exception as e:
        print(f"Application encountered an error: {e}")
        time.sleep(5)
        main()

if __name__ == "__main__":
    main()