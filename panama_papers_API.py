from flask import Flask, request
from flask_restful import Resource, Api
from sqlalchemy import create_engine
from json import dumps
from flask import jsonify
from datetime import datetime
from werkzeug.routing import BaseConverter, ValidationError 
import psycopg2
import os

SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://panama_papers@localhost/panama_papers"
e = create_engine(SQLALCHEMY_DATABASE_URI)

app = Flask(__name__)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

@app.route('/')
def index():
	return 'Hello World!'

# ---------------------------
# GET Edges_All_Countries	
# ---------------------------
# use this URI for calling the function from jQuery
# http://127.0.0.1:8080/edges_all_countries/2013-12-01/
@app.route('/edges_all_countries/<selected_date>/', methods=['GET'])
def get_edges_all_countries(selected_date):
	conn = e.connect()
	query_string = "SELECT * FROM edges_all_countries( '" + selected_date + "', 1000000 );"
	print "\n%s" % query_string
	query = conn.execute(query_string)
	
	results = []
	for r in query.cursor.fetchall():
		record = { "node1_name": r[0],
			"node2_name": r[1],
			"rel_type": r[2],
			"date": str(r[3]),
			"node_id1": str(r[4]),
			"node_type_1": r[5],
			"country_code_1": r[6],
			"country_1": r[7],
			"x1": r[8],
			"y1": r[9],
			"node_id2": str(r[10]),
			"node_type_2": r[11],
			"country_code_2": r[12],
			"country_2": r[13],
			"x2": r[14],
			"y2": r[15],
			"includes_entity": str(r[16]),
			"includes_officer": str(r[17]),
			"includes_intermediary": str(r[18]),
			"weight": str(r[19])
		}
		results.append(record)
		
	print "results count: %d\n" % len(results)
	return results

# use this URI for viewing the results in a browser
# http://127.0.0.1:8080/edges_all_countries_json/2013-12-01/
@app.route('/edges_all_countries_json/<selected_date>/', methods=['GET'])
def get_edges_all_countries_json(selected_date):
	return jsonify(get_edges_all_countries(selected_date))

	
# ---------------------------
# GET Edges_By_Country
# ---------------------------
# use this URI for calling the function from jQuery
# http://127.0.0.1:8080/edges_by_country/2013-12-01/countrycode/USA/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
@app.route('/edges_by_country/<selected_date>/countrycode/<country_code>/incl_officers/<incl_officers>/incl_intermediaries/<incl_intermediaries>/maxrecursions/<max_recursions>/', 
	methods=['GET'])	
def get_edges_by_country(selected_date, country_code, incl_officers, incl_intermediaries, max_recursions):	
	conn = e.connect()
	query_string = "SELECT * FROM edges_by_country( '" + selected_date + "', '" + country_code + "', " + incl_officers + ", " + incl_intermediaries + ", " + max_recursions + " );"
	print "\n%s" % query_string
	query = conn.execute(query_string)
	
	results = []
	for r in query.cursor.fetchall():
		record = { "node1_name": r[0],
			"node2_name": r[1],
			"rel_type": r[2],
			"date": str(r[3]),
			"node_id1": str(r[4]),
			"node_type_1": r[5],
			"country_code_1": r[6],
			"node_id2": str(r[7]),
			"node_type_2": r[8],
			"country_code_2": r[9],
			"includes_entity": str(r[10]),
			"includes_officer": str(r[11]),
			"includes_intermediary": str(r[12]),
			"weight": str(r[13])
		}
		results.append(record)
		
	print "results count: %d\n" % len(results)
	return results

# use this URI for viewing the results in a browser
# http://127.0.0.1:8080/edges_by_country_json/2013-12-01/countrycode/USA/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
@app.route('/edges_by_country_json/<selected_date>/countrycode/<country_code>/incl_officers/<incl_officers>/incl_intermediaries/<incl_intermediaries>/maxrecursions/<max_recursions>/', 
	methods=['GET'])	
