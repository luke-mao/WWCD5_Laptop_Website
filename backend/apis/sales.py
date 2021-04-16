from flask_restx import Namespace, Resource, fields 
import models
import time
import sqlite3
import os
from flask import request, abort
from utils.token import Token

api = Namespace(
    'sales',
    description="Admin check sales report. And the public can view the best sell 20 items."
)


def filter_start(start):
    if start==None:
        return 1609459200
    else:
        return start


def filter_end(end):
    if end==None:
        return time.time()
    else:
        return end


def filter_type(tp):
    if tp==None:
        return 'day'
    else:
        return tp


@api.route('')
class Sales(Resource):
    @api.response(200,"OK")
    @api.response(400,"Invalid parameter")
    @api.response(403, "No authorization token / token invalid / token expired / not admin")
    @api.expect(models.sale_filter, models.token_header)
    def get(self):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
                return "No authorization", 403
        T = Token()
        identity = T.check(auth_header)

        #if (not identity) or (identity['role']!=0):
        #    return "Wrong token", 403

        start_time=int(filter_start(request.args.get("start")))
        end_time=int(filter_end(request.args.get("end")))
        sale_type=filter_type(request.args.get("type"))

        typelist=['day','week','month']
        
        if start_time > end_time or sale_type not in typelist or end_time > time.time() or start_time < 1609459200:
            return "Invalid parameter", 400

        sql="SELECT unix_time, total_price FROM orders WHERE unix_time <= ? and unix_time >= ? order by unix_time ASC"
        values=(end_time, start_time)
        
        dictionary={}
        
        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()
                
                cur.execute(sql, values)
                result = cur.fetchall()

                print(result)

                # check if no result
                if not result:
                    return "No Record", 404
                else:
                    orders = []
                    sales = []

                    if sale_type == 'day':
                        duration = int((end_time - start_time) / (24 * 60 * 60)) + 1

                        for i in range(0, duration):
                            order = 0
                            sale = 0
                            print("hello here {}, {}".format(duration, i))
                            
                            # only one day
                            if i == 0 and duration == 1:
                                start = start_time
                                end = end_time
                            
                            # many days : first day
                            elif i == 0 and duration > 1:
                                start = start_time
                                tmp = time.localtime(start)
                                end = int(start-tmp.tm_hour * 60 * 60 - tmp.tm_min * 60 - tmp.tm_sec) + (24*60*60)
                            
                            # many days : last day
                            elif i == (duration-1):
                                start = end
                                end = end_time
                            
                            # many days
                            else:
                                start = end
                                end = start + (24*60*60)

                            for j in range(0, len(result)):
                                if result[j]["unix_time"] >= start and result[j]["unix_time"] < end:
                                    order += 1
                                    sale += round(result[j]["total_price"],2)
                            
                            print("here!!! order, sale = {}, {}".format(order, sale))
                            print(order,sale)

                            orders.append(order)
                            sales.append(round(sale,2))

                        dictionary['orders'] = orders
                        dictionary['sales'] = sales
                        return dictionary, 200
                        
                    elif sale_type == 'week':
                        pass
                    else:
                        pass

        except Exception as e:
            print(e)
            return "Internal server error", 500

    
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
        








