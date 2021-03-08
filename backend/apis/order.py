from flask_restx import Namespace, Resource, fields
from flask import request, abort
from db import DB 
import models
from utils.token import Token
from utils.function import unpack, check_address, check_mobile, check_name, check_password, check_email
from utils.order import check_cart 
import sqlite3 


api = Namespace(
    'order',
    description="Make and get all orders of a customer."
)


@api.route('')
class Order(Resource):
    @api.response(200, "OK", models.order_history_list)
    @api.response(204, "The customer has not made any orders yet")
    @api.response(403, "No authorization token / token invalid / token expired")
    @api.expect(models.token_header)
    def get(self):
        pass 


    @api.response(200, "OK", models.order_success)
    @api.response(403, "No authorization token / token invalid / token expired")
    @api.response(400, "Wrong format / missing parameter xxx")
    @api.response(409, "Price not match", models.order_error_incorrect_price)
    @api.response(410, "Item out of stock / Item deleted / Item invalid", models.order_error_no_stock)
    @api.response(402, "Payment issue: invalid xxx") # this may not be used unless card 4 digis is invalid
    @api.response(411, "Wrong total price", models.order_error_wrong_total_price)
    @api.expect(models.token_header, models.order)
    def post(self):
        # check the token first
        # first check the auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return "No authorization token", 403
        
        T = Token()
        identity = T.check(auth_header)
        if not identity:
            return "Wrong token", 403


        # check the payload
        data = request.json
        if not data:
            return "Malformed request", 400
        
        # connect to db and check
        db = DB()
        code, response = check_cart(db, data, identity)
        db.close()

        return response, code


