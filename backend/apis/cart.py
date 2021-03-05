from flask_restx import Namespace, Resource, fields


api = Namespace(
    'cart',
    description="Save the cart after user logs out, and retrieve during next login"
)


# every time get and post, check the validity of all price and quantity of the cart
# after that, confirm the get request or post request


@api.route('')
class Cart(Resource):
    def get(self):
        pass 

    def post(self):
        pass 