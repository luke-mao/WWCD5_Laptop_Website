from flask_restx import Namespace, Resource, fields 
import models
from utils.token import Token
from flask import request
import sqlite3
import os
import pandas as pd
from .item import get_all_profiles

from scipy import stats
from sklearn.preprocessing import MinMaxScaler


api = Namespace(
    'recommender',
    description="Recommendation systems in terms of three aspects: item based, popularity based and view history based"
)


@api.route('/item')
class RecommenderItemBased(Resource):
    @api.response(200, "OK")
    @api.response(403, "No authorization token / token invalid / token expired")
    @api.response(404, "Invalid user_id")
    @api.expect(models.token_header)
    @api.doc(description="Each user could have own recommended items based on popularity and user similarity. Return 5 items.")
    def get(self):
        """Recommendation system based on item rating and customer purchase history"""

        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return "No authorization token", 403
        
        T = Token()
        
        identity = T.check(auth_header)
        
        if not identity:
            return "Wrong token", 403
        
        sql = """SELECT * FROM customer_rating"""
        
        # sql_param = (identity['user_id'],)
        u_id = identity['user_id']
        
        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}

                cur = conn.cursor()

                r1 = cur.execute(sql)
                result = r1.fetchall()
                
                ####user-rating table
                user_rating = pd.DataFrame(result)
                
                ####每个item被评分的平均值
                ratings_mean_count = pd.DataFrame(
                    user_rating.groupby('item_id')['rating'].mean().sort_values(ascending=False))
                
                ####
                ratings_mean_count['rating_counts'] = pd.DataFrame(user_rating.groupby('item_id')['rating'].count())
                popular = ratings_mean_count.sort_values(['rating_counts', 'rating'], ascending=False).reset_index()
                pop_item = popular['item_id'].values.tolist()
                df = user_rating.pivot_table(index='user_id', columns='item_id', values='rating')
                
                ####两个user对item评分共有的部分
                def build_xy(user_id1, user_id2):
                    bool_array = df.loc[user_id1].notnull() & df.loc[user_id2].notnull()
                    return df.loc[user_id1, bool_array], df.loc[user_id2, bool_array]
                
                ###皮尔逊相关系数计算user相似度
                def pearson(user_id1, user_id2):
                    x, y = build_xy(user_id1, user_id2)
                    mean1, mean2 = x.mean(), y.mean()
                    denominator = (sum((x - mean1) ** 2) * sum((y - mean2) ** 2)) ** 0.5
                    try:
                        value = sum((x - mean1) * (y - mean2)) / denominator
                    except ZeroDivisionError:
                        value = 0
                    return value
                
                #####找出最邻近用户
                def computeNearestNeighbor(user_id, k=3):
                    return df.drop(user_id).index.to_series().apply(pearson, args=(user_id,)).nlargest(k)
                
                ####基于邻近用户做出推荐
                def recommend(user_id):
                    # 找到距离最近的用户id
                    nearest_user_id = computeNearestNeighbor(user_id).index[0]
                    
                    # 找出邻居评价过、但自己未曾评价的乐队（或商品）
                    # 结果：index是商品名称，values是评分
                    result = df.loc[
                        nearest_user_id, df.loc[user_id].isnull() & df.loc[nearest_user_id].notnull()].sort_values(
                        ascending=False)
                    
                    ###取前5个
                    return result[:5].index
                
                rec_result = recommend(u_id)
                all_result= []
                
                for i in rec_result:
                    all_result.append(i)
                
                #推荐给用户商品数目:top_k
                top_k = 5
                
                for i in pop_item:
                    if len(all_result) < top_k and i not in all_result:
                        all_result.append(i)
                    elif len(all_result) >= 5:
                        break
                
                p_all = []
                
                for i in all_result:
                    profile = {}
                    profile['item_id'] = int(i)
                    p_all.append(profile)
                
                r = get_all_profiles(p_all)
                
                return r, 200

        except Exception as e:
            print(e)
            return "Internal server error", 500



@api.route('/popularity')
class RecommenderPopularityBased(Resource):
    @api.response(200, "OK")
    @api.response(500, "Internal Server Error")
    @api.doc(description="Each not registered user could have own recommended items based on most-viewed item. Return 10 items")
    def get(self):
        """Recommendation system based on most-viewed item"""
        
        # only select the active products
        sql = """SELECT * FROM item WHERE status = 1"""
        
        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                cur = conn.cursor()

                r1 = cur.execute(sql)
                result = r1.fetchall()
                item = pd.DataFrame(result)
                
                ####取top-k个
                k = 8
                p_all = []
                all_result = item[['item_id',"view"]].sort_values("view",ascending=False)[:k]['item_id'].values.tolist()
                
                for i in all_result:
                    profile = {}
                    profile['item_id'] = int(i)
                    p_all.append(profile)
                r = get_all_profiles(p_all)
                
                return r
        
        except Exception as e:
            print(e)
            return "Internal server error", 500



