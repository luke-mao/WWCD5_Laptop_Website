from utils.function import unpack
import sqlite3  
import re
import time
import os  

def check_cart(db, cart, identity):
    # example cart data format:
    # {
    # "address_id": 0,
    # "notes": "string",
    # "card_last_four": "string",
    # "total_price": "string",
    # "items": [
    #     {
    #     "item_id": 0,
    #     "quantity": 0,
    #     "price": 0
    #     }
    # ]
    # }

    # unpack the first level
    flag, result = unpack(
        cart, 
        "address_id", "notes", "card_last_four", "total_price", "items",
        required=True 
    )

    if not flag:
        return 400, "Missing parameter"
    
    address_id, notes, card_last_four, total_price, items = result 


    # check the address_id first
    try:
        address_id = int(address_id)
        if address_id < 0:
            raise ValueError

    except ValueError:
        return 400, "Parameter address_id must be a positive integer"

    
    try:
        sql_1 = """
            SELECT * 
            FROM customer_address
            WHERE user_id = ? AND address_id = ?
        """

        sql_1_param = (identity["user_id"], address_id)

        sql_1_result = db.select(sql_1, sql_1_param)

        if not sql_1_result:
            return 400, "Invalid address_id"

    except Exception as e:
        print(e)
    

    # variable 'notes' no need to check
    # check card_last_four
    if re.match("^\d{4}$", card_last_four) is None:
        return 402, "Invalid card last four digits"


    # check total_price
    # convert to float first, check the amount later 
    try:
        total_price = float(total_price)
        if total_price < 0:
            raise ValueError
    except ValueError:
        return 400, "total price must be positive float"
    

    # check the items
    # "items": [
    #     {
    #     "item_id": 0,
    #     "quantity": 0,
    #     "price": 0
    #     }
    # ]

    if not isinstance(items, list):
        return 400, "key 'items' must be a list"
    
    # store backend_total_price
    order_total_price = 0

    # check the interior
    try:
        for item in items:
            flag, result = unpack(
                item,
                "item_id", "quantity", "price",
                required=True 
            )

            if not flag:
                raise KeyError

            item_id, quantity, price = int(result[0]), int(result[1]), float(result[2])
            if item_id <= 0 or quantity <= 0 or price < 0:
                raise ValueError

            # now check the item_id exist, and price is the same
            # and quantity is available
            sql_2 = """
                SELECT price, stock_number, status
                FROM item
                WHERE item_id = ?
            """

            sql_2_param = (item_id,)
            sql_2_result = db.select(sql_2, sql_2_param)

            # check the item is available
            if (not sql_2_result) or (sql_2_result[0]["status"] == 0):
                response = {
                    'item_id': item_id,
                    'available_stock': 0
                }
                return 410, response 

            sql_2_result = sql_2_result[0]

            if sql_2_result["stock_number"] < quantity:
                response = {
                    'item_id': item_id,
                    'available_stock': sql_2_result["stock_number"]
                }                
                return 410, response 

            # check the price is right
            if sql_2_result['price'] != price:
                response = {
                    "item_id": item_id,
                    "price": sql_2_result["price"]
                }
                return 409, response
            
            # update the total order price
            order_total_price += quantity * price

    except KeyError:
        return 400, "Missing parameters in key 'items'"
    except ValueError as e:
        print(e)
        return 400, "Item id & quantity must be positive integer, and price must be float"    
    except Exception as e:
        print(e)
        return 500, "Internal server error"
    

    # check the total price
    if round(total_price, 2) != round(order_total_price, 2):
        response = {
            'total_price': round(order_total_price, 2)
        }
        return 411, response 
    
    
    # now everything is valid, prepare database insert
    new_order_id = None 

    # # use transaction mode
    # conn, cur = db.get_conn_and_cursor(manual_mode=True)
    # cur.execute("BEGIN")
    
    # try:
    #     sql_3 = """
    #         INSERT INTO orders(user_id, unix_time, total_price, address_id, notes, card_last_four)
    #         VALUES(?, ?, ?, ?, ?, ?)
    #     """

    #     sql_3_param = (
    #         identity["user_id"], 
    #         int(time.time()), 
    #         total_price, 
    #         address_id, 
    #         notes, 
    #         card_last_four
    #     )

    #     cur.execute(sql_3, sql_3_param)
    #     new_order_id = cur.lastrowid

    #     # insert all items
    #     # also update the item stock number
    #     sql_4 = """
    #         INSERT INTO order_item(ord_id, item_id, quantity, price)
    #         VALUES(1, ?, ?, ?)
    #     """

    #     sql_5 = """
    #         UPDATE item
    #         SET stock_number = stock_number - ?
    #         WHERE item_id = ?
    #     """

    #     for item in items:
    #         sql_4_param = (
    #             new_order_id, 
    #             item['item_id'],
    #             item['quantity'],
    #             item['price']
    #         )

    #         cur.execute(sql_4, sql_4_param)

    #         sql_5_param = (
    #             item['quantity'], 
    #             item['item_id']
    #         )

    #         cur.execute(sql_5, sql_5_param)
        
    #     cur.execute("COMMIT")
        
    # except Exception as e:
    #     cur.execute("ROLLBACK")

    #     print(e)
    #     return 500, "Internal server error"
    
    
    try:
        with sqlite3.connect("db/data.db") as conn:
            cur = conn.cursor()

            sql_3 = """
                INSERT INTO orders(user_id, unix_time, total_price, address_id, notes, card_last_four)
                VALUES(?, ?, ?, ?, ?, ?)
            """

            sql_3_param = (
                identity["user_id"], 
                int(time.time()), 
                total_price, 
                address_id, 
                notes, 
                card_last_four
            )

            cur.execute(sql_3, sql_3_param)
            new_order_id = cur.lastrowid

            # insert all items
            # also update the item stock number
            sql_4 = """
                INSERT INTO order_item(ord_id, item_id, quantity, price)
                VALUES(?, ?, ?, ?)
            """

            sql_5 = """
                UPDATE item
                SET stock_number = stock_number - ?
                WHERE item_id = ?
            """

            for item in items:
                sql_4_param = (
                    new_order_id, 
                    item['item_id'],
                    item['quantity'],
                    item['price']
                )

                cur.execute(sql_4, sql_4_param)

                sql_5_param = (
                    item['quantity'], 
                    item['item_id']
                )

                cur.execute(sql_5, sql_5_param)
            
            cur.execute("COMMIT")
        
    except Exception as e:
        print(e)
        return 500, "Internal server error"












    # success
    response = {
        'ord_id': new_order_id,
        'total_price': total_price 
    }

    return 200, response  
        
        

        

    

    




