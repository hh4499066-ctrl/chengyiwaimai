package com.chengyiwaimai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chengyiwaimai.entity.UserPointsEntity;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserPointsMapper extends BaseMapper<UserPointsEntity> {
    @Insert("""
            INSERT INTO user_points(user_id, points)
            VALUES(#{userId}, #{points})
            ON DUPLICATE KEY UPDATE user_id = user_id
            """)
    int ensurePoints(@Param("userId") Long userId, @Param("points") Integer points);

    @Update("""
            UPDATE user_points
            SET points = points + #{points},
                update_time = NOW()
            WHERE user_id = #{userId}
            """)
    int addPoints(@Param("userId") Long userId, @Param("points") Integer points);
}
