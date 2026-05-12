package com.chengyiwaimai.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class Models {
    private Models() {
    }

    public record LoginRequest(String phone, String code, String password, String role) {
    }

    public record LoginResult(String token, String role, String nickname) {
    }

    public record Merchant(Long id, String name, String category, BigDecimal rating, String distance, String deliveryTime) {
    }

    public record Dish(Long id, Long merchantId, String name, String description, BigDecimal price, Integer sales) {
    }

    public record CartItem(Long dishId, String name, Integer quantity, BigDecimal price) {
    }

    public record CreateOrderRequest(Long merchantId, String address, List<CartItem> items) {
    }

    public record Order(String id, Long merchantId, String merchantName, String status, BigDecimal totalAmount, String address, LocalDateTime createTime) {
    }

    public record RiderLocation(String orderId, BigDecimal longitude, BigDecimal latitude) {
    }

    public record Address(Long id, String receiver, String phone, String detail, Boolean isDefault) {
    }

    public record Coupon(Long id, String name, BigDecimal thresholdAmount, BigDecimal discountAmount, String status) {
    }

    public record Review(Long id, String orderId, Integer rating, String content, String reply) {
    }

    public record Category(Long id, Long merchantId, String name, Integer sort) {
    }

    public record WithdrawRequest(BigDecimal amount, String accountNo) {
    }
}
