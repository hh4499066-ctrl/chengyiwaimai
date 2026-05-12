package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.Category;
import com.chengyiwaimai.model.Models.Dish;
import com.chengyiwaimai.service.DemoStore;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/merchant-center")
public class MerchantCenterController {
    private final DemoStore store;

    public MerchantCenterController(DemoStore store) {
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
    public ApiResponse<?> orders() {
        return ApiResponse.ok(store.orders());
    }

    @GetMapping("/dishes")
    public ApiResponse<?> dishes() {
        return ApiResponse.ok(store.dishes(1L));
    }

    @PostMapping("/dishes")
    public ApiResponse<?> saveDish(@RequestBody Dish dish) {
        return ApiResponse.ok(store.saveDish(dish));
    }

    @GetMapping("/categories")
    public ApiResponse<?> categories() {
        return ApiResponse.ok(store.categories(1L));
    }

    @PostMapping("/categories")
    public ApiResponse<?> saveCategory(@RequestBody Category category) {
        return ApiResponse.ok(store.saveCategory(category));
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
    public ApiResponse<?> reviews() {
        return ApiResponse.ok(store.reviews());
    }

    @PostMapping("/reviews/{reviewId}/reply")
    public ApiResponse<Map<String, Object>> replyReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(Map.of("reviewId", reviewId, "reply", body.getOrDefault("reply", "感谢支持")));
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
