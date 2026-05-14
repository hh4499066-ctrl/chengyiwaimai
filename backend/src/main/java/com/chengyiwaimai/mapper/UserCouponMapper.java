package com.chengyiwaimai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chengyiwaimai.entity.UserCouponEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserCouponMapper extends BaseMapper<UserCouponEntity> {
    @Select("""
            SELECT uc.id AS userCouponId,
                   uc.merchant_id AS merchantId,
                   uc.valid_start AS validStart,
                   uc.valid_end AS validEnd,
                   c.id AS couponId,
                   c.name AS name,
                   c.threshold_amount AS thresholdAmount,
                   c.discount_amount AS discountAmount,
                   c.status AS couponStatus,
                   uc.status AS status
            FROM user_coupon uc
            JOIN coupon c ON c.id = uc.coupon_id AND c.deleted = 0
            WHERE uc.user_id = #{userId}
              AND uc.status = 'claimed'
              AND c.status = 'enabled'
              AND (uc.valid_start IS NULL OR uc.valid_start <= NOW())
              AND (uc.valid_end IS NULL OR uc.valid_end >= NOW())
            ORDER BY uc.valid_end IS NULL, uc.valid_end ASC, uc.id ASC
            """)
    List<Map<String, Object>> selectAvailableCoupons(@Param("userId") Long userId);
}
