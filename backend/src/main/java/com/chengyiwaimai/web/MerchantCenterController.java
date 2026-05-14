package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.Category;
import com.chengyiwaimai.model.Models.Dish;
import com.chengyiwaimai.model.Models.DishStatusRequest;
import com.chengyiwaimai.model.Models.DishStockRequest;
import com.chengyiwaimai.model.Models.WithdrawRequest;
import com.chengyiwaimai.security.AuthContext;
import com.chengyiwaimai.security.CurrentUser;
import com.chengyiwaimai.service.BusinessService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
    public ApiResponse<Map<String, Object>> workbench(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantStats(user));
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

    @PatchMapping("/dishes/{dishId}/status")
    public ApiResponse<?> updateDishStatus(HttpServletRequest request, @PathVariable Long dishId, @RequestBody DishStatusRequest body) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.updateDishStatus(user, dishId, body.status()));
    }

    @PatchMapping("/dishes/{dishId}/stock")
    public ApiResponse<?> updateDishStock(HttpServletRequest request, @PathVariable Long dishId, @RequestBody DishStockRequest body) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.updateDishStock(user, dishId, body.stock()));
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

    @PutMapping("/categories/{categoryId}")
    public ApiResponse<?> updateCategory(HttpServletRequest request, @PathVariable Long categoryId, @RequestBody Category category) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.updateCategory(user, categoryId, category));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ApiResponse<?> deleteCategory(HttpServletRequest request, @PathVariable Long categoryId) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        store.deleteCategory(user, categoryId);
        return ApiResponse.ok(Map.of("deleted", true));
    }

    @GetMapping("/business-settings")
    public ApiResponse<Map<String, Object>> businessSettings(HttpServletRequest request) {
        if (request != null) {
            CurrentUser user = AuthContext.requireRole(request, "merchant");
            return ApiResponse.ok(store.businessSettings(user));
        }
        return ApiResponse.ok(Map.of("businessStatus", "营业中", "openTime", "09:00", "closeTime", "22:30", "deliveryRange", "5km"));
    }

    @PostMapping("/business-settings")
    public ApiResponse<Map<String, Object>> saveBusinessSettings(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        if (request != null) {
            CurrentUser user = AuthContext.requireRole(request, "merchant");
            return ApiResponse.ok(store.saveBusinessSettings(user, body));
        }
        return ApiResponse.ok(Map.of("saved", true, "settings", body));
    }

    @GetMapping("/marketing")
    public ApiResponse<?> marketing(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantMarketing(user));
    }

    @PostMapping("/marketing")
    public ApiResponse<?> saveMarketing(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.saveMerchantMarketing(user, body));
    }

    @PutMapping("/marketing/{id}")
    public ApiResponse<?> updateMarketing(HttpServletRequest request, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.updateMerchantMarketing(user, id, body));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantStats(user));
    }

    @PostMapping("/withdraw")
    public ApiResponse<Map<String, Object>> withdraw(HttpServletRequest request, @RequestBody WithdrawRequest body) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantWithdraw(user, body.amount(), body.accountNo()));
    }

    @GetMapping("/withdraw-records")
    public ApiResponse<?> withdrawRecords(HttpServletRequest request) {
        CurrentUser user = AuthContext.requireRole(request, "merchant");
        return ApiResponse.ok(store.merchantWithdrawRecords(user));
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
