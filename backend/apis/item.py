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


def get_max_page_num(total, item_per_page):
    max_page =  total // item_per_page - 1 

    if total % item_per_page != 0:
        max_page += 1

    return max_page


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


@api.route('/page/<page_id>')
class Item_with_page_id(Resource):
    @api.response(200, "OK", models.item_profile_list)
    @api.response(500, "Internal server error")
    @api.response(400, "Invalid page id")
    @api.response(404, "No more pages.")
    @api.doc(description="""
        Return a list of items, order = ascending order of item_id.
        Each page returns 20 laptops. Currently we support around 12 pages, so the range = 0 to 11.
        If page_id is not found, default page = 0.
        The item must have status = 1. 
    """)
    def get(self, page_id):
        if not page_id:
            page_id = 0
        
        try:
            page_id = int(page_id)
        except ValueError:
            return "page_id must be an integer", 400 
        
        if page_id < 0:
            return "Page_id must be a positive integer", 400 
        

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                # LIMIT row_count, offset
                sql = """SELECT item_id FROM item WHERE status = 1 LIMIT ? OFFSET ?"""
                sql_param = (20, page_id * 20)

                cur.execute(sql, sql_param)
                item_id_list = cur.fetchall()

                if not item_id_list:
                    return "No more pages", 404

                result = {
                    'current_page': page_id,
                    'max_page': None,
                    'data': get_all_profiles(item_id_list)
                }
                
                # get max page count
                sql_count = """SELECT count(*) AS total FROM item WHERE status = 1"""
                cur.execute(sql_count)
                total_items = cur.fetchone()['total']
                
                result['max_page'] = get_max_page_num(total_items, 20)
                
                return result, 200 

        except Exception as e:
            print(e)
            return "Internal server error", 500             


@api.route('/order/price/<order>/<page_id>')
@api.route('/order/alphabet/<order>/<page_id>')
class Item_with_price_alphabet_order(Resource):
    @api.response(200, "OK", models.item_profile_list)
    @api.response(500, "Internal server error")
    @api.response(400, "Invalid page id / price order")
    @api.response(404, "No more pages.")
    @api.doc(description="""
        Get items with price / alphabet order asc or desc. Put the page id and order type in the header.
        Currently we have around 12 pages, with each page containing 20 laptops.
    """)
    def get(self, order, page_id):
        if not order:
            return "No order", 400
        
        if order != "asc" and order != "desc":
            return "Invalid order", 400

        if not page_id:
            return "No page_id", 400
        
        try:
            page_id = int(page_id)
        except ValueError:
            return "Invalid page_id", 400

        if page_id < 0:
            return "Invalid page_id", 400
        

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                sql = None 

                if "price" in request.path:
                    sql = """
                        SELECT item_id 
                        FROM item 
                        WHERE status = 1
                        ORDER BY price {}
                        LIMIT ? OFFSET ?
                    """.format(order)
                else:
                    sql = """
                        SELECT item_id 
                        FROM item 
                        WHERE status = 1
                        ORDER BY name {}
                        LIMIT ? OFFSET ?
                    """.format(order)

                sql_param = (20, page_id * 20)

                cur.execute(sql, sql_param)
                item_id_list = cur.fetchall()

                if not item_id_list:
                    return "No more pages", 404

                result = {
                    'current_page': page_id,
                    'max_page': None,
                    'data': get_all_profiles(item_id_list)
                }

                # get max page count
                sql_count = """SELECT count(*) AS total FROM item WHERE status = 1"""
                cur.execute(sql_count)
                total_items = cur.fetchone()['total']
                
                result['max_page'] = get_max_page_num(total_items, 20)
                
                return result, 200 

        except Exception as e:
            print(e)
            return "Internal server error", 500     


@api.route('/order/trending/<page_id>')
class Item_with_trending_order(Resource):
    @api.response(200, "OK", models.item_profile_list)
    @api.response(500, "Internal server error")
    @api.response(400, "Invalid page id")
    @api.response(404, "No more pages.")
    @api.doc(description="""
        Get items with descending trending order. Put the page id in the header.
        Currently we have around 12 pages, with each page containing 20 laptops.
        Trending is determined using the "view" attribute in the simple profile.
    """)
    def get(self, page_id):
        if not page_id:
            return "No page_id", 400
        
        try:
            page_id = int(page_id)
        except ValueError:
            return "Invalid page_id", 400

        if page_id < 0:
            return "Invalid page_id", 400
        

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                sql = """
                    SELECT item_id 
                    FROM item 
                    WHERE status = 1
                    ORDER BY view DESC
                    LIMIT ? OFFSET ?
                """

                sql_param = (20, page_id * 20)

                cur.execute(sql, sql_param)
                item_id_list = cur.fetchall()

                if not item_id_list:
                    return "No more pages", 404

                result = {
                    'current_page': page_id,
                    'max_page': None,
                    'data': get_all_profiles(item_id_list)
                }

                # get max page count
                sql_count = """SELECT count(*) AS total FROM item WHERE status = 1"""
                cur.execute(sql_count)
                total_items = cur.fetchone()['total']
                
                result['max_page'] = get_max_page_num(total_items, 20)
                
                return result, 200 

        except Exception as e:
            print(e)
            return "Internal server error", 500     


@api.route('/search/<search_str>/<page_id>')
class Search_str(Resource):
    @api.response(200, "OK", models.item_profile_list)
    @api.response(500, "Internal server error")
    @api.response(400, "Malformed request")
    @api.doc(description="""
        User inputs a search string, and the backend returns the items with closest name similarity. 
        The similarity is measured using Jaro–Winkler distance. 
        In computer science and statistics, the Jaro–Winkler distance is a string metric measuring an edit distance between two sequences. 
        It is a variant proposed in 1990 by William E. Winkler of the Jaro distance metric (1989, Matthew A. Jaro).
        As usual, each page has 20 computers. 
    """)
    def get(self, search_str, page_id):
        # check search_str
        if not search_str:
            return "Require the search string input", 400 
        
        search_str = search_str.lower()

        # check page_id
        if not page_id:
            return "No page_id", 400
        
        try:
            page_id = int(page_id)
        except ValueError:
            return "Invalid page_id", 400

        if page_id < 0:
            return "Invalid page_id", 400


        # get all names
        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                sql_1 = "SELECT item_id, name FROM item WHERE status = 1"
                cur.execute(sql_1)

                id_name_list = cur.fetchall()

                # calculate the distance for all
                for each in id_name_list:
                    name = each['name'].lower()
                    each['similarity'] = jaro_winkler.normalized_similarity(search_str, name)
                
                # sort the list
                sorted_id_name_list = sorted(
                    id_name_list, 
                    key=lambda x: x['similarity'],
                    reverse=True
                )

                # similarity threshold 0.55
                THRESHOLD = 0.6
                selected_id_name_list = []

                for each in sorted_id_name_list:
                    if each['similarity'] > THRESHOLD:
                        selected_id_name_list.append(each)
                    else:
                        break
        
                # each page has 20 items, check length
                if (len(selected_id_name_list) > page_id * 20):
                    result = {
                        'current_page': page_id,
                        'max_page': get_max_page_num(len(selected_id_name_list), 20),
                        'data': get_all_profiles(sorted_id_name_list[page_id * 20 : (page_id+1) * 20])
                    }

                    return result, 200

                else:
                    return "No more pages", 200

        except Exception as e:
            print(e)
            return "Internal server error", 500            

