package com.chengyiwaimai.web;

import com.chengyiwaimai.common.ApiResponse;
import com.chengyiwaimai.model.Models.Dish;
import com.chengyiwaimai.model.Models.Merchant;
import com.chengyiwaimai.service.BusinessService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/merchants")
public class MerchantController {
    private final BusinessService store;

    public MerchantController(BusinessService store) {
        this.store = store;
    }

    @GetMapping
    public ApiResponse<List<Merchant>> list() {
        return ApiResponse.ok(store.merchants());
    }

    @GetMapping("/{merchantId}/dishes")
    public ApiResponse<List<Dish>> dishes(@PathVariable Long merchantId) {
        return ApiResponse.ok(store.dishes(merchantId));
    }
}
