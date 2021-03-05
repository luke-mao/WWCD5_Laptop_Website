from flask_restx import Api 

api = Api(
    version="1.0",
    title="WWCD5 Backend",
    description="COMP 9900 WWCD5 E-Commerce Project Laptop Sale Website Backend"
)


from .auth import api as auth
from .cart import api as cart 
from .comment import api as comment 
from .item import api as item 
from .order import api as order 
from .rating import api as rating 
from .user import api as user 
from .sales import api as sales


api.add_namespace(auth)
api.add_namespace(user)
api.add_namespace(cart)
api.add_namespace(order)
api.add_namespace(comment)
api.add_namespace(rating)
api.add_namespace(item)
api.add_namespace(sales)

