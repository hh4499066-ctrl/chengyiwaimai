package com.chengyiwaimai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chengyiwaimai.entity.UserWalletEntity;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;

@Mapper
public interface UserWalletMapper extends BaseMapper<UserWalletEntity> {
    @Insert("""
            INSERT INTO user_wallet(user_id, balance, frozen_amount)
            VALUES(#{userId}, #{balance}, 0)
            ON DUPLICATE KEY UPDATE user_id = user_id
            """)
    int ensureWallet(@Param("userId") Long userId, @Param("balance") BigDecimal balance);

    @Update("""
            UPDATE user_wallet
            SET balance = balance - #{amount},
                update_time = NOW()
            WHERE user_id = #{userId}
              AND balance >= #{amount}
            """)
    int deductBalance(@Param("userId") Long userId, @Param("amount") BigDecimal amount);

    @Update("""
            UPDATE user_wallet
            SET balance = balance + #{amount},
                update_time = NOW()
            WHERE user_id = #{userId}
            """)
    int refundBalance(@Param("userId") Long userId, @Param("amount") BigDecimal amount);
}
