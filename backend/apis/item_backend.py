from flask_restx import Namespace, Resource, fields
from flask import request, abort
import sqlite3 
import os
import models
from utils.token import Token
from utils.attributes import simple_attributes, detail_attributes
from utils.function import unpack


api = Namespace(
    'item-backend',
    description="Admin adjust the items, including delete or update."
)


def check_admin_identity():
    # check token
    auth=request.headers.get("Authorization")
    if not auth:
        return None, "No authorization token", 403
    
    T = Token()
    identity = T.check(auth)

    if not identity:
        return None, "Wrong token", 403

    if identity['role'] != 0:
        return None, "Only admin can edit", 403

    return identity, None, None


def check_item_id(item_id):
    # check item_id
    if not item_id:
        return None, "No item_id provided", 400
    
    try:
        item_id = int(item_id)
    except ValueError:
        return None, "Item_id must be an integer", 400 
    
    if item_id <= 0:
        return None, "Item_id must be a positive integer", 400 

    return item_id, None, None 



@api.route('/<item_id>')
class Item(Resource):
    @api.response(200, "OK")
    @api.response(400, "Invalid attribute / item_id")
    @api.response(403, "No authorization token / token invalid / token expired / not admin")
    @api.response(404, "Item id not found")
    @api.response(500, "Internal server error")
    @api.expect(models.token_header, models.item_profile_update)
    @api.doc("""
        Admin update the item info. 
        The admin is free to update everything from price, stock to the computer specifications.
    """)
    def put(self, item_id):
        identity = check_admin_identity()
        item_id = check_item_id(item_id)

        # now unpack the data to json
        data = request.json
        if not data:
            return "Malformed request", 400

        # sql part
        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                # first check the existence of the item_id
                sql_1 = "SELECT * FROM item WHERE item_id = ?"
                param_1 = (item_id,)

                cur.execute(sql_1, param_1)
                is_exist = cur.fetchone()

                if not is_exist:
                    return "Item_id not found", 404

                # scan all attributes, make sure all keys are ok
                for key in data:
                    if key not in simple_attributes and key not in detail_attributes:
                        return "Invalid attribute {}".format(key), 400
                
                # now update the simple profile first
                for key in data:
                    sql_2 = None 
                    if key in simple_attributes:
                        sql_2 = "UPDATE item SET {} = ? WHERE item_id = ?".format(key)
                    else:
                        sql_2 = "UPDATE laptop SET {} = ? WHERE item_id = ?".format(key)
                    
                    param_2 = (data[key], item_id)
                    cur.execute(sql_2, param_2)

                return "OK", 200

        except Exception as e:
            print(e)
            return "Internal server error", 500



@api.route('/delete/<item_id>')
@api.route('/undelete/<item_id>')
class Status(Resource):
    @api.response(200, "OK")
    @api.response(400, "Invalid item_id")
    @api.response(403, "No authorization token / token invalid / token expired / not admin")
    @api.response(404, "Item id not found / The item is deleted already / The item is active already")
    @api.response(500, "Internal server error")
    @api.expect(models.token_header)
    @api.doc("""
        Admin can either delete or undelete an item. Admin token required. 
    """)
    def put(self, item_id):
        identity, msg, code = check_admin_identity()
        item_id, msg2, code2 = check_item_id(item_id)

        if not identity:
            return msg, code

        if not item_id:
            return msg2, code2

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                # check the existence and status of the item
                sql_1 = "SELECT status FROM item WHERE item_id = ?"
                param_1 = (item_id,)

                cur.execute(sql_1, param_1)
                result = cur.fetchone()

                if not result:
                    return "Item_id not found", 404
                
                # separate consider delete and undelete
                # consider undelete first, since the substring 'delete' is also in 'undelete' 
                if "undelete" in request.path:
                    if result['status'] == 1:
                        return "The item is active already", 404
                    
                    print("hello")
                    sql_2 = "UPDATE item SET status = 1 WHERE item_id = ?"
                    param_2 = (item_id,)
                    cur.execute(sql_2, param_2)

                else: # delete
                    if result['status'] == 0:
                        return "The item is deleted already", 404

                    sql_2 = "UPDATE item SET status = 0 WHERE item_id = ?"
                    param_2 = (item_id,)
                    cur.execute(sql_2, param_2)

                return "OK", 200

        except Exception as e:
            print(e)
            return "Internal server error", 500        



@api.route('')
class NewItem(Resource):
    @api.response(200, "OK", models.item_profile)
    @api.response(400, "Invalid attribute")
    @api.response(500, "Internal server error")
    @api.response(403, "No authorization token / token invalid / token expired / not admin")
    @api.expect(models.token_header, models.new_item)
    @api.doc("""
        The admin can upload a new item.
        The admin must provide all attributs in ["name", "price", "stock_number", "status", "warranty"].
        The thumbnail will be set as null, if not given for now
        The status can set to be 1 for on shelf right now, or 0 to wait for further data. 
        For other attributes, can leave for blank, or input some values. 
    """)
    def post(self):
        identity, msg, code = check_admin_identity()
        if not identity:
            return msg, code

        data = request.json
        if not data:
            return "No data", 400

        # scan all attributes, make sure all keys are ok
        for key in data:
            if key not in simple_attributes and key not in detail_attributes:
                return "Invalid attribute {}".format(key), 400

        # simple_attributes must be fullfilled
        # the thumbnail can be empty for now
        success, unpack_result = unpack(
            data, 
            "name", "price", "stock_number", "status", "warranty"
        )

        if not success:
            return "Simple attributes must be fullfilled (you can leave thumbnail for now)", 400
        
        # sql part
        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                # insert simple profile and get id
                # view starts from 0
                sql_1 = """
                    INSERT INTO item(name, price, stock_number, status, warranty, view)
                    VALUES (?, ?, ?, ?, ?, 0)
                """

                param_1 = tuple(unpack_result)

                cur.execute(sql_1, param_1)
                new_item_id = cur.lastrowid

                # now insert a row into the table "laptop"
                sql_2 = "INSERT INTO laptop(item_id) VALUES (?)"
                param_2 = (new_item_id,)
                cur.execute(sql_2, param_2)

                # now insert for all detail attributes
                for key in data:
                    if key in detail_attributes:
                        sql_3 = "UPDATE laptop SET {} = ? WHERE item_id = ?".format(key)
                        param_3 = (data[key], new_item_id)
                        cur.execute(sql_3, param_3)

                
                # after insertion, return the profile
                sql_4 = """SELECT * FROM item WHERE item_id = ?"""
                sql_5 = """SELECT * FROM laptop WHERE item_id = ?"""
                sql_6 = """SELECT * FROM photo WHERE item_id = ?"""
                
                sql_param = (new_item_id,)

                cur.execute(sql_4, sql_param)
                simple_profile = cur.fetchone()
                
                cur.execute(sql_5, sql_param)
                detail_profile = cur.fetchone()

                cur.execute(sql_6, sql_param)
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

