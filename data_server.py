from flask import Flask, request
from flask_restful import Resource, Api
from sqlalchemy import create_engine
from json import dumps
import psycopg2
import os

SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://panama_papers@localhost/panama_papers"
e = create_engine(SQLALCHEMY_DATABASE_URI)

app = Flask(__name__)
api = Api(app)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

class Addresses(Resource):

  def get(self):
    # connect to the db
    conn = e.connect()
    long_query_string = ("WITH involved_countries AS ("
                         "  SELECT DISTINCT country_codes"
                         "    FROM addresses"
                         "    WHERE country_codes IS NOT NULL"
                         "      AND country_codes != ''"
                         "      AND country_codes != 'CUW'"
                         "      AND country_codes != 'MAF'"
                         "      AND country_codes != 'SXM'"
                         "      AND country_codes != 'XXX'"
                         ")"
                         "SELECT t1.country_codes AS country_code,"
                         "       t2.country AS country_name,"
                         "       t2.longitude_average AS x,"
                         "       t2.latitude_average AS y"
                         "  FROM involved_countries t1"
                         "  LEFT JOIN country_geos t2"
                         "  ON (t2.alpha_3_code = t1.country_codes)"
                         "  ORDER BY 1;")
                         # The query above skipped the following "countries"
                         # because the country data set that I found does not
                         # contain them.
                         # 'CUW'  -- Curacao
                         # 'MAF'  -- Saint Martin (French part)
                         # 'SXM'  -- Sint Maarten (Dutch part)
                         # 'XXX'  -- unidentified
    query = conn.execute(long_query_string)
    results = []
    for r in query.cursor.fetchall():
	  record = { "country_code": r[0],
	             "country_name": r[1],
	             "x": str(r[2]),
	             "y": str(r[3]) }
	  results.append(record)
    return results

class Associations(Resource):

  # Get only the first 500 active ones for now for development.
  def get(self):
    # connect to the db
    conn = e.connect()
    long_query_string = ("WITH active_collection AS ("
                         "  SELECT start_country_code,"
                         "         end_country_code"
                         "    FROM officers_to_entities"
                         "    WHERE status = 'Active'"
                         ")"
                         "SELECT t1.start_country_code,"
                         "       t2.country AS start_country_name,"
                         "       t2.longitude_average AS start_x,"
                         "       t2.latitude_average AS start_y,"
                         "       t1.end_country_code,"
                         "       t3.country AS end_country_name,"
                         "       t3.longitude_average AS end_x,"
                         "       t3.latitude_average AS end_y"
                         "  FROM active_collection t1"
                         "  LEFT JOIN country_geos t2"
                         "  ON (t2.alpha_3_code = t1.start_country_code)"
                         "  LEFT JOIN country_geos t3"
                         "  ON (t3.alpha_3_code = t1.end_country_code)"
                         "  LIMIT 500;")
    query = conn.execute(long_query_string)
    results = []
    for r in query.cursor.fetchall():
	  record = { "start_country_code": r[0],
	             "start_country_name": r[1],
	             "start_x": str(r[2]),
	             "start_y": str(r[3]),
	             "end_country_code": r[4],
	             "end_country_name": r[5],
	             "end_x": str(r[6]),
	             "end_y": str(r[7]) }
	  results.append(record)
    return results


# These are the API endpoints.
api.add_resource(Addresses, "/addresses")
api.add_resource(Associations, "/associations")

# The following is just to check on the API app itself.
if __name__ == '__main__':
  test_con = e.connect()
  test_query = "SELECT * FROM country_geos LIMIT 1;"
  test_result = test_con.execute(test_query)
  print test_result.cursor.fetchall()
  port = int(os.environ.get("PORT", 8080))
  app.run(host='0.0.0.0', port=port, debug=True)
