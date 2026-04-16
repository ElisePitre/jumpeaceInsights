from flask import Flask
from flask_cors import CORS

app = Flask(__name__,
    static_folder='./public',
    template_folder="./static")

CORS(app, resources={r"/api/*": {"origins": "*"}})

from templates.hello.views import hello_blueprint
from templates.api.views import api_blueprint

app.register_blueprint(hello_blueprint)
app.register_blueprint(api_blueprint)