def get_edges_by_country_json(selected_date, country_code, incl_officers, incl_intermediaries, max_recursions):	
	return jsonify(get_edges_by_country(selected_date, country_code, incl_officers, incl_intermediaries, max_recursions))
	
	
# ---------------------------
# GET Edges_By_Entity
# ---------------------------
# use this URI for calling the function from jQuery
# http://127.0.0.1:8080/edges_by_entity/2013-12-01/nodeid/10019177/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
@app.route('/edges_by_entity/<selected_date>/nodeid/<node_id>/incl_officers/<incl_officers>/incl_intermediaries/<incl_intermediaries>/maxrecursions/<max_recursions>/', 
	methods=['GET'])
def get_edges_by_entity(selected_date, node_id, incl_officers, incl_intermediaries, max_recursions):	
	conn = e.connect()
	query_string = "SELECT * FROM edges_by_entity( '" + selected_date + "', " + node_id + ", " + incl_officers + ", " + incl_intermediaries + ", " + max_recursions + " );"
	print "\n%s" % query_string
	query = conn.execute(query_string)
	
	results = []
	for r in query.cursor.fetchall():
		record = { "node1_name": r[0],
			"node2_name": r[1],
			"rel_type": r[2],
			"date": str(r[3]),
			"node_id1": str(r[4]),
			"node_type_1": r[5],
			"country_code_1": r[6],
			"node_id2": str(r[7]),
			"node_type_2": r[8],
			"country_code_2": r[9],
			"includes_entity": str(r[10]),
			"includes_officer": str(r[11]),
			"includes_intermediary": str(r[12]),
			"weight": str(r[13])
		}
		results.append(record)
		
	print "results count: %d\n" % len(results)
	return results

# use this URI for viewing the results in a browser
# http://127.0.0.1:8080/edges_by_entity_json/2013-12-01/nodeid/10019177/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
@app.route('/edges_by_entity_json/<selected_date>/nodeid/<node_id>/incl_officers/<incl_officers>/incl_intermediaries/<incl_intermediaries>/maxrecursions/<max_recursions>/', 
	methods=['GET'])
def get_edges_by_entity_json(selected_date, node_id, incl_officers, incl_intermediaries, max_recursions):
	return jsonify(get_edges_by_entity(selected_date, node_id, incl_officers, incl_intermediaries, max_recursions))


# ---------------------------
# GET Edges_By_NonEntity
# ---------------------------
# use this URI for calling the function from jQuery
# http://127.0.0.1:8080/edges_by_entity/2013-12-01/nodeid/12050406/incl_entities/true/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
@app.route('/edges_by_entity/<selected_date>/nodeid/<node_id>/incl_entities/<incl_entities>/incl_officers/<incl_officers>/incl_intermediaries/<incl_intermediaries>/maxrecursions/<max_recursions>/', 
	methods=['GET'])
def get_edges_by_nonentity(selected_date, node_id, incl_entities, incl_officers, incl_intermediaries, max_recursions):	
	conn = e.connect()
	query_string = "SELECT * FROM edges_by_nonentity( '" + selected_date + "', " + node_id + ", " + incl_entities + ", " + incl_officers + ", " + incl_intermediaries + ", " + max_recursions + " );"
	print "\n%s" % query_string
	query = conn.execute(query_string)
	
	results = []
	for r in query.cursor.fetchall():
		record = { "node1_name": r[0],
			"node2_name": r[1],
			"rel_type": r[2],
			"date": str(r[3]),
			"node_id1": str(r[4]),
			"node_type_1": r[5],
			"country_code_1": r[6],
			"node_id2": str(r[7]),
			"node_type_2": r[8],
			"country_code_2": r[9],
			"includes_entity": str(r[10]),
			"includes_officer": str(r[11]),
			"includes_intermediary": str(r[12]),
			"weight": str(r[13])
		}
		results.append(record)
		
	print "results count: %d\n" % len(results)
	return results

