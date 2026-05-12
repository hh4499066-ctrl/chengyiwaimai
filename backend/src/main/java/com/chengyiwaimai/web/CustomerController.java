package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.Address;
import com.chengyiwaimai.model.Models.CartItem;
import com.chengyiwaimai.model.Models.Review;
import com.chengyiwaimai.service.DemoStore;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/customer")
public class CustomerController {
    private final DemoStore store;

    public CustomerController(DemoStore store) {
        this.store = store;
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile() {
        return ApiResponse.ok(Map.of("nickname", "张同学", "phone", "13800000001", "balance", 128.5, "points", 3450));
    }

    @GetMapping("/addresses")
    public ApiResponse<?> addresses() {
        return ApiResponse.ok(store.addresses());
    }

    @PostMapping("/addresses")
    public ApiResponse<?> saveAddress(@RequestBody Address address) {
        return ApiResponse.ok(store.saveAddress(address));
    }

    @GetMapping("/coupons")
    public ApiResponse<?> coupons() {
        return ApiResponse.ok(store.coupons());
    }

    @GetMapping("/cart")
    public ApiResponse<?> cart() {
        return ApiResponse.ok(store.cartItems());
    }

    @PostMapping("/cart")
    public ApiResponse<?> addCart(@RequestBody CartItem item) {
        return ApiResponse.ok(store.addCartItem(item));
    }

    @DeleteMapping("/cart")
    public ApiResponse<Map<String, Object>> clearCart() {
        store.clearCart();
        return ApiResponse.ok(Map.of("cleared", true));
    }

    @GetMapping("/reviews")
    public ApiResponse<?> reviews() {
        return ApiResponse.ok(store.reviews());
    }

    @PostMapping("/reviews")
    public ApiResponse<?> saveReview(@RequestBody Review review) {
        return ApiResponse.ok(store.saveReview(review));
    }
}
