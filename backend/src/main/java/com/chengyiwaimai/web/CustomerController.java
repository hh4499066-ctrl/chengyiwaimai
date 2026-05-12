package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.Address;
import com.chengyiwaimai.model.Models.CartItem;
import com.chengyiwaimai.model.Models.Review;
import com.chengyiwaimai.security.AuthContext;
import com.chengyiwaimai.security.CurrentUser;
import com.chengyiwaimai.service.BusinessService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/customer")
public class CustomerController {
    private final BusinessService store;

    public CustomerController(BusinessService store) {
        this.store = store;
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(Map.of("nickname", "橙意用户", "phone", user.phone(), "balance", 128.5, "points", 3450));
    }

    @GetMapping("/addresses")
    public ApiResponse<?> addresses(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.addresses(user));
    }

    @PostMapping("/addresses")
    public ApiResponse<?> saveAddress(HttpServletRequest request, @RequestBody Address address) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.saveAddress(user, address));
    }

    @GetMapping("/coupons")
    public ApiResponse<?> coupons() {
        return ApiResponse.ok(store.coupons());
    }

    @GetMapping("/cart")
    public ApiResponse<?> cart(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.cartItems(user.userId()));
    }

    @PostMapping("/cart")
    public ApiResponse<?> addCart(HttpServletRequest request, @RequestBody CartItem item) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.addCartItem(user.userId(), item));
    }

    @PutMapping("/cart/{dishId}")
    public ApiResponse<?> updateCart(HttpServletRequest request, @PathVariable Long dishId, @RequestBody CartItem item) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.updateCartItem(user.userId(), dishId, item.quantity()));
    }

    @DeleteMapping("/cart/{dishId}")
    public ApiResponse<Map<String, Object>> deleteCartItem(HttpServletRequest request, @PathVariable Long dishId) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        store.deleteCartItem(user.userId(), dishId);
        return ApiResponse.ok(Map.of("deleted", true));
    }

    @DeleteMapping("/cart")
    public ApiResponse<Map<String, Object>> clearCart(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        store.clearCart(user.userId());
        return ApiResponse.ok(Map.of("cleared", true));
    }

    @GetMapping("/reviews")
    public ApiResponse<?> reviews(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.reviews(user));
    }

    @PostMapping("/reviews")
    public ApiResponse<?> saveReview(HttpServletRequest request, @RequestBody Review review) {
        CurrentUser user = AuthContext.requireRole(request, "customer");
        return ApiResponse.ok(store.saveReview(user, review));
    }
}
