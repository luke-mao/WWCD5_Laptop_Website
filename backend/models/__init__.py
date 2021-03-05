from apis import api
from flask import request 
from flask_restx import fields


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










