package com.chengyiwaimai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("user_coupon")
public class UserCouponEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long couponId;
    private Long merchantId;
    private String status;
    private LocalDateTime validStart;
    private LocalDateTime validEnd;
    private String usedOrderId;
    private LocalDateTime usedTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCouponId() {
        return couponId;
    }

    public void setCouponId(Long couponId) {
        this.couponId = couponId;
    }

    public Long getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Long merchantId) {
        this.merchantId = merchantId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getValidStart() {
        return validStart;
    }

    public void setValidStart(LocalDateTime validStart) {
        this.validStart = validStart;
    }

    public LocalDateTime getValidEnd() {
        return validEnd;
    }

    public void setValidEnd(LocalDateTime validEnd) {
        this.validEnd = validEnd;
    }

    public String getUsedOrderId() {
        return usedOrderId;
    }

    public void setUsedOrderId(String usedOrderId) {
        this.usedOrderId = usedOrderId;
    }

    public LocalDateTime getUsedTime() {
        return usedTime;
    }

    public void setUsedTime(LocalDateTime usedTime) {
        this.usedTime = usedTime;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
