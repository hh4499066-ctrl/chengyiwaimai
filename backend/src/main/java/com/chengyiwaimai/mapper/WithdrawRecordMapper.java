package com.chengyiwaimai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chengyiwaimai.entity.WithdrawRecordEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface WithdrawRecordMapper extends BaseMapper<WithdrawRecordEntity> {
    @Select("""
            SELECT COALESCE(SUM(amount), 0)
            FROM withdraw_record
            WHERE owner_type = 'merchant'
              AND owner_id = #{merchantId}
              AND status IN ('submitted', 'processing', 'approved', 'completed')
            """)
    BigDecimal sumMerchantOccupiedWithdrawAmount(@Param("merchantId") Long merchantId);

    @Select("""
            SELECT COALESCE(SUM(amount), 0)
            FROM withdraw_record
            WHERE owner_type = 'merchant'
              AND owner_id = #{merchantId}
              AND status IN ('submitted', 'processing', 'approved')
            """)
    BigDecimal sumMerchantPendingWithdrawAmount(@Param("merchantId") Long merchantId);

    @Select("""
            SELECT COALESCE(SUM(amount), 0)
            FROM withdraw_record
            WHERE owner_type = 'merchant'
              AND owner_id = #{merchantId}
              AND status = 'completed'
            """)
    BigDecimal sumMerchantWithdrawnAmount(@Param("merchantId") Long merchantId);
}
