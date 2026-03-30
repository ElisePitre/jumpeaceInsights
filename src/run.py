from templates import app

#Load this config object for development mode
app.config.from_object('configurations.DevelopmentConfig')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)