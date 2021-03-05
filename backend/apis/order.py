from flask_restx import Namespace, Resource, fields 



api = Namespace(
    'order',
    description="Make and check orders."
)


@api.route('')
class Order(Resource):
    def get(self):
        pass 

    def post(self):
        pass 