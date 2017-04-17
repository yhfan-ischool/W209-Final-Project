from flask import Flask, request
from flask_restful import Resource, Api
from sqlalchemy import create_engine
from json import dumps
from datetime import datetime
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

'''
---------------------------
 GET Edges_All_Countries	
---------------------------
http://127.0.0.1:8080/edges_all_countries/2013-12-01/
'''
class EdgesAllCountries(Resource):
    def get(self, selected_date):
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

'''
---------------------------
 GET Edges_By_Country
---------------------------
http://127.0.0.1:8080/edges_by_country/2013-12-01/countrycode/USA/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
'''
class EdgesByCountry(Resource):
    def get(self, selected_date, country_code, incl_officers, incl_intermediaries, max_recursions):
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

'''
---------------------------
 GET Edges_By_Entity
---------------------------
http://127.0.0.1:8080/edges_by_entity/2013-12-01/nodeid/10019177/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
'''
class EdgesByEntity(Resource):
    def get(self, selected_date, node_id, incl_officers, incl_intermediaries, max_recursions):
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

'''
---------------------------
 GET Edges_By_NonEntity
---------------------------
http://127.0.0.1:8080/edges_by_entity/2013-12-01/nodeid/12050406/incl_entities/true/incl_officers/true/incl_intermediaries/true/maxrecursions/3/
'''
class EdgesByNonEntity(Resource):
    def get(self, selected_date, node_id, incl_entities, incl_officers, incl_intermediaries, max_recursions):
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

'''
---------------------------
 GET Connection_Counts
---------------------------
http://127.0.0.1:8080/connection_counts/
'''
class ConnectionCounts(Resource):
    def get(self):
        conn = e.connect()
        query_string = "SELECT * FROM connection_count ORDER BY date;"
        print "\n%s" % query_string
        query = conn.execute(query_string)

        results = []
        for r in query.cursor.fetchall():
            record = { "date": str(r[0]),
                "includes_entity": str(r[1]),
                "includes_officer": str(r[2]),
                "includes_intermediary": str(r[3]),
                "total": str(r[1] + r[2] + r[3])
            }
            results.append(record)

        print "results count: %d\n" % len(results)
        return results
	
'''
---------------------------
 GET Connection_Counts_By_Date
---------------------------
http://127.0.0.1:8080/connection_counts_by_date/2015-12-01/
'''
class ConnectionCountsByDate(Resource):
    def get(self, selected_date):
        conn = e.connect()
        query_string = "SELECT * FROM connection_count Where date = '" + selected_date + "';"
        print "\n%s" % query_string
        query = conn.execute(query_string)

        results = []
        for r in query.cursor.fetchall():
            record = { "date": str(r[0]),
                "includes_entity": str(r[1]),
                "includes_officer": str(r[2]),
                "includes_intermediary": str(r[3]),
                "total": str(r[1] + r[2] + r[3])
            }
            results.append(record)

        print "results count: %d\n" % len(results)
        return results
	
'''
---------------------------
GET Conection_Counts_By_Country
---------------------------
http://127.0.0.1:8080/connection_counts_by_country/2016-12-01
'''
class ConnectionCountsByCountry(Resource):
    def get(self, selected_date):
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

'''
---------------------------
 GET Conection_Counts_One_Country
---------------------------
http://127.0.0.1:8080/connection_counts_one_country/2016-12-01/countrycode/USA/
'''
class ConnectionCountsOneCountry(Resource):
    def get(self, selected_date, country_code):
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
                        "AND cc.country_code = '" + country_code + "' "
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


# API endpoints
api.add_resource(EdgesAllCountries, '/edges_all_countries/<string:selected_date>/')
api.add_resource(EdgesByCountry, '/edges_by_country/<string:selected_date>/countrycode/<string:country_code>/incl_officers/<string:incl_officers>/incl_intermediaries/<string:incl_intermediaries>/maxrecursions/<string:max_recursions>/')
api.add_resource(EdgesByEntity, '/edges_by_entity/<string:selected_date>/nodeid/<string:node_id>/incl_officers/<string:incl_officers>/incl_intermediaries/<string:incl_intermediaries>/maxrecursions/<string:max_recursions>/')
api.add_resource(EdgesByNonEntity, '/edges_by_entity/<string:selected_date>/nodeid/<string:node_id>/incl_entities/<string:incl_entities>/incl_officers/<string:incl_officers>/incl_intermediaries/<incl_intermediaries>/maxrecursions/<string:max_recursions>/')
api.add_resource(ConnectionCounts, '/connection_counts/')
api.add_resource(ConnectionCountsByDate, '/connection_counts_by_date/<string:selected_date>/')
api.add_resource(ConnectionCountsByCountry, '/connection_counts_by_country/<string:selected_date>/')
api.add_resource(ConnectionCountsOneCountry, '/connection_counts_one_country/<string:selected_date>/countrycode/<string:country_code>/')

# ---------------------------

if __name__ == '__main__':
    test_con = e.connect()
    test_query = "SELECT * FROM country_geos LIMIT 1;"
    test_result = test_con.execute(test_query)
    print test_result.cursor.fetchall()
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
