package com.chengyiwaimai.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.CartItemEntity;
import com.chengyiwaimai.entity.DeliveryOrderEntity;
import com.chengyiwaimai.entity.DishEntity;
import com.chengyiwaimai.entity.MerchantEntity;
import com.chengyiwaimai.entity.OrderItemEntity;
import com.chengyiwaimai.mapper.CartItemMapper;
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
import com.chengyiwaimai.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    private static final SecureRandom RANDOM = new SecureRandom();

    private final MerchantMapper merchantMapper;
    private final DishMapper dishMapper;
    private final DeliveryOrderMapper deliveryOrderMapper;
    private final OrderItemMapper orderItemMapper;
    private final CartItemMapper cartItemMapper;
    private final List<Address> addresses = new CopyOnWriteArrayList<>();
    private final List<Coupon> coupons = new CopyOnWriteArrayList<>();
    private final List<Review> reviews = new CopyOnWriteArrayList<>();
    private final List<Category> categories = new CopyOnWriteArrayList<>();

    public DemoStore(
            MerchantMapper merchantMapper,
            DishMapper dishMapper,
            DeliveryOrderMapper deliveryOrderMapper,
            OrderItemMapper orderItemMapper,
            CartItemMapper cartItemMapper
    ) {
        this.merchantMapper = merchantMapper;
        this.dishMapper = dishMapper;
        this.deliveryOrderMapper = deliveryOrderMapper;
        this.orderItemMapper = orderItemMapper;
        this.cartItemMapper = cartItemMapper;
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

    public List<Dish> merchantDishes(CurrentUser user) {
        return dishes(requireMerchant(user).getId());
    }

    public Dish saveDish(CurrentUser user, Dish dish) {
        MerchantEntity merchant = requireMerchant(user);
        DishEntity entity = new DishEntity();
        entity.setId(dish.id());
        entity.setMerchantId(merchant.getId());
        entity.setName(dish.name());
        entity.setDescription(dish.description());
        entity.setPrice(dish.price());
        entity.setStock(999);
        entity.setStatus("on_sale");
        entity.setCategoryName("默认分类");
        if (entity.getId() == null) {
            dishMapper.insert(entity);
        } else {
            DishEntity old = dishMapper.selectById(entity.getId());
            if (old == null || !merchant.getId().equals(old.getMerchantId())) {
                throw new BizException("无权修改该菜品");
            }
            dishMapper.updateById(entity);
        }
        return toDish(entity);
    }

    public List<CartItem> cartItems(Long userId) {
        return cartItemMapper.selectList(Wrappers.<CartItemEntity>lambdaQuery()
                        .eq(CartItemEntity::getUserId, userId)
                        .orderByAsc(CartItemEntity::getId))
                .stream()
                .map(this::toCartItem)
                .toList();
    }

    public CartItem addCartItem(Long userId, CartItem item) {
        if (item.dishId() == null) {
            throw new BizException("菜品不能为空");
        }
        int quantity = item.quantity() == null || item.quantity() <= 0 ? 1 : item.quantity();
        DishEntity dish = requireOnSaleDish(item.dishId());
        CartItemEntity existing = cartItemMapper.selectOne(Wrappers.<CartItemEntity>lambdaQuery()
                .eq(CartItemEntity::getUserId, userId)
                .eq(CartItemEntity::getDishId, dish.getId())
                .last("limit 1"));
        if (existing == null) {
            existing = new CartItemEntity();
            existing.setUserId(userId);
            existing.setDishId(dish.getId());
            existing.setDishName(dish.getName());
            existing.setQuantity(quantity);
            existing.setPrice(dish.getPrice());
            cartItemMapper.insert(existing);
        } else {
            existing.setQuantity(existing.getQuantity() + quantity);
            existing.setDishName(dish.getName());
            existing.setPrice(dish.getPrice());
            cartItemMapper.updateById(existing);
        }
        return toCartItem(existing);
    }

    public CartItem updateCartItem(Long userId, Long dishId, Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new BizException("商品数量不合法");
        }
        CartItemEntity item = requireCartItem(userId, dishId);
        if (quantity == 0) {
            cartItemMapper.deleteById(item.getId());
            return new CartItem(dishId, item.getDishName(), 0, item.getPrice());
        }
        item.setQuantity(quantity);
        cartItemMapper.updateById(item);
        return toCartItem(item);
    }

    public void deleteCartItem(Long userId, Long dishId) {
        CartItemEntity item = requireCartItem(userId, dishId);
        cartItemMapper.deleteById(item.getId());
    }

    public void clearCart(Long userId) {
        cartItemMapper.delete(Wrappers.<CartItemEntity>lambdaQuery().eq(CartItemEntity::getUserId, userId));
    }

    @Transactional
    public Order createOrder(CurrentUser user, CreateOrderRequest request) {
        if (request.merchantId() == null) {
            throw new BizException("商家不能为空");
        }
        MerchantEntity merchant = merchantMapper.selectById(request.merchantId());
        if (merchant == null) {
            throw new BizException("商家不存在");
        }
        List<CartItem> items = request.items() == null || request.items().isEmpty() ? cartItems(user.userId()) : request.items();
        if (items.isEmpty()) {
            throw new BizException("购物车为空");
        }

        String orderId = nextOrderId();
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            int quantity = validateQuantity(item.quantity());
            DishEntity dish = requireOnSaleDish(item.dishId());
            if (!request.merchantId().equals(dish.getMerchantId())) {
                throw new BizException("订单商品不属于当前商家");
            }
            int stockRows = dishMapper.update(null, Wrappers.<DishEntity>lambdaUpdate()
                    .setSql("stock = stock - " + quantity)
                    .eq(DishEntity::getId, dish.getId())
                    .eq(DishEntity::getStatus, "on_sale")
                    .ge(DishEntity::getStock, quantity));
            if (stockRows != 1) {
                throw new BizException("库存不足，请重新选择商品");
            }

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderId(orderId);
            orderItem.setDishId(dish.getId());
            orderItem.setDishName(dish.getName());
            orderItem.setQuantity(quantity);
            orderItem.setPrice(dish.getPrice());
            orderItemMapper.insert(orderItem);
            total = total.add(dish.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }
        total = total.add(new BigDecimal("1.50"));

        DeliveryOrderEntity order = new DeliveryOrderEntity();
        order.setId(orderId);
        order.setUserId(user.userId());
        order.setMerchantId(merchant.getId());
        order.setTotalAmount(total);
        order.setAddress(request.address());
        order.setStatus(WAIT_PAY);
        deliveryOrderMapper.insert(order);
        clearCart(user.userId());
        return toOrder(order, merchant.getName());
    }

    public Order payOrder(CurrentUser user, String orderId) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (!user.userId().equals(order.getUserId())) {
            throw new BizException(403, "无权操作该订单");
        }
        return updateStatus(orderId, WAIT_PAY, WAIT_MERCHANT_ACCEPT, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getUserId, user.userId()));
    }

    public Order merchantAccept(CurrentUser user, String orderId) {
        return updateMerchantStatus(user, orderId, WAIT_MERCHANT_ACCEPT, MERCHANT_ACCEPTED);
    }

    public Order merchantCancel(CurrentUser user, String orderId) {
        return updateMerchantStatus(user, orderId, WAIT_MERCHANT_ACCEPT, CANCELED);
    }

    public Order merchantReady(CurrentUser user, String orderId) {
        return updateMerchantStatus(user, orderId, MERCHANT_ACCEPTED, MERCHANT_READY);
    }

    public Order riderAccept(CurrentUser user, String orderId) {
        requireOrder(orderId);
        DeliveryOrderEntity update = new DeliveryOrderEntity();
        update.setStatus(RIDER_ACCEPTED);
        update.setRiderId(user.userId());
        int rows = deliveryOrderMapper.update(update, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getStatus, MERCHANT_READY)
                .isNull(DeliveryOrderEntity::getRiderId));
        if (rows != 1) {
            throw new BizException("订单状态已变化，请刷新");
        }
        return toOrder(deliveryOrderMapper.selectById(orderId));
    }

    public Order riderPickup(CurrentUser user, String orderId) {
        return updateRiderStatus(user, orderId, RIDER_ACCEPTED, RIDER_PICKED);
    }

    public Order riderDelivered(CurrentUser user, String orderId) {
        return updateRiderStatus(user, orderId, RIDER_PICKED, COMPLETED);
    }

    public void requireRiderOrder(CurrentUser user, String orderId) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (!user.userId().equals(order.getRiderId())) {
            throw new BizException(403, "无权操作该订单");
        }
    }

    public List<Order> customerOrders(CurrentUser user) {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getUserId, user.userId())
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> merchantOrders(CurrentUser user) {
        MerchantEntity merchant = requireMerchant(user);
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId())
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> riderOrders(CurrentUser user) {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getRiderId, user.userId())
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> adminOrders() {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery().orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public int cancelTimeoutUnpaidOrders() {
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(15);
        List<DeliveryOrderEntity> timeoutOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getStatus, WAIT_PAY)
                .le(DeliveryOrderEntity::getCreateTime, deadline));
        int count = 0;
        for (DeliveryOrderEntity order : timeoutOrders) {
            DeliveryOrderEntity update = new DeliveryOrderEntity();
            update.setStatus(CANCELED);
            count += deliveryOrderMapper.update(update, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                    .eq(DeliveryOrderEntity::getId, order.getId())
                    .eq(DeliveryOrderEntity::getStatus, WAIT_PAY));
        }
        return count;
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

    public Review saveReview(CurrentUser user, Review review) {
        DeliveryOrderEntity order = requireOrder(review.orderId());
        if (!user.userId().equals(order.getUserId())) {
            throw new BizException(403, "无权评价该订单");
        }
        Review next = new Review(System.currentTimeMillis(), review.orderId(), review.rating(), review.content(), null);
        reviews.add(next);
        return next;
    }

    public List<Category> categories(CurrentUser user) {
        return categories(requireMerchant(user).getId());
    }

    public List<Category> categories(Long merchantId) {
        return categories.stream().filter(category -> category.merchantId().equals(merchantId)).toList();
    }

    public Category saveCategory(CurrentUser user, Category category) {
        MerchantEntity merchant = requireMerchant(user);
        Category next = new Category(category.id() == null ? System.currentTimeMillis() : category.id(), merchant.getId(), category.name(), category.sort());
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

    private Order updateMerchantStatus(CurrentUser user, String orderId, String expected, String nextStatus) {
        MerchantEntity merchant = requireMerchant(user);
        requireOrder(orderId);
        return updateStatus(orderId, expected, nextStatus, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId()));
    }

    private Order updateRiderStatus(CurrentUser user, String orderId, String expected, String nextStatus) {
        requireOrder(orderId);
        return updateStatus(orderId, expected, nextStatus, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getRiderId, user.userId()));
    }

    private Order updateStatus(String orderId, String expected, String nextStatus, com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<DeliveryOrderEntity> wrapper) {
        DeliveryOrderEntity update = new DeliveryOrderEntity();
        update.setStatus(nextStatus);
        int rows = deliveryOrderMapper.update(update, wrapper.eq(DeliveryOrderEntity::getStatus, expected));
        if (rows != 1) {
            throw new BizException("订单状态已变化，请刷新");
        }
        return toOrder(deliveryOrderMapper.selectById(orderId));
    }

    private DeliveryOrderEntity requireOrder(String orderId) {
        DeliveryOrderEntity order = deliveryOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BizException("订单不存在");
        }
        return order;
    }

    private MerchantEntity requireMerchant(CurrentUser user) {
        MerchantEntity merchant = merchantMapper.selectOne(Wrappers.<MerchantEntity>lambdaQuery()
                .eq(MerchantEntity::getUserId, user.userId())
                .last("limit 1"));
        if (merchant == null) {
            throw new BizException(403, "当前账号未绑定商家");
        }
        return merchant;
    }

    private DishEntity requireOnSaleDish(Long dishId) {
        DishEntity dish = dishMapper.selectById(dishId);
        if (dish == null || !"on_sale".equals(dish.getStatus())) {
            throw new BizException("商品不存在或已下架");
        }
        return dish;
    }

    private CartItemEntity requireCartItem(Long userId, Long dishId) {
        CartItemEntity item = cartItemMapper.selectOne(Wrappers.<CartItemEntity>lambdaQuery()
                .eq(CartItemEntity::getUserId, userId)
                .eq(CartItemEntity::getDishId, dishId)
                .last("limit 1"));
        if (item == null) {
            throw new BizException("购物车商品不存在");
        }
        return item;
    }

    private int validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BizException("商品数量不合法");
        }
        return quantity;
    }

    private List<Order> orders(LambdaQueryWrapper<DeliveryOrderEntity> query) {
        List<DeliveryOrderEntity> orders = deliveryOrderMapper.selectList(query);
        if (orders.isEmpty()) {
            return List.of();
        }
        Map<Long, MerchantEntity> merchantsById = merchantsById(orders.stream()
                .map(DeliveryOrderEntity::getMerchantId)
                .filter(id -> id != null)
                .collect(Collectors.toSet()));
        return orders.stream()
                .map(order -> toOrder(order, merchantsById.get(order.getMerchantId())))
                .toList();
    }

    private Map<Long, MerchantEntity> merchantsById(Collection<Long> ids) {
        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }
        return merchantMapper.selectBatchIds(ids).stream()
                .collect(Collectors.toMap(MerchantEntity::getId, Function.identity()));
    }

    private Order toOrder(DeliveryOrderEntity entity) {
        MerchantEntity merchant = entity.getMerchantId() == null ? null : merchantMapper.selectById(entity.getMerchantId());
        return toOrder(entity, merchant);
    }

    private Order toOrder(DeliveryOrderEntity entity, MerchantEntity merchant) {
        return toOrder(entity, merchant == null ? "未知商家" : merchant.getName());
    }

    private Order toOrder(DeliveryOrderEntity entity, String merchantName) {
        return new Order(entity.getId(), entity.getMerchantId(), merchantName, entity.getStatus(), entity.getTotalAmount(), entity.getAddress(), entity.getCreateTime());
    }

    private Merchant toMerchant(MerchantEntity entity) {
        return new Merchant(entity.getId(), entity.getName(), entity.getCategory(), entity.getRating(), "800m", "25分钟");
    }

    private Dish toDish(DishEntity entity) {
        return new Dish(entity.getId(), entity.getMerchantId(), entity.getName(), entity.getDescription(), entity.getPrice(), entity.getStock());
    }

    private CartItem toCartItem(CartItemEntity entity) {
        return new CartItem(entity.getDishId(), entity.getDishName(), entity.getQuantity(), entity.getPrice());
    }

    private String nextOrderId() {
        int suffix = RANDOM.nextInt(10000);
        return "CY" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")) + String.format("%04d", suffix);
    }
}
