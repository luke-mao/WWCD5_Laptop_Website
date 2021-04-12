from flask_restx import Namespace, Resource, fields 


api = Namespace(
    'sales',
    description="Admin check sales report. And the public can view the best sell 20 items."
)


@api.route('')
class Cart(Resource):
    def get(self):
        pass 


        """
        ONLY GET method is supported here.
        the url takes three parameters, example url as 
            http://localhost:5000/sales/
            http://localhost:5000/sales/?start=1609459200&end=1618190517&type=week
            http://localhost:5000/sales/?start=1609459200&end=1618190548&type=day
            http://localhost:5000/sales/?start=1609459200&end=1618190548&type=month 
        
        start = unix time, the smallest number is 1609459200 indicating 2021/01/01/00:00:00
        end = unix time, the largest number allowed is the current time, use time.time() to obtain the current time
        type = day / week / month

        you can use this link to determine the timestamp: https://www.epochconverter.com/ 

        default value:
            start: this week monday 00:00
            end: current time using time.time()
            type: day
        
        
        response: 
            400 Invalid parameter (such as "start" is > "end") (type is other value than day/week/month)
            403: Auth token issue (only admin is allowed to use this endpoint, check identity['role'] = 0 to confirm admin)
            200: OK

            For 200 response: return the following:

                orders: [number of orders in that period]
                sales: [the sum of order total, round to 2 decimal place]
                gst: [use the above value / 1.1, round to 2 decimal place]
                revenue: [use the sales * 0.2, round to 2 decimal place],
            
                graphs:{
                    'sales': [
                        给定的时间段里面，
                        用type来划分每个间隔，
                        然后每个数字表示这一间隔内的销售额， 
                        注意此list为时间升序, 
                        前端会制作成折线图
                        2021-3-21-15:00 到 2021-4-1 16：00 =》 2021-3-21 00：00 到 2021-4-1 23：59 
                    ],
                    'orders': [
                        给定的时间段里面，
                        用type来划分每个间隔，
                        然后每个数字表示这一间隔内的销售额， 
                        注意此list为时间升序, 
                        前端会制作成折线图 (可能用sales和orders两组数据一起做在同一张表上)
                    ],
                    'items': [
                        给定的这一整个时间段，
                        每个商品卖出去的数量，
                        以商品的销售量的降序为顺序。
                        每个value是一个dict，记载{item_id: xxx, name: xxx, quantity: xxx}],
                        前端会制作成一个柱状图
                    ]
                    'customers': [
                        给定的这一整个时间段，降序排列每个顾客的订单总额，
                        每个value是一个dict，记载{user_id: xxx, name: first name + 空格 + last name, total: 订单总额},
                        前端会制作成一个柱状图
                    ]
                }



        """








