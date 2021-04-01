from flask_restx import Namespace, Resource, fields
from flask import request, abort
import sqlite3 
import os
import models
from textdistance import jaro_winkler

api = Namespace(
    'item',
    description="View items. This module only supports getting item information and filtering items."
)


# given a item id list, return all profiles
def get_all_profiles(item_id_list):
    result = []
    
    try:
        with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
            conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
            cur = conn.cursor()

            for each in item_id_list:
                item_id = each['item_id']

                # select simple, detail and photos, same as below    
                sql_1 = """SELECT * FROM item WHERE item_id = ?"""
                sql_2 = """SELECT * FROM laptop WHERE item_id = ?"""
                sql_3 = """SELECT * FROM photo WHERE item_id = ?"""
                param = (item_id,)

                cur.execute(sql_1, param)
                simple = cur.fetchone()

                cur.execute(sql_2, param)
                detail = cur.fetchone()

                cur.execute(sql_3, param)
                raw_photos = cur.fetchall()
                photos = []
                for each_tuple in raw_photos:
                    photos.append(each_tuple['photo'])

                item_result = {
                    'simple': simple, 
                    'detail': detail, 
                    'photos': photos
                }

                result.append(item_result)
            
            return result

    except Exception as e:
        print(e)
        return abort(500, "Internal server error")


def get_page_count(total, item_per_page):
    return (total + item_per_page - 1) // item_per_page


# the page_id must be positive, usually around max 10 pages
def filter_page_id(page_id):
    if not page_id:
        abort(400, "No page_id")
    
    try:
        page_id = int(page_id)
    except ValueError:
        abort(400, "Invalid page_id")

    if page_id < 0:
        abort(400, "Invalid page_id")
    
    return page_id


def filter_price(price, default_price):
    if price is None:
        return default_price

    try:
        price_2 = float(price)
    except ValueError:
        abort(400, "Price is not a float")

    if price_2 < 0:
        abort(400, "Invalid price < 0")
    
    return price_2


def filter_param(param, default_list):
    if param is not None:
        param = list(set(param))
        param = [i for i in param if i in default_list]

    return param 


def configure_conds(params, conds):
    if (params is None) or (len(params) == 0):
        return None
    
    result = "({}".format(conds[int(params[0])])

    for i in params[1:]:
        result += " OR {}".format(conds[int(i)])
    
    result += ")"

    return result


@api.route('/id/<item_id>')
class Item_with_id(Resource):
    @api.response(200, "OK", models.item_profile)
    @api.response(404, "Not found")
    @api.response(400, "Invalid item_id: item_id must be a positive integer / item_id not provided.")
    @api.doc(description="""
        Everyone can view the details of the item. No need to provide token.
        status = 1 for available product. status = 0 means the product is deleted, and no longer for sale. 
    """)
    def get(self, item_id):
        if not item_id:
            return "No item_id provided", 400
        
        try:
            item_id = int(item_id)
        except ValueError:
            return "Item_id must be an integer", 400 
        
        if item_id <= 0:
            return "Item_id must be a positive integer", 400 
        
        # check the existence, if yes, then query both tables
        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                sql_1 = """SELECT * FROM item WHERE item_id = ?"""
                sql_2 = """SELECT * FROM laptop WHERE item_id = ?"""
                sql_3 = """SELECT * FROM photo WHERE item_id = ?"""
                
                sql_param = (item_id,)

                cur.execute(sql_1, sql_param)

                simple_profile = cur.fetchone()

                if not simple_profile:
                    return "Not found", 404 
                
                cur.execute(sql_2, sql_param)
                detail_profile = cur.fetchone()

                cur.execute(sql_3, sql_param)
                raw_photos = cur.fetchall()

                photos = []

                for each in raw_photos:
                    photos.append(each['photo'])

                result = {
                    'simple': simple_profile, 
                    'detail': detail_profile, 
                    'photos': photos
                }
                
                return result, 200

        except Exception as e:
            print(e)
            return "Internal server error", 500              


