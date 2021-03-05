from flask_restx import Namespace, Resource, fields 



api = Namespace(
    'comment',
    description="Get comments about one item. The original user and admin can take actions on comments."
)


@api.route('')
class Comment(Resource):
    def get(self):
        pass 

    def post(self):
        pass 

    def put(self):
        pass 

    def delete(self):
        pass 