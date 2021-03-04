from flask_restx import Namespace, Resource, fields 

api = Namespace(
    'user',
    description="User profile actions, including view history"
)


@api.route('/profile')
class Profile(Resource):
    def get(self):
        pass 

    def post(self):
        pass


@api.route('/address')
class Address(Resource):
    def get(self):
        pass 

    def post(self):
        pass


@api.route('/viewhistory')
class ViewHistory(Resource):
    def get(self):
        pass 

    