@api.route('/search/<page_id>')
class Search(Resource):
    @api.response(200, "OK", models.item_profile_list)
    @api.response(500, "Internal server error")
    @api.response(400, "Malformed request")
    @api.expect(models.filter)
    @api.doc(description="""
        We provide an extensive search method for the user to filter items and obtain what he wishes to see. 
        Filters include: order, price, cpu model, memory size, storage size, graphic model, screen size, 
        and keyword search. These filters have a specified range of values, for simplicity, we will ignore all invalid values,
        and replace with our default values to carry on. 
        Currently we have around 240 computers in the dataset. 
    """)
    def get(self, page_id):
        # deal with the page_id first
        page_id = filter_page_id(page_id)

        # deal with all values
        order_method = "view"
        if request.args.get("order_method") in ["view", "name", "price"]:
            order_method = request.args.get("order_method")
        
        order = "asc"
        if request.args.get("order") in ["asc", "desc"]:
            order = request.args.get("order")
        
        price_min = filter_price(request.args.get("price_min"), 0)
        price_max = filter_price(request.args.get("price_max"), 10000)

        if price_max < price_min:
            abort(400, "Price max should > price min")

        # variable to store all conditions
        conds = []
        conds.append("(item.price >= {} AND item.price <= {})".format(price_min, price_max))

        # keyword, the %20 symbol is removed automatically
        keyword = request.args.get("keyword")

        # multi-valued attributes
        cpu = filter_param(request.args.getlist("cpu"), ["0", "1"])
        storage = filter_param(request.args.getlist("storage"), ["0", "1", "2", "3"])
        memory = filter_param(request.args.getlist("memory"), ["0", "1", "2"])
        graphic = filter_param(request.args.getlist("graphic"), ["0", "1", "2"])
        screen = filter_param(request.args.getlist("screen"), ["0", "1", "2", "3"])

        cpu_conds = [
            "lower(laptop.cpu_prod) LIKE '%intel%'", 
            "lower(laptop.cpu_prod) LIKE '%amd%'",
        ]

        storage_conds = [
            "CAST(laptop.primary_storage_cap AS INTEGER) <= 256",
            "(CAST(laptop.primary_storage_cap AS INTEGER) > 256 AND CAST(laptop.primary_storage_cap AS INTEGER) <= 512)",
            "(CAST(laptop.primary_storage_cap AS INTEGER) > 512 AND CAST(laptop.primary_storage_cap AS INTEGER) <= 1024)",
            "CAST(laptop.primary_storage_cap AS INTEGER) > 1024",
        ]

        memory_conds = [
            "CAST(laptop.memory_size AS INTEGER) <= 8",
            "(CAST(laptop.memory_size AS INTEGER) > 8 AND CAST(laptop.memory_size AS INTEGER) <= 16)",
            "CAST(laptop.memory_size AS INTEGER) > 16",
        ]

        graphic_conds = [
            "laptop.gpu_model LIKE '%GTX 1%'",
            "laptop.gpu_model LIKE '%RTX 2%'",
            "laptop.gpu_model LIKE '%RTX 3%'",
        ]

        screen_conds = [
            "CAST(laptop.display_size AS REAL) <= 13.3",
            "(CAST(laptop.display_size AS REAL) > 13.3 AND CAST(laptop.display_size AS REAL) <= 15.6)",
            "CAST(laptop.display_size AS REAL) > 15.6",
        ]

            
        # for each variable list, if one condition, use AND to join, if multiple condition
        # bracket them, and inside use OR to join
        conds.append(configure_conds(cpu, cpu_conds))
        conds.append(configure_conds(storage, storage_conds))
        conds.append(configure_conds(memory, memory_conds))
        conds.append(configure_conds(graphic, graphic_conds))
        conds.append(configure_conds(screen, screen_conds))

        # remove all None
        conds = [cond for cond in conds if cond is not None]
        

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                sql = "SELECT item.item_id FROM item, laptop WHERE item.item_id = laptop.item_id "

                for cond in conds:
                    sql += "AND {} \n".format(cond)
                
                sql += "ORDER BY {} {}".format(order_method, order)
                cur.execute(sql)

                item_id_list = cur.fetchall()

                # if no result, or the id list does not reach this page id
                if (not item_id_list) or (len(item_id_list) < page_id * 20):
                    return(404, "No more pages")        # here cannot use abort, it will be caught in the exception

                result = {
                    'current_page': page_id,
                    'page_count': get_page_count(len(item_id_list), 20),
                    'data': get_all_profiles(item_id_list[page_id*20 : (page_id+1) * 20])
                }

                return result, 200 


        except Exception as e:
            print(e)
            abort(500, "Internal server error")     

