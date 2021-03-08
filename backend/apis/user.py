from flask_restx import Namespace, Resource, fields
from flask import request, abort
import sqlite3 
import os 

import models
from utils.token import Token
from utils.function import unpack
from utils.function import check_address, check_mobile, check_name, check_password, check_email


api = Namespace(
    'user',
    description="User profile actions, including view history"
)


@api.route('/profile')
class Profile(Resource):
    def get(self):
        # get everything in the profile, including address
        # put the address in a list format
        pass 
    
    def put(self):
        # update all other profiles except address
        pass


@api.route('/address')
class Address(Resource):
    @api.response(200, "OK", models.address)        # either a dict, or a list of dict
    @api.response(403, "No authorization token / token invalid / token expired")
    @api.response(404, "Invalid address_id")
    @api.expect(models.token_header, models.address_parser)
    @api.doc(description="The registered user can retrieve all address sets, or a specific address set. The admin can look at all addresses.")
    def get(self):
        # first check the auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return "No authorization token", 403
        
        T = Token()
        identity = T.check(auth_header)
        if not identity:
            return "Wrong token", 403
        
        # check the address_id in query string, but this is optional
        address_id = None

        if request.args.get("address_id"):
            try:
                address_id = int(request.args.get("address_id"))
            except ValueError:
                return "Address_id should be integer", 400

            if address_id and address_id <= 0:
                return "Address_id should be positive", 400


        # sql
        sql = None 
        values = None 

        # if address_id exist
        if address_id:
            sql = """SELECT address_id, unit_number, street_number, street_name, suburb, state, postcode
                    FROM customer_address
                    WHERE user_id = ? and address_id = ?
            """

            values = (identity['user_id'],address_id)            

        else:
            # get all address for this user
            sql = """SELECT address_id, unit_number, street_number, street_name, suburb, state, postcode
                    FROM customer_address
                    WHERE user_id = ?
            """

            values = (identity['user_id'],)

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()
                cur.execute(sql, values)
                result = cur.fetchall()

                # check if no result
                if not result:
                    return "Invalid address_id", 404
                else:
                    return result, 200 

        except Exception as e:
            print(e)
            return "Internal server error", 500


    @api.response(200, "OK")
    @api.response(403, "No authorization token / token invalid / token expired")
    @api.response(400, "Malformed request / Wrong data format")
    @api.expect(models.token_header, models.address)
    @api.doc(description="With the auth token, the user can register another set of address.")
    def post(self):
        # first check the auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return "No authorization token", 403
        
        T = Token()
        identity = T.check(auth_header)
        if not identity:
            return "Wrong token", 403     

        # unpack the address
        data = request.json 
        if not data:
            return "Malformed request", 400
        
        success, result = unpack(
            data, 
            "unit_number", "street_number", "street_name", "suburb", "postcode", "state",
            required=True
        )

        if not success:
            return "Missing parameter in address", 400
        
        unitnumber, streetnumber, streetname, suburb, postcode, state = result

        # check all validity
        success, msg = check_address(
            unitnumber, streetnumber, streetname, suburb, postcode, state
        )

        if not success:
            return msg, 400 

        sql = """INSERT INTO customer_address(user_id, unit_number, street_number, street_name, suburb, state, postcode)
                VALUES(?, ?, ?, ?, ?, ?, ?)
        """

        values = (identity['user_id'], unitnumber, streetnumber, streetname, suburb, state, postcode)

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                cur.execute(sql, values)
                new_address_id = cur.lastrowid
                
                return {"address_id": new_address_id}, 200
        
        except Exception as e:
            print(e)
            return "Internal server error", 500
    

    @api.response(200, "OK")
    @api.response(403, "No authorization token / token invalid / token expired")
    @api.response(400, "Malformed request / Wrong data format")
    @api.response(401, "Invalid address_id")
    @api.expect(models.token_header, models.address_parser, models.address)
    @api.doc(description="With the auth token, the user can update his own address sets, one per time. Require the whole set of address data, including not updated one")
    def put(self):
        # first check the auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return "No authorization token", 403
        
        T = Token()
        identity = T.check(auth_header)
        if not identity:
            return "Wrong token", 403
        
        # require the address_id
        if not request.args.get("address_id"):
            return "Missing address_id", 400

        address_id = None

        try:
            address_id = int(request.args.get("address_id"))
        except ValueError:
            return "Address_id should be integer", 400

        if address_id and address_id <= 0:
            return "Address_id should be positive", 400

        # check if the token user has the address or not
        sql_1 = """
                SELECT * 
                FROM customer_address
                WHERE user_id = ? and address_id = ?
        """

        sql_1_param = (identity['user_id'], address_id)

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                result = cur.execute(sql_1, sql_1_param)

                if not result:
                    return "Invalid address_id", 401

        except Exception as e:
            print(e)
            return "Internal server error", 500 


        # nwo unpack the address
        data = request.json 
        if not data:
            return "Malformed request", 400
        
        success, result = unpack(
            data, 
            "unit_number", "street_number", "street_name", "suburb", "postcode", "state",
            required=True
        )

        if not success:
            return "Missing parameter in address", 400
        
        unitnumber, streetnumber, streetname, suburb, postcode, state = result

        # check all validity
        success, msg = check_address(
            unitnumber, streetnumber, streetname, suburb, postcode, state
        )

        if not success:
            return msg, 400 

        # sql
        sql_2 = """
            UPDATE customer_address
            SET unit_number = ?, 
                street_number = ?,
                street_name = ?,
                suburb = ?,
                postcode = ?,
                state = ?
            WHERE user_id = ? AND address_id = ?
        """

        sql_2_param = (
            unitnumber, 
            streetnumber, 
            streetname, 
            suburb, 
            postcode, 
            state,
            identity['user_id'], 
            address_id
        )

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                cur.execute(sql_2, sql_2_param)
                return "OK", 200
                
        except Exception as e:
            print(e)
            return "Internal server error", 500



@api.route('/viewhistory')
class ViewHistory(Resource):
    def get(self):
        pass 

    