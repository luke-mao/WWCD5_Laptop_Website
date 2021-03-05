from flask_restx import Namespace, Resource, fields 


api = Namespace(
    'sales',
    description="Admin check sales report. And the public can view the best sell 20 items."
)


@api.route('/')
class Cart(Resource):
    def get(self):
        pass 
