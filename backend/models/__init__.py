from apis import api
from flask import request 
from flask_restx import fields, reqparse


# you can use fields.String(required=True) to emphasize the test
# but you can also check the parameters in the api itself
# both are fine
login = api.model('login', {
    'email': fields.String,
    'password': fields.String
})


token = api.model('token', {
    'token': fields.String
})


address = api.model('address', {
    'unit_number': fields.Integer,
    'street_number': fields.Integer,
    'street_name': fields.String,
    'suburb': fields.String,
    'postcode': fields.String,
    'state': fields.String
})


signup = api.model('signup', {
    'first_name': fields.String,
    'last_name': fields.String,
    'email': fields.String,
    'mobile': fields.String,
    'password': fields.String,
    'address': fields.Nested(address)
})


# authorization token model
token_header = reqparse.RequestParser()
token_header.add_argument(
    'Authorization',
    type=str,
    help="Authorization token in bearer format",
    location="headers"
)


# address
address_parser = reqparse.RequestParser()
address_parser.add_argument(
    'address_id',
    type=int,
    help="user address_id",
    location="args"
)


# when sending an order, we use id to identify
order_item = api.model('order_item', {
    'item_id': fields.Integer,
    'quantity': fields.Integer,
    'price': fields.Float
})


order = api.model('order', {
    'address_id': fields.Integer,
    'notes': fields.String,
    'card_last_four': fields.String,
    'total_price': fields.String,
    'items': fields.List(fields.Nested(order_item))
})


order_error_no_stock = api.model('order_error_out_of_stock', {
    'item_id': fields.Integer
})

order_error_incorrect_price = api.model('order_error_incorrect_price', {
    'item_id': fields.Integer,
    'price': fields.Float    
})


order_success = api.model('order_success', {
    'order_id': fields.Integer,
    'total_price': fields.Float 
})


# for the order history, we return names instead of id
order_history_item = api.model('order_history_item',{
    'name': fields.String,
    'price': fields.Float,
    'quantity': fields.Integer,
    'thumbernail': fields.String
})


order_history = api.model('order_history', {
    'address': fields.String,     # here give the full address instead of address_id
    'notes': fields.String,
    'card_last_four': fields.String,
    'total_price': fields.String,
    'time': fields.Integer,     # time in seconds since epoch
    'tracking': fields.String,
    'items': fields.List(fields.Nested(order_history_item))
})


order_history_list = api.model('order_history_list', {
    'orders': fields.List(fields.Nested(order_history))
})

