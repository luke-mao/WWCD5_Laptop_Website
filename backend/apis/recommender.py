from flask_restx import Namespace, Resource, fields 


api = Namespace(
    'recommender',
    description="Recommender system based on item description, customer purchase histroy and view history"
)


@api.route('')
class Recommender(Resource):
    def get(self):
        pass 