# use this URI for viewing the results in a browser
# http://127.0.0.1:8080/edges_by_entity_json/2013-12-01/nodeid/12050406/incl_entities/true/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
@app.route('/edges_by_entity_json/<selected_date>/nodeid/<node_id>/incl_entities/<incl_entities>/incl_officers/<incl_officers>/incl_intermediaries/<incl_intermediaries>/maxrecursions/<max_recursions>/', 
	methods=['GET'])
def get_edges_by_nonentity_json(selected_date, node_id, incl_entities, incl_officers, incl_intermediaries, max_recursions):	
	return jsonify(get_edges_by_nonentity(selected_date, node_id, incl_entities, incl_officers, incl_intermediaries, max_recursions))
	

# ---------------------------
# GET Connection_Counts
# ---------------------------
# use this URI for calling the function from jQuery
# http://127.0.0.1:8080/connection_counts/
@app.route('/connection_counts/', methods=['GET'])
def get_connection_counts():	
	conn = e.connect()
	query_string = "SELECT * FROM connection_counts ORDER BY date;"
	print "\n%s" % query_string
	query = conn.execute(query_string)
	
	results = []
	for r in query.cursor.fetchall():
		record = { "date": str(r[0]),
			"includes_entity": str(r[1]), 
			"includes_officer": str(r[2]),
			"includes_intermediary": str(r[3]),
			"total": str(r[4])
		}
		results.append(record)
		
	print "results count: %d\n" % len(results)
	return results
	
# use this URI for viewing the results in a browser
# http://127.0.0.1:8080/connection_counts_json/
@app.route('/connection_counts_json/', methods=['GET'])
def get_connection_counts_json():	
	return jsonify(get_connection_counts())
	
# ---------------------------
# GET Conection_Counts_By_Country
# ---------------------------
# use this URI for calling the function from jQuery
# http://127.0.0.1:8080/connection_counts_by_country/2016-12-01
@app.route('/connection_counts_by_country/<selected_date>/', methods=['GET'])
def get_connection_counts_by_country(selected_date):	
	conn = e.connect()
	query_string = ("SELECT "
					"    concat_ws( ' ', c.country::text, cc.country_code::text ) AS country, "
					"    cc.country_code, "
					"    cc.includes_entity, "
					"    cc.includes_officer, "
					"    cc.includes_intermediary, "
					"    cc.total "
					"FROM "
					"    connection_count_by_country cc "
					"    JOIN country_geos c ON c.alpha_3_code = cc.country_code " 
					"WHERE "
					"    cc.date= '" + selected_date + "' "
					"AND cc.total > 0 "
					"ORDER BY "
					"    cc.total DESC; ")
	print "\n%s" % query_string
	query = conn.execute(query_string)
	
	results = []
	for r in query.cursor.fetchall():
		record = { 
			"country": r[0],
			"country_code": r[1],
			"includes_entity": str(r[2]),
			"includes_officer": str(r[3]),
			"includes_intermediary": str(r[4]),
			"total": str(r[5])
		}
		results.append(record)
		
	print "results count: %d\n" % len(results)
	return results
	
# use this URI for viewing the results in a browser
# http://127.0.0.1:8080/connection_counts_by_country_json/2016-12-01
@app.route('/connection_counts_by_country_json/<selected_date>/', methods=['GET'])
def get_connection_counts_by_country_json(selected_date):	
	return jsonify(get_connection_counts_by_country(selected_date))
	

# ---------------------------
if __name__=='__main__':
	test_con = e.connect()
	test_query = "SELECT * FROM country_geos LIMIT 1;"
	test_result = test_con.execute(test_query)
	print test_result.cursor.fetchall()
	port = int(os.environ.get("PORT", 8080))
	app.run(host='0.0.0.0', port=port, debug=True)
	