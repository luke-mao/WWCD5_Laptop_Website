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

# profile model
# full for GET profile
profile_full = api.model('profile',{
    'first_name': fields.String,
    'last_name': fields.String,
    'email': fields.String,
    'mobile': fields.String,
    'password': fields.String,
    'address': fields.List(fields.Nested(address))
})

# simple for PUT profile (since the address is PUT separately)
profile_simple = api.model("profile",{'first_name': fields.String,
    'last_name': fields.String,
    'email': fields.String,
    'mobile': fields.String,
    'password': fields.String
})

# address
address_parser = reqparse.RequestParser()
address_parser.add_argument(
    'address_id',
    type=int,
    help="user address_id",
    location="args"
)

# rating
rating_parser = reqparse.RequestParser()
rating_parser.add_argument(
    'item_id',
    type=int,
    help="item_id",
    location="args"
)

rating = api.model('rating', {
    'Rating': fields.Integer,
})

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
    'total_price': fields.Float,
    'items': fields.List(fields.Nested(order_item))
})

# maybe no stock, or the order quantity is too large
order_error_no_stock = api.model('order_error_out_of_stock', {
    'item_id': fields.Integer,
    'available_stock': fields.Integer
})

order_error_incorrect_price = api.model('order_error_incorrect_price', {
    'item_id': fields.Integer,
    'price': fields.Float    
})

order_error_wrong_total_price = api.model('order_error_wrong_total_price', {
    'total_price': fields.Float 
})


order_success = api.model('order_success', {
    'ord_id': fields.Integer,
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


# item module
# the data contains two keys: simple and detail
item_simple_profile = api.model('item_simple_profile', {
    'item_id': fields.Integer,
    'name': fields.String,
    'price': fields.Float,
    'stock_number': fields.Integer,
    'status': fields.Integer,
    'warranty': fields.String,
    'view': fields.Integer,
    'thumbnail': fields.String
})

item_detail_profile = api.model('item_detail_profile', {
    'many_many_attributes': fields.String,
    'many_many_attributes': fields.String
})

item_profile = api.model('item_profile',{
    'simple': fields.Nested(item_simple_profile),
    'detail': fields.Nested(item_detail_profile),
    'photos': fields.List(fields.String)
})

item_profile_list = api.model('item_profile_list', {
    'current_page': fields.Integer,
    'max_page': fields.Integer,
    'data': fields.List(fields.Nested(item_profile))
})


# admin update the model
item_profile_update = api.model('item_update', {
    'attributeA': fields.String,
    'attributeB': fields.String,
    'attributeC': fields.String,
    'many_many_attributes': fields.String
})


# admin upload a new model
new_item = api.model('new_item', {
    "name": fields.String,
    "price": fields.String,
    "stock_number": fields.String,
    "status": fields.String,
    "warranty": fields.String,
    "thumbnail": fields.String,
    'other_attribute': fields.String,
    'other_other_attribute': fields.String
})









