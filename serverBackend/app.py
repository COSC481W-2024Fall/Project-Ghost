from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
from database import tables, LevelSeed # import our database handling code
import time, os

app = Flask(__name__, static_folder='../baseGame', template_folder='../baseGame')
CORS(app)

# Load our HTML file for the game. This right here is what does the serving and hosting
@app.route('/project_ghost')
def server_uri():
	return render_template('UI.html')
	
# ex:	/project_ghost/scores/get
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
		
# ex:	/project_ghost/scores/add
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
		
		# Get the daily seed, to ensure this score matches
		seed = LevelSeed.select().first().seed
		
		for category in data['categories']:
			# Ensure the seed (timestamp) matches the daily seed
			if data["timestamp"] != seed:
				raise Exception("Input seed does not match daily seed")

			# Ensure the user name is no longer than 3 characters
			if data["user_name"].length > 3:
				raise Exception("User name is too long. Must be 3 or less letters")

			# Ensure the score entered is an int
			if type(data["score"]) != int:
				raise Exception("Scores must be a positive integer")

			# Ensure the scores is not negative
			if data["score"] < 0:
				raise Exception("Scores must be a positive integer")

			# Ensure the score is no bigger than SQLite's max int size
			if data["score"] > ((2**63)-1):
				raise Exception("Scores cannot be larger than '(2^63)-1'")

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
		
def test_database():
	print("\nRunning database test...")
	print("Current tables:", tables)
	
	score = {
		"user_name": "database_test_user",
		"score": 42,
		"timestamp": int(time.time())
	}
	
	added_entries = {}
	
	print("Adding test data to tables...")
	try:
		for name, table in tables.items():
			entry = table.create(
				user_name=score["user_name"],
				score=score["score"],
				timestamp=score["timestamp"],
			)
			added_entries[name] = entry
			print("Successfully added test data to", name)
			
	except Exception as e:
		print("FATAL: Failed to add test data to database:")
		print(e)
		print("\nAborting Startup...")
		exit(1)
			
	if len(added_entries) != len(tables):
		print("FATAL: A table did not receive a score")
		print("Tables that did receive a score:", added_entries)
		print("\nAborting Startup...")
		exit(1)
		
	retrieved_entries = {}
	
	print("Retrieving test data from tables...")
	try:
		for name, table in tables.items():
			# get the score object here, and determine if the values are equal to the score dictionary's data
			scores_query = table.select().where(
				(table.user_name == score['user_name']) &
				(table.score == score['score']) &
				(table.timestamp == score['timestamp'])
			)
			retrieved_entries[name] = scores_query
			print("Successfully retrieved score from", name)
			print("Checking data integrity of retrieved data from", f"{name}...")
			error = False
			for score_entry in scores_query:
				if(score_entry.user_name != score['user_name']):
					print("user_name mismatch in", name)
					error = True
					
				if(score_entry.score != score['score']):
					print("score mismatch in", name)
					error = True
					
				if(score_entry.timestamp != score['timestamp']):
					print("timestamp mismatch in", name)
					error = True
					
			if error:
				print("FATAL: Data failed integrity check")
				print("\nAborting Startup...")
				exit(1)
				
			print("Data passed integrity check for", name)
			
	except Exception as e:
		print("FATAL: Failed to get test data from database:")
		print(e)
		print("\nAborting Startup...")
		exit(1)
		
	if len(retrieved_entries) != len(tables):
		print("FATAL: A table could not fetch a score")
		print("Tables that did fetch a score:", retrieved_entries)
		print("\nAborting Startup...")
		exit(1)
		
	print("Cleaning up testing data...")
	try:
		for name, entries in retrieved_entries.items():
			for entry in entries:
				entry.delete_instance()
				print("Successfully removed test data from", name)
			
	except Exception as e:
		print("FATAL: Failed to cleanup test data from database:")
		print(e)
		print("\nAborting Startup...")
		exit(1)
		
	print("Startup tests were successful!\n")

test_database()
app.run(host='0.0.0.0', port=5000)
