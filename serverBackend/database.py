from peewee import *
import datetime, time, os, sys

# Get the absolute path to the database file using the absolute path to this Python file's parent directory
database_path = f'{os.path.dirname(os.path.abspath(__file__))}/game_data.db'
db = SqliteDatabase(database_path)
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

def auto_reset():
	max_retries = 5
	retry_count = 0
	today = datetime.datetime.today()
	while retry_count < max_retries:
		try:
			if today.weekday() == 4: # Monday
				WeeklyScores.delete().execute()
				
			DailyScores.delete().execute()
			break
			
		except OperationalError as oe:
			print(f"Database is locked. Retry attempt {retry_count + 1} of {max_retries}")
			retry_count += 1
			time.sleep(1)
			
		except Exception as e:
			print("Error occurred while trying to reset tables:")
			print(e)
			sys.exit(1)
	else:
		print("Failed to reset scores after multiple attempts.")
		
# Reset the tables only when this is the main running file, but don't reset the tables when this file is imported instead
if __name__ == "__main__":
	auto_reset()
