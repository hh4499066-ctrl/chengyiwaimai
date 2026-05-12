package com.chengyiwaimai.service;

import com.chengyiwaimai.model.Models.Address;
import com.chengyiwaimai.model.Models.CartItem;
import com.chengyiwaimai.model.Models.Category;
import com.chengyiwaimai.model.Models.Coupon;
import com.chengyiwaimai.model.Models.CreateOrderRequest;
import com.chengyiwaimai.model.Models.Dish;
import com.chengyiwaimai.model.Models.Merchant;
import com.chengyiwaimai.model.Models.Order;
import com.chengyiwaimai.model.Models.Review;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DemoStore {
    private final List<Merchant> merchants = new ArrayList<>(List.of(
            new Merchant(1L, "老刘家招牌牛肉面", "面食简餐", new BigDecimal("4.8"), "800m", "25分钟"),
            new Merchant(2L, "橙意轻食研究所", "轻食沙拉", new BigDecimal("4.9"), "1.2km", "32分钟")
    ));
    private final List<Dish> dishes = new ArrayList<>(List.of(
            new Dish(101L, 1L, "招牌红烧牛肉面", "慢炖牛腱肉，搭配手工拉面和秘制红油。", new BigDecimal("28.5"), 642),
            new Dish(102L, 1L, "番茄肥牛拌面", "酸甜番茄汤底，肥牛鲜嫩，适合晚餐。", new BigDecimal("26.0"), 418),
            new Dish(103L, 1L, "冰柠檬茶", "清爽解腻，少冰少糖可选。", new BigDecimal("9.0"), 899)
    ));
    private final Map<String, Order> orders = new LinkedHashMap<>();
    private final List<CartItem> cartItems = new ArrayList<>(List.of(
            new CartItem(101L, "招牌红烧牛肉面", 1, new BigDecimal("28.5")),
            new CartItem(103L, "冰柠檬茶", 1, new BigDecimal("9.0"))
    ));
    private final List<Address> addresses = new ArrayList<>(List.of(
            new Address(1L, "张同学", "13800000001", "学校东门 3 号宿舍楼 502", true),
            new Address(2L, "李同学", "13900000002", "实验楼 A 座大厅", false)
    ));
    private final List<Coupon> coupons = new ArrayList<>(List.of(
            new Coupon(1L, "新人首单立减券", new BigDecimal("20.00"), new BigDecimal("8.00"), "可使用"),
            new Coupon(2L, "校园夜宵满减券", new BigDecimal("35.00"), new BigDecimal("6.00"), "可使用")
    ));
    private final List<Review> reviews = new ArrayList<>(List.of(
            new Review(1L, "CY202605120001", 5, "味道不错，配送很快。", "感谢支持，欢迎再次下单。")
    ));
    private final List<Category> categories = new ArrayList<>(List.of(
            new Category(1L, 1L, "招牌推荐", 1),
            new Category(2L, 1L, "热销单品", 2),
            new Category(3L, 1L, "饮品", 3)
    ));

    public List<Merchant> merchants() {
        return merchants;
    }

    public List<Dish> dishes(Long merchantId) {
        return dishes.stream().filter(dish -> dish.merchantId().equals(merchantId)).toList();
    }

    public Dish saveDish(Dish dish) {
        Dish next = new Dish(dish.id() == null ? System.currentTimeMillis() : dish.id(), dish.merchantId(), dish.name(), dish.description(), dish.price(), dish.sales() == null ? 0 : dish.sales());
        dishes.add(next);
        return next;
    }

    public List<CartItem> cartItems() {
        return cartItems;
    }

    public CartItem addCartItem(CartItem item) {
        cartItems.add(item);
        return item;
    }

    public void clearCart() {
        cartItems.clear();
    }

    public Order createOrder(CreateOrderRequest request) {
        String id = "CY" + System.currentTimeMillis();
        List<CartItem> items = request.items() == null || request.items().isEmpty() ? cartItems : request.items();
        BigDecimal total = items.stream()
                .map(item -> item.price().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(new BigDecimal("1.5"));
        Merchant merchant = merchants.stream().filter(m -> m.id().equals(request.merchantId())).findFirst().orElse(merchants.get(0));
        Order order = new Order(id, merchant.id(), merchant.name(), "待支付", total, request.address(), LocalDateTime.now());
        orders.put(id, order);
        return order;
    }

    public Order updateStatus(String orderId, String status) {
        Order old = orders.get(orderId);
        if (old == null) {
            old = new Order(orderId, 1L, "老刘家招牌牛肉面", "待支付", new BigDecimal("43.0"), "学校东门 3 号宿舍楼 502", LocalDateTime.now());
        }
        Order next = new Order(old.id(), old.merchantId(), old.merchantName(), status, old.totalAmount(), old.address(), old.createTime());
        orders.put(orderId, next);
        return next;
    }

    public List<Order> orders() {
        if (orders.isEmpty()) {
            updateStatus("CY202605120001", "骑手配送中");
        }
        return new ArrayList<>(orders.values());
    }

    public List<Address> addresses() {
        return addresses;
    }

    public Address saveAddress(Address address) {
        Address next = new Address(address.id() == null ? System.currentTimeMillis() : address.id(), address.receiver(), address.phone(), address.detail(), Boolean.TRUE.equals(address.isDefault()));
        addresses.add(next);
        return next;
    }

    public List<Coupon> coupons() {
        return coupons;
    }

    public List<Review> reviews() {
        return reviews;
    }

    public Review saveReview(Review review) {
        Review next = new Review(System.currentTimeMillis(), review.orderId(), review.rating(), review.content(), null);
        reviews.add(next);
        return next;
    }

    public List<Category> categories(Long merchantId) {
        return categories.stream().filter(category -> category.merchantId().equals(merchantId)).toList();
    }

    public Category saveCategory(Category category) {
        Category next = new Category(category.id() == null ? System.currentTimeMillis() : category.id(), category.merchantId(), category.name(), category.sort());
        categories.add(next);
        return next;
    }

    public Map<String, Object> merchantStats() {
        return Map.of(
                "todayIncome", new BigDecimal("2840.50"),
                "todayOrders", 105,
                "conversionRate", "18.5%",
                "refundOrders", 2
        );
    }

    public Map<String, Object> riderStats() {
        return Map.of(
                "todayIncome", new BigDecimal("284.50"),
                "todayOrders", 42,
                "level", "黄金骑手",
                "score", "4.8"
        );
    }
}
