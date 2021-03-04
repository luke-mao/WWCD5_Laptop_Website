from flask_restx import Namespace, Resource, fields 

api = Namespace(
    'rating',
    description="After placing order, the customer can rate the item. And all others can view the ratings"
)


@api.route('/')
class Rating(Resource):
    def get(self):
        pass 

    def put(self):
        pass 