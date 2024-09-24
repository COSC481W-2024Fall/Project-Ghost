from flask import Flask, jsonify, request
from flask_cors import CORS
from peewee import *

db = SqliteDatabase('game_data.db')
class HelloWorld(Model):
	message = CharField()
	
	class Meta:
		database = db
		
db.connect()
db.create_tables([HelloWorld])
if not HelloWorld.select().exists():
	HelloWorld.create(message="Hello, World!")

app = Flask(__name__)
CORS(app)

@app.route('/project_ghost/hello_world', methods=['GET'])
def get_data():
	hello_message = HelloWorld.get_or_none()
	return {"message": hello_message.message}

app.run(host='0.0.0.0', port=5000)
