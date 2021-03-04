from flask_restx import Namespace, Resource, fields 

api = Namespace(
    'item',
    description="View items. The admin can update and put new items on the self"
)


@api.route('/')
class Item(Resource):
    def get(self):
        pass 


    def post(self):
        pass

    def put(self):
        pass 

    def delete(self):
        pass 