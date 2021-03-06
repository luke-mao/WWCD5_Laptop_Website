from flask_restx import Namespace, Resource, fields
from flask import request, abort
from db import DB 
import models
from utils.token import Token
from utils.function import unpack
from utils.function import check_address, check_mobile, check_name, check_password, check_email
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
    @api.response(410, "Item out of stock / Item deleted", models.order_error_no_stock)
    @api.expect(models.token_header, models.order)
    def post(self):
        pass 