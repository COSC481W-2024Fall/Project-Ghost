from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from peewee import *

app = Flask(__name__)
CORS(app)

db = SqliteDatabase('game_data.db')
class Scores(Model):
	user_name = CharField()
	score = IntegerField()
	timestamp = IntegerField()
	
	class Meta:
		database = db
		abstract = True
		
class DailyScores(Scores):
	pass
	
class WeeklyScores(Scores):
	pass
	
class AllTime(Scores):
	pass
	
db.connect()
db.create_tables([DailyScores, WeeklyScores, AllTime]) # only creates tables when they don't exist

# Map the string name of the table to the table. This will be used in the HTTP requests
tables = {
	"daily": DailyScores,
	"weekly": WeeklyScores,
	"allTime": AllTime,
}

# ex:	/project_ghost/scores/get?category=daily			?:	Not limited, get all scores
# ex:	/project_ghost/scores/get?category=weekly&max=10	?:	Limited, just get 10 scores
@app.route('/project_ghost/scores/get', methods=['GET'])
@cross_origin()
def get_scores():
	# Argument for the function. This will be the category to grab from
	category = request.args.get('category', type=str)
	max_count = request.args.get('max', default=None, type=int)
	
	# Return an error if no category has been provided
	if not category:
		return jsonify({"error": "category is required"}), 400
		
	try:
		# Determine the table query from
		table = tables[category]
		
		# Query the table for the scores
		scores_query = table.select().order_by(table.score.desc())
		
		# Apply the maximum count limit, if provided
		if not max_count is None:
			scores_query = scores_query.limit(max_count)
			
		scores_list = []
		for score in scores_query:
			scores_list.append({
				"category": category,
				"user_name": score.user_name,
				"score": score.score,
				"timestamp": score.timestamp,
				"id": score.id,
			})
			
		return jsonify(scores_list), 200
		
	except KeyError as ke:
		return jsonify({"error": f"{category} is not a valid table"})
		
	except Exception as e:
		return jsonify({"error": str(e)}), 500
		
# ex:	/project_ghost/scores/add?category=weekly
@app.route('/project_ghost/scores/add', methods=['POST'])
@cross_origin()
def add_score():
	# Get the data from the POST request (must be JSON)
	data = request.get_json()
	
	if not data:
		return jsonify({"error": "Missing data. Please provide JSON data"}), 400
		
	# Ensure that all the data is present
	fields = ["user_name", "score", "timestamp", "categories"]
	missing_fields = []
	for field in fields:
		if not field in data:
			missing_fields.append(field)
			
	# If there are any missing fields, return an error that states what fields are missing
	if len(missing_fields) > 0:
		return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
		
	# Insert the new score into the databases
	try:
		for category in data['categories']:
			# Determine the table to add to
			table = tables[category]
			
			# Add to that table
			entry = table.create(
				user_name=data["user_name"],
				score=data["score"],
				timestamp=data["timestamp"],
			)
			
		# Return a success message containing the data that was added
		return jsonify({
			"message": f"Score added to successfully",
			"categories": data['categories'],
			"user_name": entry.user_name,
			"score": entry.score,
			"timestamp": entry.timestamp,
			"id": entry.id,
		})
		
	except Exception as e:
		return jsonify({"error": str(e)}), 500
		
# ex:	/project_ghost/scores/remove
@app.route('/project_ghost/scores/delete', methods=['DELETE'])
@cross_origin()
def remove_score():
	category = request.args.get('category', type=str)
	score_id = request.args.get('score_id', type=int)
	
	if (not category) or (not score_id):
		return jsonify({"error": "category and id are required"}), 400
		
	try:
		table = tables[category]
		score = table.get_by_id(score_id)
		score.delete_instance()
		return jsonify({"message": "Score removed successfully"}), 200
		
	except table.DoesNotExist:
		return jsonify({"error": "Score not found"}), 404
		
	except Exception as e:
		return jsonify({"error": str(e)}), 500
	
app.run(host='0.0.0.0', port=5000)
