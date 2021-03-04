from flask_restx import Namespace, Resource, fields 

api = Namespace(
    'auth',
    description="Authorization actions, including login and signup"
)


@api.route('/')
class Auth(Resource):
    def get(self):
        pass 

    def post(self):
        pass 
    