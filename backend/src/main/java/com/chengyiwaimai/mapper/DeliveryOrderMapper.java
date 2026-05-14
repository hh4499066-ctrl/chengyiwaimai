package com.chengyiwaimai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chengyiwaimai.entity.DeliveryOrderEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface DeliveryOrderMapper extends BaseMapper<DeliveryOrderEntity> {
    @Select("""
            SELECT COALESCE(SUM(COALESCE(total_amount, 0)), 0)
            FROM delivery_order
            WHERE deleted = 0
              AND merchant_id = #{merchantId}
              AND status NOT IN (#{waitPay}, #{canceled})
            """)
    BigDecimal sumMerchantEffectiveIncome(@Param("merchantId") Long merchantId,
                                           @Param("waitPay") String waitPay,
                                           @Param("canceled") String canceled);

    @Select("""
            SELECT COUNT(*)
            FROM delivery_order
            WHERE deleted = 0
              AND merchant_id = #{merchantId}
              AND status NOT IN (#{waitPay}, #{canceled})
            """)
    Long countMerchantEffectiveOrders(@Param("merchantId") Long merchantId,
                                      @Param("waitPay") String waitPay,
                                      @Param("canceled") String canceled);

    @Select("""
            SELECT COALESCE(SUM(COALESCE(total_amount, 0)), 0)
            FROM delivery_order
            WHERE deleted = 0
              AND merchant_id = #{merchantId}
              AND create_time >= #{start}
              AND create_time < #{end}
              AND status NOT IN (#{waitPay}, #{canceled})
            """)
    BigDecimal sumMerchantEffectiveIncomeBetween(@Param("merchantId") Long merchantId,
                                                 @Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end,
                                                 @Param("waitPay") String waitPay,
                                                 @Param("canceled") String canceled);

    @Select("""
            SELECT COUNT(*)
            FROM delivery_order
            WHERE deleted = 0
              AND merchant_id = #{merchantId}
              AND create_time >= #{start}
              AND create_time < #{end}
              AND status NOT IN (#{waitPay}, #{canceled})
            """)
    Long countMerchantEffectiveOrdersBetween(@Param("merchantId") Long merchantId,
                                             @Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end,
                                             @Param("waitPay") String waitPay,
                                             @Param("canceled") String canceled);

    @Select("""
            SELECT COUNT(*)
            FROM delivery_order
            WHERE deleted = 0
              AND merchant_id = #{merchantId}
              AND status = #{canceled}
            """)
    Long countMerchantCanceledOrders(@Param("merchantId") Long merchantId,
                                     @Param("canceled") String canceled);

    @Select("""
            SELECT
              COALESCE(SUM(CASE WHEN create_time >= #{todayStart} AND create_time < #{tomorrowStart} AND status NOT IN (#{waitPay}, #{canceled}) THEN COALESCE(total_amount, 0) ELSE 0 END), 0) AS todayGmv,
              COALESCE(SUM(CASE WHEN status NOT IN (#{waitPay}, #{canceled}) THEN COALESCE(total_amount, 0) ELSE 0 END), 0) AS totalGmv,
              COALESCE(SUM(CASE WHEN create_time >= #{todayStart} AND create_time < #{tomorrowStart} AND status NOT IN (#{waitPay}, #{canceled}) THEN 1 ELSE 0 END), 0) AS todayOrders,
              COALESCE(SUM(CASE WHEN status NOT IN (#{waitPay}, #{canceled}) THEN 1 ELSE 0 END), 0) AS totalOrders,
              COALESCE(SUM(CASE WHEN create_time >= #{todayStart} AND create_time < #{tomorrowStart} AND status = #{canceled} THEN 1 ELSE 0 END), 0) AS todayExceptionOrders,
              COALESCE(SUM(CASE WHEN status = #{canceled} THEN 1 ELSE 0 END), 0) AS totalExceptionOrders
            FROM delivery_order
            WHERE deleted = 0
            """)
    Map<String, Object> selectDashboardSummary(@Param("todayStart") LocalDateTime todayStart,
                                               @Param("tomorrowStart") LocalDateTime tomorrowStart,
                                               @Param("waitPay") String waitPay,
                                               @Param("canceled") String canceled);

    @Select("""
            SELECT
              DATE(create_time) AS date,
              COALESCE(SUM(CASE WHEN status NOT IN (#{waitPay}, #{canceled}) THEN COALESCE(total_amount, 0) ELSE 0 END), 0) AS gmv,
              COALESCE(SUM(CASE WHEN status NOT IN (#{waitPay}, #{canceled}) THEN 1 ELSE 0 END), 0) AS orders,
              COALESCE(SUM(CASE WHEN status = #{canceled} THEN 1 ELSE 0 END), 0) AS exceptionOrders
            FROM delivery_order
            WHERE deleted = 0
              AND create_time >= #{start}
              AND create_time < #{end}
            GROUP BY DATE(create_time)
            ORDER BY DATE(create_time)
            """)
    List<Map<String, Object>> selectDashboardDailyTrend(@Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end,
                                                        @Param("waitPay") String waitPay,
                                                        @Param("canceled") String canceled);

    @Select("""
            SELECT
              o.merchant_id AS merchantId,
              COALESCE(m.name, CONCAT('商家 ', o.merchant_id)) AS name,
              COUNT(*) AS orders,
              COALESCE(SUM(COALESCE(o.total_amount, 0)), 0) AS gmv
            FROM delivery_order o
            LEFT JOIN merchant m ON m.id = o.merchant_id AND m.deleted = 0
            WHERE o.deleted = 0
              AND o.merchant_id IS NOT NULL
              AND o.status NOT IN (#{waitPay}, #{canceled})
            GROUP BY o.merchant_id, m.name
            ORDER BY gmv DESC, orders DESC
            LIMIT 5
            """)
    List<Map<String, Object>> selectMerchantGmvTop5(@Param("waitPay") String waitPay,
                                                    @Param("canceled") String canceled);

    @Select("""
            SELECT
              o.rider_id AS riderId,
              COALESCE(u.nickname, CONCAT('骑手 ', o.rider_id)) AS name,
              COUNT(*) AS completedOrders,
              COUNT(*) * 4.50 AS income
            FROM delivery_order o
            LEFT JOIN sys_user u ON u.id = o.rider_id AND u.deleted = 0
            WHERE o.deleted = 0
              AND o.rider_id IS NOT NULL
              AND o.status = #{completed}
            GROUP BY o.rider_id, u.nickname
            ORDER BY completedOrders DESC, riderId ASC
            LIMIT 5
            """)
    List<Map<String, Object>> selectRiderCompletedTop5(@Param("completed") String completed);

    @Select("""
            SELECT COUNT(*)
            FROM delivery_order
            WHERE deleted = 0
              AND rider_id = #{riderId}
              AND status = #{completed}
            """)
    Long countRiderCompletedOrders(@Param("riderId") Long riderId,
                                   @Param("completed") String completed);
}