@api.route('/viewhistory')
class RecommenderViewHistoryBased(Resource):
    @api.response(200, "OK")
    @api.response(204, "New user, no view history yet")
    @api.response(403, "No authorization token / token invalid / token expired")
    @api.response(404, "Invalid user_id")
    @api.expect(models.token_header)
    @api.doc(description="Each user could have own recommended items based on view history. Return 5 items")
    def get(self):
        """Recommendation based on view history"""

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return "No authorization token", 403
        
        T = Token()
        
        identity = T.check(auth_header)
        
        if not identity:
            return "Wrong token", 403
        
        sql = """
                SELECT view_history.*
                FROM view_history, item
                WHERE view_history.item_id = item.item_id 
                AND item.status = 1
            """
        
        sql2 ="""
                SELECT item.*
                FROM item
                WHERE item.status = 1
            """
        
        sql3 = """
                SELECT laptop.*
                FROM laptop, item
                WHERE laptop.item_id = item.item_id 
                AND item.status = 1
            """
        
        u_id = identity['user_id']
        
        #####item-feature
        fea = [
            'item_id', 'price',
            'cpu_lithography', 'cpu_cache', 'cpu_base_speed', 'cpu_boost_speed',
            'cpu_cores', 'cpu_tdp', 'cpu_rating',
            'cpu_integrated_video_id', 'display_size',
            'display_horizontal_resolution', 'display_vertical_resolution',
            'display_sRGB',
            'memory_size', 'memory_speed',
            'primary_storage_cap',
            'primary_storage_read_speed',
            'gpu_lithography', 'gpu_shaders', 'gpu_base_speed',
            'gpu_boost_speed', 'gpu_shader_speed', 'gpu_memory_speed',
            'gpu_memory_bandwidth', 'gpu_memory_size',
            'gpu_rating',
            'wireless_card_speed',
            'chassis_height_cm', 'chassis_height_inch',
            'chassis_depth_cm', 'chassis_depth_inch', 'chassis_width_cm',
            'chassis_width_inch', 'chassis_weight_kg', 'chassis_weight_lb',
            'battery_capacity',
            'config_score',
            'battery_life_raw', 'total_storage_capacity'
        ]
        

        try:
            with sqlite3.connect(os.environ.get("DB_FILE")) as conn:
                conn.row_factory = lambda C, R: {c[0]: R[i] for i, c in enumerate(C.description)}
                
                cur = conn.cursor()
                cu1 = conn.cursor()
                cu2 = conn.cursor()
                
                r = cur.execute(sql)
                r2 =cu1.execute(sql2)
                r3 = cu2.execute(sql3)
                
                result,result1,result2 = r.fetchall(),r2.fetchall(),r3.fetchall()
                
                view_history,item,laptop = pd.DataFrame(result),pd.DataFrame(result1),pd.DataFrame(result2)
            
                # print(view_history)


                most_view = pd.DataFrame(
                    view_history.groupby('user_id')['item_id'].agg(lambda x: stats.mode(x)[0])).reset_index()
                

                # if this user does not have any view history
                # then return 204
                if not most_view[most_view['user_id']==u_id]['item_id'].any():
                    return "New user, no view history", 204 


                # for users with view history
                i_id = most_view[most_view['user_id']==u_id]['item_id'].values[0]
                
                all_lap = item.merge(laptop, on='item_id', how='left')
                
                item_fea = all_lap[fea].set_index('item_id')
                
                new_item = MinMaxScaler().fit_transform(item_fea)
                
                new_df = pd.DataFrame(new_item, columns=fea[1:])
                
                df = pd.DataFrame(all_lap['item_id'])
                
                nor_item = pd.concat((new_df, df), axis=1).set_index("item_id")
                
                def build_xy(item_id1, item_id2):
                    bool_array = nor_item.loc[item_id1].notnull() & nor_item.loc[item_id2].notnull()
                    return nor_item.loc[item_id1, bool_array], nor_item.loc[item_id2, bool_array]
                
                ###皮尔逊相关系数计算item相似度
                def pearson(item_id1, item_id2):
                    x, y = build_xy(item_id1, item_id2)
                    mean1, mean2 = x.mean(), y.mean()
                    denominator = (sum((x - mean1) ** 2) * sum((y - mean2) ** 2)) ** 0.5
                    try:
                        value = sum((x - mean1) * (y - mean2)) / denominator
                    except ZeroDivisionError:
                        value = 0
                    return value
                
                #####找出K邻近物品
                def computeNearestNeighbor(item_id, k):
                    return nor_item.drop(item_id).index.to_series().apply(pearson, args=(item_id,)).nlargest(k)
                
                KNN_item = computeNearestNeighbor(i_id,5).index.tolist()
                p_all = []
                
                for i in KNN_item:
                    profile = {}
                    profile['item_id'] = int(i)
                    p_all.append(profile)
                r = get_all_profiles(p_all)
                return r

        except Exception as e:
            print(e)
            return "Internal server error", 500