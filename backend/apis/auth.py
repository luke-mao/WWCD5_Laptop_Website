from flask_restx import Namespace, Resource, fields
from flask import request, abort
from db import DB 
import models
from utils.token import Token
from utils.function import unpack
from utils.function import check_address, check_mobile, check_name, check_password, check_email
import sqlite3 



api = Namespace(
    'auth',
    description="Authorization actions, including login and signup"
)


@api.route('/login')
class Login(Resource):
    @api.response(200, "Success", models.token)
    @api.response(400, "Missing email / password")
    @api.response(403, "Invalid email / password")
    @api.expect(models.login, validate=True)
    @api.doc(description="Both admin and user login through this endpoint. Enter both email and password. Receive a token if success")
    def post(self):
        if not request.json:
            return "Malformed request", 400

        data = request.json 

        if (not "password" in data) or (not "email" in data):
            return "Missing email / password", 400
        
        email, password = data['email'], data['password']

        # check the database
        try:
            db = DB()

            sql = """SELECT user.user_id, user.role, user.password
                    FROM user 
                    WHERE email = ?
                """

            parameter = (email,)

            result = db.execute(sql, parameter)

            if not result:
                abort(403, "Invalid email / password")

            result = result[0]

            if result['password'] != password:
                abort(403, "Invalid email / password")

            # generate token
            T = Token()
            token = T.generate(id=result["user_id"], role=result["role"])

            return {"token": token}, 200

        except Exception as e:
            abort(500, "Internal server error")



@api.route('/signup')
class Signup(Resource):
    @api.response(200, "Success", models.token)
    @api.response(409, "Email address occupied already")
    @api.response(400, "Wrong format / missing parameter xxx")
    @api.doc(description="A new customer signs up. Require one unique email address and one set of valid address")
    @api.expect(models.signup)
    def post(self):
        if not request.json:
            return "Malformed request", 400

        data = request.json 

        # check data
        success, result = unpack(
            data, 
            "first_name", "last_name", "email", "mobile", "password", "address",
            required=True
        )

        if not success:
            return "Missing parameter", 400
        
        firstname, lastname, email, mobile, password, address = result 

        # also decompose the address
        success, result = unpack(
            address, 
            "unit_number", "street_number", "street_name", "suburb", "postcode", "state",
            required=True
        )

        if not success:
            return "Missing parameter in address", 400

        unitnumber, streetnumber, streetname, suburb, postcode, state = result 

        # now do some check
        success, msg = check_name(firstname, lastname)
        if not success:
            return msg, 400

        success, msg = check_email(email)
        if not success:
            return msg, 400

        success, msg = check_password(password)
        if not success:
            return msg, 400

        success, msg = check_mobile(mobile)
        if not success:
            return msg, 400

        success, msg = check_address(unitnumber, streetnumber, streetname, suburb, postcode, state)
        if not success:
            return msg, 400


        try:
            sql1 = """
                INSERT INTO user(role, password, first_name, last_name, email, mobile)
                VALUES (1, ?, ?, ?, ?, ?)
            """

            values1 = (password, firstname, lastname, email, mobile)

            db = DB()

            user_id = db.insert_and_get_id(sql1, values1)

            sql2 = """
                INSERT INTO customer_address(user_id, unit_number, street_number, street_name, suburb, state, postcode)
                VALUES(?, ?, ?, ?, ?, ?, ?)
            """

            values2 = (user_id, unitnumber, streetnumber, streetname, suburb, state, postcode)

            db.insert(sql2, values2)

            db.close()

            # generate token
            T = Token()
            token = T.generate(id=user_id, role=1)
            return {"token": token}, 200

        except sqlite3.IntegrityError as e:
            db.conn.rollback()
            print(e)
            return "Email address taken already", 409
        except sqlite3.Error as e:
            print(e)
            abort(500, e)
        




