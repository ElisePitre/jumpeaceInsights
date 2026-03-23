# This file should contain all API functions for the main file to communicate with ML

# This function should process the start and end times to select/merge models
def selectModel(startTime, endTime):
    return "model1"

# This function should submit the query with parameters through the selected model
def query(model, queryWord, destinationWord):
    return {"word": "Data", "value": 0.67}