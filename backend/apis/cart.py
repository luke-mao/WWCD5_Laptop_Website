from flask_restx import Namespace, Resource, fields


api = Namespace(
    'cart',
    description="Save the cart after user logs out, and retrieve during next login"
)


@api.route('/')
class Cart(Resource):
    def get(self):
        pass 

    def post(self):
        pass 