package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.Category;
import com.chengyiwaimai.model.Models.Dish;
import com.chengyiwaimai.security.AuthContext;
import com.chengyiwaimai.security.CurrentUser;
import com.chengyiwaimai.service.BusinessService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/merchant-center")
public class MerchantCenterController {
    private final BusinessService store;

    public MerchantCenterController(BusinessService store) {
        this.store = store;
    }

    @PostMapping("/apply")
    public ApiResponse<Map<String, Object>> apply(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("status", "pending", "message", "入驻申请已提交", "data", body));
    }

    @GetMapping("/audit-status")
    public ApiResponse<Map<String, Object>> auditStatus() {
        return ApiResponse.ok(Map.of("status", "approved", "message", "店铺审核已通过"));
    }

    @GetMapping("/workbench")
    public ApiResponse<Map<String, Object>> workbench() {
        return ApiResponse.ok(store.merchantStats());
    }

    @GetMapping("/orders")
    public ApiResponse<?> orders(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantOrders(user));
    }

    @GetMapping("/dishes")
    public ApiResponse<?> dishes(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantDishes(user));
    }

    @PostMapping("/dishes")
    public ApiResponse<?> saveDish(HttpServletRequest request, @RequestBody Dish dish) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.saveDish(user, dish));
    }

    @GetMapping("/categories")
    public ApiResponse<?> categories(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.categories(user));
    }

    @PostMapping("/categories")
    public ApiResponse<?> saveCategory(HttpServletRequest request, @RequestBody Category category) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.saveCategory(user, category));
    }

    @GetMapping("/business-settings")
    public ApiResponse<Map<String, Object>> businessSettings() {
        return ApiResponse.ok(Map.of("businessStatus", "营业中", "openTime", "09:00", "closeTime", "22:30", "deliveryRange", "5km"));
    }

    @PostMapping("/business-settings")
    public ApiResponse<Map<String, Object>> saveBusinessSettings(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("saved", true, "settings", body));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.ok(store.merchantStats());
    }

    @GetMapping("/reviews")
    public ApiResponse<?> reviews(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantReviews(user));
    }

    @PostMapping("/reviews/{reviewId}/reply")
    public ApiResponse<?> replyReview(HttpServletRequest request, @PathVariable Long reviewId, @RequestBody Map<String, Object> body) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.replyReview(user, reviewId, String.valueOf(body.getOrDefault("reply", "感谢支持"))));
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile() {
        return ApiResponse.ok(Map.of("name", "老刘家招牌牛肉面", "phone", "020-88886666", "address", "学校东门美食街 12 号", "status", "营业中"));
    }

    @PostMapping("/profile")
    public ApiResponse<Map<String, Object>> saveProfile(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("saved", true, "profile", body));
    }
}
