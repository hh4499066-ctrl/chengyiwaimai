package com.chengyiwaimai.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.DeliveryOrderEntity;
import com.chengyiwaimai.entity.DishEntity;
import com.chengyiwaimai.entity.MerchantEntity;
import com.chengyiwaimai.entity.OrderItemEntity;
import com.chengyiwaimai.mapper.DeliveryOrderMapper;
import com.chengyiwaimai.mapper.DishMapper;
import com.chengyiwaimai.mapper.MerchantMapper;
import com.chengyiwaimai.mapper.OrderItemMapper;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class DemoStore {
    public static final String WAIT_PAY = "待支付";
    public static final String WAIT_MERCHANT_ACCEPT = "待商家接单";
    public static final String MERCHANT_ACCEPTED = "商家已接单";
    public static final String CANCELED = "已取消";
    public static final String MERCHANT_READY = "商家已出餐";
    public static final String RIDER_ACCEPTED = "骑手已接单";
    public static final String RIDER_PICKED = "骑手已取餐";
    public static final String COMPLETED = "已完成";

    private final MerchantMapper merchantMapper;
    private final DishMapper dishMapper;
    private final DeliveryOrderMapper deliveryOrderMapper;
    private final OrderItemMapper orderItemMapper;
    private final List<CartItem> cartItems = new CopyOnWriteArrayList<>();
    private final List<Address> addresses = new CopyOnWriteArrayList<>();
    private final List<Coupon> coupons = new CopyOnWriteArrayList<>();
    private final List<Review> reviews = new CopyOnWriteArrayList<>();
    private final List<Category> categories = new CopyOnWriteArrayList<>();

    public DemoStore(
            MerchantMapper merchantMapper,
            DishMapper dishMapper,
            DeliveryOrderMapper deliveryOrderMapper,
            OrderItemMapper orderItemMapper
    ) {
        this.merchantMapper = merchantMapper;
        this.dishMapper = dishMapper;
        this.deliveryOrderMapper = deliveryOrderMapper;
        this.orderItemMapper = orderItemMapper;
        cartItems.add(new CartItem(101L, "招牌红烧牛肉面", 1, new BigDecimal("28.50")));
        cartItems.add(new CartItem(103L, "冰柠檬茶", 1, new BigDecimal("9.00")));
        addresses.add(new Address(1L, "张同学", "13800000001", "学校东门 3 号宿舍楼 502", true));
        addresses.add(new Address(2L, "李同学", "13900000002", "实验楼 A 座大厅", false));
        coupons.add(new Coupon(1L, "新人首单立减券", new BigDecimal("20.00"), new BigDecimal("8.00"), "可使用"));
        coupons.add(new Coupon(2L, "校园夜宵满减券", new BigDecimal("35.00"), new BigDecimal("6.00"), "可使用"));
        reviews.add(new Review(1L, "CY202605120001", 5, "味道不错，配送很快。", "感谢支持，欢迎再次下单。"));
        categories.add(new Category(1L, 1L, "招牌推荐", 1));
        categories.add(new Category(2L, 1L, "热销单品", 2));
        categories.add(new Category(3L, 1L, "饮品", 3));
    }

    public List<Merchant> merchants() {
        return merchantMapper.selectList(Wrappers.<MerchantEntity>lambdaQuery()
                        .eq(MerchantEntity::getAuditStatus, "approved")
                        .eq(MerchantEntity::getBusinessStatus, "open")
                        .orderByDesc(MerchantEntity::getRating))
                .stream()
                .map(this::toMerchant)
                .toList();
    }

    public List<Dish> dishes(Long merchantId) {
        return dishMapper.selectList(Wrappers.<DishEntity>lambdaQuery()
                        .eq(DishEntity::getMerchantId, merchantId)
                        .eq(DishEntity::getStatus, "on_sale")
                        .orderByAsc(DishEntity::getId))
                .stream()
                .map(this::toDish)
                .toList();
    }

    public Dish saveDish(Dish dish) {
        DishEntity entity = new DishEntity();
        entity.setId(dish.id());
        entity.setMerchantId(dish.merchantId());
        entity.setName(dish.name());
        entity.setDescription(dish.description());
        entity.setPrice(dish.price());
        entity.setStock(999);
        entity.setStatus("on_sale");
        entity.setCategoryName("默认分类");
        if (entity.getId() == null) {
            dishMapper.insert(entity);
        } else {
            dishMapper.updateById(entity);
        }
        return toDish(entity);
    }

    public List<CartItem> cartItems() {
        return new ArrayList<>(cartItems);
    }

    public CartItem addCartItem(CartItem item) {
        cartItems.add(item);
        return item;
    }

    public void clearCart() {
        cartItems.clear();
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        if (request.merchantId() == null) {
            throw new BizException("商家不能为空");
        }
        MerchantEntity merchant = merchantMapper.selectById(request.merchantId());
        if (merchant == null) {
            throw new BizException("商家不存在");
        }
        List<CartItem> items = request.items() == null || request.items().isEmpty() ? cartItems() : request.items();
        if (items.isEmpty()) {
            throw new BizException("购物车为空");
        }

        String orderId = nextOrderId();
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            if (item.quantity() == null || item.quantity() <= 0) {
                throw new BizException("商品数量不合法");
            }
            DishEntity dish = dishMapper.selectById(item.dishId());
            if (dish == null || !"on_sale".equals(dish.getStatus())) {
                throw new BizException("商品不存在或已下架");
            }
            if (!request.merchantId().equals(dish.getMerchantId())) {
                throw new BizException("订单商品不属于当前商家");
            }
            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderId(orderId);
            orderItem.setDishId(dish.getId());
            orderItem.setDishName(dish.getName());
            orderItem.setQuantity(item.quantity());
            orderItem.setPrice(dish.getPrice());
            orderItemMapper.insert(orderItem);
            total = total.add(dish.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }
        total = total.add(new BigDecimal("1.50"));

        DeliveryOrderEntity order = new DeliveryOrderEntity();
        order.setId(orderId);
        order.setUserId(1L);
        order.setMerchantId(merchant.getId());
        order.setTotalAmount(total);
        order.setAddress(request.address());
        order.setStatus(WAIT_PAY);
        deliveryOrderMapper.insert(order);
        clearCart();
        return toOrder(order, merchant.getName());
    }

    public Order payOrder(String orderId) {
        return updateStatus(orderId, WAIT_PAY, WAIT_MERCHANT_ACCEPT);
    }

    public Order merchantAccept(String orderId) {
        return updateStatus(orderId, WAIT_MERCHANT_ACCEPT, MERCHANT_ACCEPTED);
    }

    public Order merchantCancel(String orderId) {
        return updateStatus(orderId, WAIT_MERCHANT_ACCEPT, CANCELED);
    }

    public Order merchantReady(String orderId) {
        return updateStatus(orderId, MERCHANT_ACCEPTED, MERCHANT_READY);
    }

    public Order riderAccept(String orderId) {
        return updateStatus(orderId, MERCHANT_READY, RIDER_ACCEPTED);
    }

    public Order riderPickup(String orderId) {
        return updateStatus(orderId, RIDER_ACCEPTED, RIDER_PICKED);
    }

    public Order riderDelivered(String orderId) {
        return updateStatus(orderId, RIDER_PICKED, COMPLETED);
    }

    public List<Order> orders() {
        return deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                        .orderByDesc(DeliveryOrderEntity::getCreateTime))
                .stream()
                .map(this::toOrder)
                .toList();
    }

    public int cancelTimeoutUnpaidOrders() {
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(15);
        List<DeliveryOrderEntity> timeoutOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getStatus, WAIT_PAY)
                .le(DeliveryOrderEntity::getCreateTime, deadline));
        for (DeliveryOrderEntity order : timeoutOrders) {
            order.setStatus(CANCELED);
            deliveryOrderMapper.updateById(order);
        }
        return timeoutOrders.size();
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

    private Order updateStatus(String orderId, String expected, String nextStatus) {
        DeliveryOrderEntity order = deliveryOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BizException("订单不存在");
        }
        if (!expected.equals(order.getStatus())) {
            throw new BizException("当前订单状态不允许此操作");
        }
        order.setStatus(nextStatus);
        deliveryOrderMapper.updateById(order);
        return toOrder(order);
    }

    private Order toOrder(DeliveryOrderEntity entity) {
        MerchantEntity merchant = entity.getMerchantId() == null ? null : merchantMapper.selectById(entity.getMerchantId());
        return toOrder(entity, merchant == null ? "未知商家" : merchant.getName());
    }

    private Order toOrder(DeliveryOrderEntity entity, String merchantName) {
        return new Order(entity.getId(), entity.getMerchantId(), merchantName, entity.getStatus(), entity.getTotalAmount(), entity.getAddress(), entity.getCreateTime());
    }

    private Merchant toMerchant(MerchantEntity entity) {
        return new Merchant(entity.getId(), entity.getName(), entity.getCategory(), entity.getRating(), "800m", "25分钟");
    }

    private Dish toDish(DishEntity entity) {
        return new Dish(entity.getId(), entity.getMerchantId(), entity.getName(), entity.getDescription(), entity.getPrice(), 0);
    }

    private String nextOrderId() {
        return "CY" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
    }
}
