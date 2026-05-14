package com.chengyiwaimai.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.entity.CartItemEntity;
import com.chengyiwaimai.entity.CategoryEntity;
import com.chengyiwaimai.entity.DeliveryOrderEntity;
import com.chengyiwaimai.entity.DishEntity;
import com.chengyiwaimai.entity.CouponEntity;
import com.chengyiwaimai.entity.MarketingActivityEntity;
import com.chengyiwaimai.entity.MerchantEntity;
import com.chengyiwaimai.entity.OrderItemEntity;
import com.chengyiwaimai.entity.ReviewEntity;
import com.chengyiwaimai.entity.SysUserEntity;
import com.chengyiwaimai.entity.UserAddressEntity;
import com.chengyiwaimai.entity.WithdrawRecordEntity;
import com.chengyiwaimai.mapper.CartItemMapper;
import com.chengyiwaimai.mapper.CategoryMapper;
import com.chengyiwaimai.mapper.CouponMapper;
import com.chengyiwaimai.mapper.DeliveryOrderMapper;
import com.chengyiwaimai.mapper.DishMapper;
import com.chengyiwaimai.mapper.MarketingActivityMapper;
import com.chengyiwaimai.mapper.MerchantMapper;
import com.chengyiwaimai.mapper.OrderItemMapper;
import com.chengyiwaimai.mapper.ReviewMapper;
import com.chengyiwaimai.mapper.SysUserMapper;
import com.chengyiwaimai.mapper.UserAddressMapper;
import com.chengyiwaimai.mapper.WithdrawRecordMapper;
import com.chengyiwaimai.model.Models.Address;
import com.chengyiwaimai.model.Models.CartItem;
import com.chengyiwaimai.model.Models.Category;
import com.chengyiwaimai.model.Models.Coupon;
import com.chengyiwaimai.model.Models.CreateOrderRequest;
import com.chengyiwaimai.model.Models.Dish;
import com.chengyiwaimai.model.Models.Merchant;
import com.chengyiwaimai.model.Models.Order;
import com.chengyiwaimai.model.Models.Review;
import com.chengyiwaimai.model.Models.RiderLocation;
import com.chengyiwaimai.security.CurrentUser;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class BusinessService {
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
    private final CategoryMapper categoryMapper;
    private final UserAddressMapper userAddressMapper;
    private final CouponMapper couponMapper;
    private final ReviewMapper reviewMapper;
    private final SysUserMapper sysUserMapper;
    private final MarketingActivityMapper marketingActivityMapper;
    private final WithdrawRecordMapper withdrawRecordMapper;
    private final StringRedisTemplate stringRedisTemplate;

    public BusinessService(
            MerchantMapper merchantMapper,
            DishMapper dishMapper,
            DeliveryOrderMapper deliveryOrderMapper,
            OrderItemMapper orderItemMapper,
            CartItemMapper cartItemMapper,
            CategoryMapper categoryMapper,
            UserAddressMapper userAddressMapper,
            CouponMapper couponMapper,
            ReviewMapper reviewMapper,
            SysUserMapper sysUserMapper,
            MarketingActivityMapper marketingActivityMapper,
            WithdrawRecordMapper withdrawRecordMapper,
            StringRedisTemplate stringRedisTemplate
    ) {
        this.merchantMapper = merchantMapper;
        this.dishMapper = dishMapper;
        this.deliveryOrderMapper = deliveryOrderMapper;
        this.orderItemMapper = orderItemMapper;
        this.cartItemMapper = cartItemMapper;
        this.categoryMapper = categoryMapper;
        this.userAddressMapper = userAddressMapper;
        this.couponMapper = couponMapper;
        this.reviewMapper = reviewMapper;
        this.sysUserMapper = sysUserMapper;
        this.marketingActivityMapper = marketingActivityMapper;
        this.withdrawRecordMapper = withdrawRecordMapper;
        this.stringRedisTemplate = stringRedisTemplate;
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
        if (dish.name() == null || dish.name().isBlank()) {
            throw new BizException("菜品名称不能为空");
        }
        if (dish.price() == null || dish.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new BizException("菜品价格不能为空且不能为负数");
        }
        if (dish.sales() != null && dish.sales() < 0) {
            throw new BizException("菜品库存不能为负数");
        }
        DishEntity entity = new DishEntity();
        entity.setId(dish.id() != null && dish.id() > 0 ? dish.id() : null);
        entity.setMerchantId(merchant.getId());
        entity.setName(dish.name());
        entity.setDescription(dish.description());
        entity.setPrice(dish.price());
        String categoryName = normalizeCategoryName(merchant.getId(), dish.categoryName());
        entity.setCategoryName(categoryName);
        if (entity.getId() == null) {
            entity.setStock(dish.sales() == null ? 999 : dish.sales());
            entity.setStatus(dish.status() == null || dish.status().isBlank() ? "on_sale" : dish.status());
            dishMapper.insert(entity);
        } else {
            DishEntity old = dishMapper.selectById(entity.getId());
            if (old == null || !merchant.getId().equals(old.getMerchantId())) {
                throw new BizException("无权修改该菜品");
            }
            entity.setStock(dish.sales() == null ? old.getStock() : dish.sales());
            entity.setStatus(dish.status() == null || dish.status().isBlank() ? old.getStatus() : dish.status());
            entity.setCategoryName(dish.categoryName() == null || dish.categoryName().isBlank() ? old.getCategoryName() : categoryName);
            dishMapper.updateById(entity);
        }
        return toDish(dishMapper.selectById(entity.getId()));
    }

    public Dish updateDishStatus(CurrentUser user, Long dishId, String status) {
        MerchantEntity merchant = requireMerchant(user);
        if (!"on_sale".equals(status) && !"off_sale".equals(status)) {
            throw new BizException("商品状态不合法");
        }
        DishEntity update = new DishEntity();
        update.setStatus(status);
        int rows = dishMapper.update(update, Wrappers.<DishEntity>lambdaUpdate()
                .eq(DishEntity::getId, dishId)
                .eq(DishEntity::getMerchantId, merchant.getId()));
        if (rows != 1) {
            throw new BizException("商品不存在或无权操作");
        }
        return toDish(dishMapper.selectById(dishId));
    }

    public Dish updateDishStock(CurrentUser user, Long dishId, Integer stock) {
        MerchantEntity merchant = requireMerchant(user);
        if (stock == null || stock < 0) {
            throw new BizException("库存不能为负数");
        }
        DishEntity update = new DishEntity();
        update.setStock(stock);
        int rows = dishMapper.update(update, Wrappers.<DishEntity>lambdaUpdate()
                .eq(DishEntity::getId, dishId)
                .eq(DishEntity::getMerchantId, merchant.getId()));
        if (rows != 1) {
            throw new BizException("商品不存在或无权操作");
        }
        return toDish(dishMapper.selectById(dishId));
    }

    public List<CartItem> cartItems(Long userId) {
        return cartItemMapper.selectList(Wrappers.<CartItemEntity>lambdaQuery()
                        .eq(CartItemEntity::getUserId, userId)
                        .orderByAsc(CartItemEntity::getId))
                .stream()
                .map(this::toCartItem)
                .toList();
    }

    @Transactional
    public CartItem addCartItem(Long userId, CartItem item) {
        if (item.dishId() == null) {
            throw new BizException("菜品不能为空");
        }
        int quantity = item.quantity() == null || item.quantity() <= 0 ? 1 : item.quantity();
        DishEntity dish = requireOnSaleDish(item.dishId());
        ensureSingleMerchantCart(userId, dish.getMerchantId());
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
            try {
                cartItemMapper.insert(existing);
            } catch (DuplicateKeyException ex) {
                incrementCartItem(userId, dish, quantity);
                existing = requireCartItem(userId, dish.getId());
            }
        } else {
            incrementCartItem(userId, dish, quantity);
            existing = requireCartItem(userId, dish.getId());
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
            return new CartItem(dishId, item.getDishName(), 0, item.getPrice(), null, null);
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
        BigDecimal discount = calculateCouponDiscount(request.couponId(), total);
        total = total.add(new BigDecimal("1.50")).subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        DeliveryOrderEntity order = new DeliveryOrderEntity();
        order.setId(orderId);
        order.setUserId(user.userId());
        order.setMerchantId(merchant.getId());
        order.setTotalAmount(total);
        order.setAddress(request.address());
        order.setRemark(request.remark());
        order.setCouponId(request.couponId());
        order.setDiscountAmount(discount);
        order.setStatus(WAIT_PAY);
        deliveryOrderMapper.insert(order);
        clearCart(user.userId());
        return toOrder(order, merchant.getName());
    }

    public Order payOrder(CurrentUser user, String orderId, String payMethod) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (!user.userId().equals(order.getUserId())) {
            throw new BizException(403, "无权操作该订单");
        }
        DeliveryOrderEntity update = new DeliveryOrderEntity();
        update.setStatus(WAIT_MERCHANT_ACCEPT);
        update.setPayMethod(normalizePayMethod(payMethod));
        int rows = deliveryOrderMapper.update(update, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getStatus, WAIT_PAY)
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getUserId, user.userId()));
        if (rows != 1) {
            throw new BizException("订单状态已变化，请刷新");
        }
        return toOrder(deliveryOrderMapper.selectById(orderId));
    }

    @Transactional
    public Order cancelOrder(CurrentUser user, String orderId) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (!user.userId().equals(order.getUserId())) {
            throw new BizException(403, "无权操作该订单");
        }
        Order canceled = updateStatus(orderId, WAIT_PAY, CANCELED, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getUserId, user.userId()));
        restoreStock(orderId);
        return canceled;
    }

    public Order merchantAccept(CurrentUser user, String orderId) {
        return updateMerchantStatus(user, orderId, WAIT_MERCHANT_ACCEPT, MERCHANT_ACCEPTED);
    }

    @Transactional
    public Order merchantCancel(CurrentUser user, String orderId) {
        MerchantEntity merchant = requireMerchant(user);
        requireOrder(orderId);
        Order order = updateStatus(orderId, WAIT_MERCHANT_ACCEPT, CANCELED, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                .eq(DeliveryOrderEntity::getId, orderId)
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId()));
        restoreStock(orderId);
        return order;
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

    public void cacheRiderLocation(String orderId, RiderLocation location) {
        if (orderId == null || location == null || location.longitude() == null || location.latitude() == null) {
            return;
        }
        try {
            stringRedisTemplate.opsForValue().set(
                    "rider:location:" + orderId,
                    location.longitude() + "," + location.latitude(),
                    Duration.ofMinutes(30)
            );
        } catch (RuntimeException ignored) {
            // Redis only improves live tracking; order status updates must still succeed.
        }
    }

    public Map<String, Object> latestRiderLocation(String orderId) {
        try {
            String value = stringRedisTemplate.opsForValue().get("rider:location:" + orderId);
            if (value == null || value.isBlank()) {
                return Map.of("orderId", orderId, "available", false);
            }
            String[] parts = value.split(",", 2);
            return Map.of(
                    "orderId", orderId,
                    "available", true,
                    "longitude", new BigDecimal(parts[0]),
                    "latitude", new BigDecimal(parts[1])
            );
        } catch (RuntimeException ex) {
            return Map.of("orderId", orderId, "available", false, "fallback", true);
        }
    }

    public void requireOrderSubscription(CurrentUser user, String orderId) {
        DeliveryOrderEntity order = requireOrder(orderId);
        if (user.hasRole("admin")) {
            return;
        }
        if (user.hasRole("customer") && user.userId().equals(order.getUserId())) {
            return;
        }
        if (user.hasRole("merchant")) {
            MerchantEntity merchant = requireMerchant(user);
            if (merchant.getId().equals(order.getMerchantId())) {
                return;
            }
        }
        if (user.hasRole("rider") && user.userId().equals(order.getRiderId())) {
            return;
        }
        throw new BizException(403, "无权订阅该订单");
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
                .in(DeliveryOrderEntity::getStatus, List.of(RIDER_ACCEPTED, RIDER_PICKED))
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> riderHistory(CurrentUser user) {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getRiderId, user.userId())
                .in(DeliveryOrderEntity::getStatus, List.of(COMPLETED, CANCELED))
                .orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    public List<Order> adminOrders() {
        return orders(Wrappers.<DeliveryOrderEntity>lambdaQuery().orderByDesc(DeliveryOrderEntity::getCreateTime));
    }

    @Transactional
    public int cancelTimeoutUnpaidOrders() {
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(15);
        List<DeliveryOrderEntity> timeoutOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getStatus, WAIT_PAY)
                .le(DeliveryOrderEntity::getCreateTime, deadline));
        int count = 0;
        for (DeliveryOrderEntity order : timeoutOrders) {
            DeliveryOrderEntity update = new DeliveryOrderEntity();
            update.setStatus(CANCELED);
            int rows = deliveryOrderMapper.update(update, Wrappers.<DeliveryOrderEntity>lambdaUpdate()
                    .eq(DeliveryOrderEntity::getId, order.getId())
                    .eq(DeliveryOrderEntity::getStatus, WAIT_PAY));
            if (rows == 1) {
                restoreStock(order.getId());
                count++;
            }
        }
        return count;
    }

    public List<Map<String, Object>> riderLobbyOrders() {
        List<DeliveryOrderEntity> orders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getStatus, MERCHANT_READY)
                .isNull(DeliveryOrderEntity::getRiderId)
                .orderByAsc(DeliveryOrderEntity::getCreateTime));
        if (orders.isEmpty()) {
            return List.of();
        }
        Map<Long, MerchantEntity> merchantsById = merchantsById(orders.stream()
                .map(DeliveryOrderEntity::getMerchantId)
                .filter(id -> id != null)
                .collect(Collectors.toSet()));
        return orders.stream()
                .map(order -> {
                    MerchantEntity merchant = merchantsById.get(order.getMerchantId());
                    return Map.<String, Object>of(
                            "orderId", order.getId(),
                            "income", new BigDecimal("4.50"),
                            "distance", "1.2km",
                            "merchant", merchant == null ? "未知商家" : merchant.getName(),
                            "address", order.getAddress() == null ? "" : order.getAddress()
                    );
                })
                .toList();
    }

    public List<Address> addresses(CurrentUser user) {
        return userAddressMapper.selectList(Wrappers.<UserAddressEntity>lambdaQuery()
                        .eq(UserAddressEntity::getUserId, user.userId())
                        .orderByDesc(UserAddressEntity::getIsDefault)
                        .orderByDesc(UserAddressEntity::getUpdateTime))
                .stream()
                .map(this::toAddress)
                .toList();
    }

    @Transactional
    public Address saveAddress(CurrentUser user, Address address) {
        if (Boolean.TRUE.equals(address.isDefault())) {
            userAddressMapper.update(null, Wrappers.<UserAddressEntity>lambdaUpdate()
                    .set(UserAddressEntity::getIsDefault, false)
                    .eq(UserAddressEntity::getUserId, user.userId()));
        }
        UserAddressEntity entity = new UserAddressEntity();
        entity.setId(address.id());
        entity.setUserId(user.userId());
        entity.setReceiver(address.receiver());
        entity.setPhone(address.phone());
        entity.setDetail(address.detail());
        entity.setIsDefault(Boolean.TRUE.equals(address.isDefault()));
        if (entity.getId() == null) {
            userAddressMapper.insert(entity);
        } else {
            int rows = userAddressMapper.update(entity, Wrappers.<UserAddressEntity>lambdaUpdate()
                    .eq(UserAddressEntity::getId, entity.getId())
                    .eq(UserAddressEntity::getUserId, user.userId()));
            if (rows != 1) {
                throw new BizException("地址不存在或无权修改");
            }
        }
        return toAddress(userAddressMapper.selectById(entity.getId()));
    }

    public List<Coupon> coupons() {
        return couponMapper.selectList(Wrappers.<CouponEntity>lambdaQuery()
                        .eq(CouponEntity::getStatus, "enabled")
                        .orderByAsc(CouponEntity::getId))
                .stream()
                .map(this::toCoupon)
                .toList();
    }

    public List<Review> reviews(CurrentUser user) {
        return reviewMapper.selectList(Wrappers.<ReviewEntity>lambdaQuery()
                        .eq(ReviewEntity::getUserId, user.userId())
                        .orderByDesc(ReviewEntity::getCreateTime))
                .stream()
                .map(this::toReview)
                .toList();
    }

    public List<Review> merchantReviews(CurrentUser user) {
        MerchantEntity merchant = requireMerchant(user);
        return reviewMapper.selectList(Wrappers.<ReviewEntity>lambdaQuery()
                        .eq(ReviewEntity::getMerchantId, merchant.getId())
                        .orderByDesc(ReviewEntity::getCreateTime))
                .stream()
                .map(this::toReview)
                .toList();
    }

    public Review replyReview(CurrentUser user, Long reviewId, String reply) {
        MerchantEntity merchant = requireMerchant(user);
        ReviewEntity update = new ReviewEntity();
        update.setReply(reply);
        int rows = reviewMapper.update(update, Wrappers.<ReviewEntity>lambdaUpdate()
                .eq(ReviewEntity::getId, reviewId)
                .eq(ReviewEntity::getMerchantId, merchant.getId()));
        if (rows != 1) {
            throw new BizException("评价不存在或无权回复");
        }
        return toReview(reviewMapper.selectById(reviewId));
    }

    @Transactional
    public Review saveReview(CurrentUser user, Review review) {
        DeliveryOrderEntity order = requireOrder(review.orderId());
        if (!user.userId().equals(order.getUserId())) {
            throw new BizException(403, "无权评价该订单");
        }
        if (!COMPLETED.equals(order.getStatus())) {
            throw new BizException("只有已完成订单可以评价");
        }
        ReviewEntity existing = reviewMapper.selectOne(Wrappers.<ReviewEntity>lambdaQuery()
                .eq(ReviewEntity::getOrderId, review.orderId())
                .last("limit 1"));
        if (existing != null) {
            throw new BizException("该订单已评价");
        }
        ReviewEntity entity = new ReviewEntity();
        entity.setOrderId(review.orderId());
        entity.setUserId(user.userId());
        entity.setMerchantId(order.getMerchantId());
        entity.setRating(review.rating());
        entity.setContent(review.content());
        reviewMapper.insert(entity);
        return toReview(entity);
    }

    public List<Category> categories(CurrentUser user) {
        return categories(requireMerchant(user).getId());
    }

    public List<Category> categories(Long merchantId) {
        return categoryMapper.selectList(Wrappers.<CategoryEntity>lambdaQuery()
                        .eq(CategoryEntity::getMerchantId, merchantId)
                        .orderByAsc(CategoryEntity::getSort)
                        .orderByAsc(CategoryEntity::getId))
                .stream()
                .map(this::toCategory)
                .toList();
    }

    public Category saveCategory(CurrentUser user, Category category) {
        MerchantEntity merchant = requireMerchant(user);
        CategoryEntity entity = new CategoryEntity();
        entity.setMerchantId(merchant.getId());
        entity.setName(requireCategoryName(category.name()));
        entity.setSort(category.sort() == null ? nextCategorySort(merchant.getId()) : category.sort());
        categoryMapper.insert(entity);
        return toCategory(entity);
    }

    public Category updateCategory(CurrentUser user, Long categoryId, Category category) {
        MerchantEntity merchant = requireMerchant(user);
        CategoryEntity old = categoryMapper.selectById(categoryId);
        if (old == null || !merchant.getId().equals(old.getMerchantId())) {
            throw new BizException("分类不存在或无权操作");
        }
        String newName = requireCategoryName(category.name());
        CategoryEntity update = new CategoryEntity();
        update.setName(newName);
        update.setSort(category.sort());
        categoryMapper.update(update, Wrappers.<CategoryEntity>lambdaUpdate()
                .eq(CategoryEntity::getId, categoryId)
                .eq(CategoryEntity::getMerchantId, merchant.getId()));
        dishMapper.update(null, Wrappers.<DishEntity>lambdaUpdate()
                .set(DishEntity::getCategoryName, newName)
                .eq(DishEntity::getMerchantId, merchant.getId())
                .eq(DishEntity::getCategoryName, old.getName()));
        return toCategory(categoryMapper.selectById(categoryId));
    }

    public void deleteCategory(CurrentUser user, Long categoryId) {
        MerchantEntity merchant = requireMerchant(user);
        CategoryEntity category = categoryMapper.selectById(categoryId);
        if (category == null || !merchant.getId().equals(category.getMerchantId())) {
            throw new BizException("分类不存在或无权操作");
        }
        Long dishCount = dishMapper.selectCount(Wrappers.<DishEntity>lambdaQuery()
                .eq(DishEntity::getMerchantId, merchant.getId())
                .eq(DishEntity::getCategoryName, category.getName()));
        if (dishCount > 0) {
            throw new BizException("请先移动或删除该分类下的菜品");
        }
        categoryMapper.deleteById(categoryId);
    }

    public Map<String, Object> merchantStats(CurrentUser user) {
        MerchantEntity merchant = requireMerchant(user);
        LocalDateTime start = todayStart();
        LocalDateTime end = tomorrowStart();
        List<DeliveryOrderEntity> todayOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId())
                .ge(DeliveryOrderEntity::getCreateTime, start)
                .lt(DeliveryOrderEntity::getCreateTime, end));
        List<DeliveryOrderEntity> totalOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getMerchantId, merchant.getId()));
        return Map.of(
                "todayIncome", sumPaid(todayOrders),
                "todayOrders", todayOrders.size(),
                "totalIncome", sumPaid(totalOrders),
                "totalOrders", totalOrders.size(),
                "conversionRate", "18.5%",
                "refundOrders", todayOrders.stream().filter(order -> CANCELED.equals(order.getStatus())).count()
        );
    }

    public Map<String, Object> businessSettings(CurrentUser user) {
        MerchantEntity merchant = requireMerchant(user);
        return Map.of(
                "businessStatus", merchant.getBusinessStatus() == null ? "open" : merchant.getBusinessStatus(),
                "openTime", "09:00",
                "closeTime", "22:30",
                "deliveryRange", "5km"
        );
    }

    public Map<String, Object> saveBusinessSettings(CurrentUser user, Map<String, Object> body) {
        MerchantEntity merchant = requireMerchant(user);
        String status = normalizeBusinessStatus(String.valueOf(body.getOrDefault("businessStatus", body.getOrDefault("status", "open"))));
        MerchantEntity update = new MerchantEntity();
        update.setBusinessStatus(status);
        merchantMapper.update(update, Wrappers.<MerchantEntity>lambdaUpdate().eq(MerchantEntity::getId, merchant.getId()));
        return Map.of("saved", true, "businessStatus", status, "settings", body);
    }

    public List<Map<String, Object>> merchantMarketing(CurrentUser user) {
        return marketingActivities(requireMerchant(user).getId());
    }

    public Map<String, Object> saveMerchantMarketing(CurrentUser user, Map<String, Object> body) {
        MarketingActivityEntity activity = toMarketingActivity(body);
        activity.setMerchantId(requireMerchant(user).getId());
        marketingActivityMapper.insert(activity);
        return marketingActivityMap(activity);
    }

    public Map<String, Object> updateMerchantMarketing(CurrentUser user, Long id, Map<String, Object> body) {
        Long merchantId = requireMerchant(user).getId();
        MarketingActivityEntity activity = toMarketingActivity(body);
        int rows = marketingActivityMapper.update(activity, Wrappers.<MarketingActivityEntity>lambdaUpdate()
                .eq(MarketingActivityEntity::getId, id)
                .eq(MarketingActivityEntity::getMerchantId, merchantId));
        if (rows != 1) {
            throw new BizException("营销活动不存在或无权操作");
        }
        return marketingActivityMap(marketingActivityMapper.selectById(id));
    }

    public Map<String, Object> riderStats(CurrentUser user) {
        LocalDateTime start = todayStart();
        LocalDateTime end = tomorrowStart();
        List<DeliveryOrderEntity> todayCompleted = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getRiderId, user.userId())
                .eq(DeliveryOrderEntity::getStatus, COMPLETED)
                .ge(DeliveryOrderEntity::getUpdateTime, start)
                .lt(DeliveryOrderEntity::getUpdateTime, end));
        Long totalCompleted = deliveryOrderMapper.selectCount(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .eq(DeliveryOrderEntity::getRiderId, user.userId())
                .eq(DeliveryOrderEntity::getStatus, COMPLETED));
        return Map.of(
                "todayIncome", BigDecimal.valueOf(todayCompleted.size()).multiply(new BigDecimal("4.50")),
                "todayOrders", todayCompleted.size(),
                "totalIncome", BigDecimal.valueOf(totalCompleted).multiply(new BigDecimal("4.50")),
                "totalOrders", totalCompleted,
                "level", "黄金骑手",
                "score", "4.8",
                "onTimeRate", "99.8%"
        );
    }

    public Map<String, Object> adminDashboard() {
        LocalDateTime start = todayStart();
        LocalDateTime end = tomorrowStart();
        LocalDate trendStart = LocalDate.now().minusDays(29);
        List<DeliveryOrderEntity> todayOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .ge(DeliveryOrderEntity::getCreateTime, start)
                .lt(DeliveryOrderEntity::getCreateTime, end));
        List<DeliveryOrderEntity> totalOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery());
        List<DeliveryOrderEntity> trendOrders = deliveryOrderMapper.selectList(Wrappers.<DeliveryOrderEntity>lambdaQuery()
                .ge(DeliveryOrderEntity::getCreateTime, trendStart.atStartOfDay())
                .lt(DeliveryOrderEntity::getCreateTime, end));
        return Map.of(
                "todayGmv", sumPaid(todayOrders),
                "todayOrders", todayOrders.size(),
                "totalGmv", sumPaid(totalOrders),
                "totalOrders", totalOrders.size(),
                "activeUsers", sysUserMapper.selectCount(Wrappers.<SysUserEntity>lambdaQuery().eq(SysUserEntity::getStatus, 1)),
                "todayExceptionOrders", todayOrders.stream().filter(order -> CANCELED.equals(order.getStatus())).count(),
                "totalExceptionOrders", totalOrders.stream().filter(order -> CANCELED.equals(order.getStatus())).count(),
                "dailyTrend", dailyTrend(trendStart, trendOrders),
                "merchantRanking", merchantRanking(totalOrders),
                "riderRanking", riderRanking(totalOrders)
        );
    }

    private List<Map<String, Object>> dailyTrend(LocalDate startDate, List<DeliveryOrderEntity> orders) {
        return IntStream.range(0, 30)
                .mapToObj(offset -> {
                    LocalDate date = startDate.plusDays(offset);
                    List<DeliveryOrderEntity> dayOrders = orders.stream()
                            .filter(order -> order.getCreateTime() != null)
                            .filter(order -> order.getCreateTime().toLocalDate().equals(date))
                            .toList();
                    return Map.<String, Object>of(
                            "date", date.toString(),
                            "label", date.format(DateTimeFormatter.ofPattern("MM/dd")),
                            "gmv", sumPaid(dayOrders),
                            "orders", dayOrders.size(),
                            "exceptionOrders", dayOrders.stream().filter(order -> CANCELED.equals(order.getStatus())).count()
                    );
                })
                .toList();
    }

    private List<Map<String, Object>> merchantRanking(List<DeliveryOrderEntity> orders) {
        Map<Long, MerchantEntity> merchantById = merchantMapper.selectList(Wrappers.<MerchantEntity>lambdaQuery())
                .stream()
                .collect(Collectors.toMap(MerchantEntity::getId, Function.identity(), (left, right) -> left));
        return orders.stream()
                .filter(this::isEffectivePaidOrder)
                .filter(order -> order.getMerchantId() != null)
                .collect(Collectors.groupingBy(DeliveryOrderEntity::getMerchantId))
                .entrySet()
                .stream()
                .map(entry -> {
                    MerchantEntity merchant = merchantById.get(entry.getKey());
                    return Map.<String, Object>of(
                            "merchantId", entry.getKey(),
                            "name", merchant == null || merchant.getName() == null ? "商家 " + entry.getKey() : merchant.getName(),
                            "orders", entry.getValue().size(),
                            "gmv", sumPaid(entry.getValue())
                    );
                })
                .sorted(Comparator.comparing(item -> (BigDecimal) item.get("gmv"), Comparator.reverseOrder()))
                .limit(5)
                .toList();
    }

    private List<Map<String, Object>> riderRanking(List<DeliveryOrderEntity> orders) {
        Map<Long, SysUserEntity> userById = sysUserMapper.selectList(Wrappers.<SysUserEntity>lambdaQuery()
                        .eq(SysUserEntity::getRole, "rider"))
                .stream()
                .collect(Collectors.toMap(SysUserEntity::getId, Function.identity(), (left, right) -> left));
        return orders.stream()
                .filter(order -> COMPLETED.equals(order.getStatus()))
                .filter(order -> order.getRiderId() != null)
                .collect(Collectors.groupingBy(DeliveryOrderEntity::getRiderId))
                .entrySet()
                .stream()
                .map(entry -> {
                    SysUserEntity rider = userById.get(entry.getKey());
                    return Map.<String, Object>of(
                            "riderId", entry.getKey(),
                            "name", rider == null || rider.getNickname() == null ? "骑手 " + entry.getKey() : rider.getNickname(),
                            "completedOrders", entry.getValue().size(),
                            "income", BigDecimal.valueOf(entry.getValue().size()).multiply(new BigDecimal("4.50"))
                    );
                })
                .sorted(Comparator.comparing(item -> (Integer) item.get("completedOrders"), Comparator.reverseOrder()))
                .limit(5)
                .toList();
    }

    private boolean isEffectivePaidOrder(DeliveryOrderEntity order) {
        return !WAIT_PAY.equals(order.getStatus()) && !CANCELED.equals(order.getStatus());
    }

    public List<Map<String, Object>> adminUsers() {
        return sysUserMapper.selectList(Wrappers.<SysUserEntity>lambdaQuery().orderByDesc(SysUserEntity::getCreateTime))
                .stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getNickname() == null ? "" : user.getNickname(),
                        "phone", user.getPhone(),
                        "role", user.getRole(),
                        "status", user.getStatus() != null && user.getStatus() == 1 ? "正常" : "禁用"
                ))
                .toList();
    }

    public List<Map<String, Object>> adminRiders() {
        return sysUserMapper.selectList(Wrappers.<SysUserEntity>lambdaQuery()
                        .eq(SysUserEntity::getRole, "rider")
                        .orderByDesc(SysUserEntity::getCreateTime))
                .stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getNickname() == null ? "" : user.getNickname(),
                        "phone", user.getPhone(),
                        "level", "黄金骑手",
                        "status", user.getStatus() != null && user.getStatus() == 1 ? "正常" : "禁用"
                ))
                .toList();
    }

    public List<Map<String, Object>> adminMerchants() {
        return merchantMapper.selectList(Wrappers.<MerchantEntity>lambdaQuery().orderByDesc(MerchantEntity::getCreateTime))
                .stream()
                .map(merchant -> Map.<String, Object>of(
                        "id", merchant.getId(),
                        "name", merchant.getName() == null ? "" : merchant.getName(),
                        "category", merchant.getCategory() == null ? "" : merchant.getCategory(),
                        "phone", merchant.getPhone() == null ? "" : merchant.getPhone(),
                        "address", merchant.getAddress() == null ? "" : merchant.getAddress(),
                        "auditStatus", merchant.getAuditStatus() == null ? "" : merchant.getAuditStatus(),
                        "businessStatus", merchant.getBusinessStatus() == null ? "" : merchant.getBusinessStatus()
                ))
                .toList();
    }

    public List<Map<String, Object>> adminMarketing() {
        return marketingActivities(null);
    }

    public Map<String, Object> createAdminMarketing(Map<String, Object> body) {
        MarketingActivityEntity activity = toMarketingActivity(body);
        activity.setMerchantId(parseLongValue(body.get("merchantId"), 0L));
        marketingActivityMapper.insert(activity);
        return marketingActivityMap(activity);
    }

    public Map<String, Object> updateAdminMarketing(Long id, Map<String, Object> body) {
        MarketingActivityEntity activity = toMarketingActivity(body);
        int rows = marketingActivityMapper.update(activity, Wrappers.<MarketingActivityEntity>lambdaUpdate()
                .eq(MarketingActivityEntity::getId, id));
        if (rows != 1) {
            throw new BizException("营销活动不存在");
        }
        return marketingActivityMap(marketingActivityMapper.selectById(id));
    }

    public void deleteAdminMarketing(Long id) {
        int rows = marketingActivityMapper.deleteById(id);
        if (rows != 1) {
            throw new BizException("营销活动不存在");
        }
    }

    public Map<String, Object> updateUserStatus(Long id, String status) {
        SysUserEntity update = new SysUserEntity();
        update.setStatus("disabled".equals(status) || "0".equals(status) ? 0 : 1);
        int rows = sysUserMapper.update(update, Wrappers.<SysUserEntity>lambdaUpdate().eq(SysUserEntity::getId, id));
        if (rows != 1) {
            throw new BizException("用户不存在");
        }
        return Map.of("id", id, "status", update.getStatus() == 1 ? "正常" : "禁用");
    }

    public Map<String, Object> withdraw(CurrentUser user, BigDecimal amount, String accountNo) {
        return createWithdrawRecord("rider", user.userId(), user.userId(), amount, accountNo);
    }

    public Map<String, Object> merchantWithdraw(CurrentUser user, BigDecimal amount, String accountNo) {
        MerchantEntity merchant = requireMerchant(user);
        return createWithdrawRecord("merchant", merchant.getId(), user.userId(), amount, accountNo);
    }

    private Map<String, Object> createWithdrawRecord(String ownerType, Long ownerId, Long legacyRiderId, BigDecimal amount, String accountNo) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BizException("提现金额必须大于 0");
        }
        if (accountNo == null || accountNo.isBlank()) {
            throw new BizException("提现账户不能为空");
        }
        WithdrawRecordEntity record = new WithdrawRecordEntity();
        record.setRiderId(legacyRiderId);
        record.setOwnerType(ownerType);
        record.setOwnerId(ownerId);
        record.setAmount(amount);
        record.setAccountNo(accountNo.trim());
        record.setStatus("submitted");
        withdrawRecordMapper.insert(record);
        return withdrawRecordMap(record);
    }

    public List<Map<String, Object>> withdrawRecords(CurrentUser user) {
        return withdrawRecordMapper.selectList(Wrappers.<WithdrawRecordEntity>lambdaQuery()
                        .eq(WithdrawRecordEntity::getRiderId, user.userId())
                        .and(wrapper -> wrapper.isNull(WithdrawRecordEntity::getOwnerType)
                                .or()
                                .eq(WithdrawRecordEntity::getOwnerType, "rider"))
                        .orderByDesc(WithdrawRecordEntity::getCreateTime))
                .stream()
                .map(this::withdrawRecordMap)
                .toList();
    }

    public List<Map<String, Object>> merchantWithdrawRecords(CurrentUser user) {
        MerchantEntity merchant = requireMerchant(user);
        return withdrawRecordMapper.selectList(Wrappers.<WithdrawRecordEntity>lambdaQuery()
                        .eq(WithdrawRecordEntity::getOwnerType, "merchant")
                        .eq(WithdrawRecordEntity::getOwnerId, merchant.getId())
                        .orderByDesc(WithdrawRecordEntity::getCreateTime))
                .stream()
                .map(this::withdrawRecordMap)
                .toList();
    }

    private Map<String, Object> withdrawRecordMap(WithdrawRecordEntity record) {
        return Map.of(
                "id", record.getId(),
                "ownerType", record.getOwnerType() == null ? "rider" : record.getOwnerType(),
                "ownerId", record.getOwnerId() == null ? record.getRiderId() : record.getOwnerId(),
                "amount", record.getAmount(),
                "accountNo", record.getAccountNo(),
                "status", record.getStatus(),
                "createTime", record.getCreateTime() == null ? "" : record.getCreateTime()
        );
    }

    public Map<String, Object> adminAudit(String module, Long id, String status) {
        if ("merchants".equals(module) || "merchant".equals(module)) {
            String auditStatus = normalizeAuditStatus(status);
            MerchantEntity merchant = new MerchantEntity();
            merchant.setAuditStatus(auditStatus);
            int rows = merchantMapper.update(merchant, Wrappers.<MerchantEntity>lambdaUpdate().eq(MerchantEntity::getId, id));
            if (rows != 1) {
                throw new BizException("商家不存在");
            }
            return Map.of("module", module, "id", id, "result", auditStatus, "auditStatus", auditStatus);
        }
        if ("riders".equals(module) || "users".equals(module)) {
            Integer nextStatus = normalizeUserStatus(status);
            SysUserEntity user = new SysUserEntity();
            user.setStatus(nextStatus);
            var wrapper = Wrappers.<SysUserEntity>lambdaUpdate().eq(SysUserEntity::getId, id);
            if ("riders".equals(module)) {
                wrapper.eq(SysUserEntity::getRole, "rider");
            }
            int rows = sysUserMapper.update(user, wrapper);
            if (rows != 1) {
                throw new BizException("用户不存在");
            }
            return Map.of("module", module, "id", id, "result", nextStatus == 1 ? "approved" : "rejected", "status", nextStatus == 1 ? "正常" : "禁用");
        }
        throw new BizException("审核模块不支持");
    }

    private String normalizeAuditStatus(String status) {
        String value = status == null || status.isBlank() ? "approved" : status;
        if ("approved".equals(value) || "rejected".equals(value)) {
            return value;
        }
        throw new BizException("审核状态不合法");
    }

    private Integer normalizeUserStatus(String status) {
        String value = status == null || status.isBlank() ? "approved" : status;
        if ("approved".equals(value) || "enabled".equals(value) || "1".equals(value)) {
            return 1;
        }
        if ("rejected".equals(value) || "disabled".equals(value) || "0".equals(value)) {
            return 0;
        }
        throw new BizException("用户状态不合法");
    }

    private BigDecimal calculateCouponDiscount(Long couponId, BigDecimal goodsAmount) {
        if (couponId == null) {
            return BigDecimal.ZERO;
        }
        CouponEntity coupon = couponMapper.selectById(couponId);
        if (coupon == null || !"enabled".equals(coupon.getStatus())) {
            throw new BizException("优惠券无效或已不可用");
        }
        BigDecimal threshold = coupon.getThresholdAmount() == null ? BigDecimal.ZERO : coupon.getThresholdAmount();
        if (goodsAmount.compareTo(threshold) < 0) {
            throw new BizException("未达到优惠券使用门槛");
        }
        BigDecimal discount = coupon.getDiscountAmount() == null ? BigDecimal.ZERO : coupon.getDiscountAmount();
        return discount.max(BigDecimal.ZERO).min(goodsAmount.add(new BigDecimal("1.50")));
    }

    private String normalizePayMethod(String payMethod) {
        if ("wechat".equals(payMethod) || "alipay".equals(payMethod) || "campus_card".equals(payMethod)) {
            return payMethod;
        }
        throw new BizException("支付方式不支持");
    }

    private String normalizeBusinessStatus(String status) {
        if ("resting".equals(status)) {
            return "closed";
        }
        if ("open".equals(status) || "closed".equals(status) || "paused".equals(status)) {
            return status;
        }
        throw new BizException("营业状态不合法");
    }

    private String requireCategoryName(String name) {
        if (name == null || name.isBlank()) {
            throw new BizException("分类名称不能为空");
        }
        return name.trim();
    }

    private String normalizeCategoryName(Long merchantId, String name) {
        if (name != null && !name.isBlank()) {
            String next = name.trim();
            Long count = categoryMapper.selectCount(Wrappers.<CategoryEntity>lambdaQuery()
                    .eq(CategoryEntity::getMerchantId, merchantId)
                    .eq(CategoryEntity::getName, next));
            if (count == 0) {
                CategoryEntity category = new CategoryEntity();
                category.setMerchantId(merchantId);
                category.setName(next);
                category.setSort(nextCategorySort(merchantId));
                categoryMapper.insert(category);
            }
            return next;
        }
        return categories(merchantId).stream().findFirst().map(Category::name).orElse("默认分类");
    }

    private Integer nextCategorySort(Long merchantId) {
        Long count = categoryMapper.selectCount(Wrappers.<CategoryEntity>lambdaQuery().eq(CategoryEntity::getMerchantId, merchantId));
        return count.intValue() + 1;
    }

    private void ensureSingleMerchantCart(Long userId, Long merchantId) {
        List<CartItemEntity> existingItems = cartItemMapper.selectList(Wrappers.<CartItemEntity>lambdaQuery()
                .eq(CartItemEntity::getUserId, userId));
        for (CartItemEntity item : existingItems) {
            DishEntity existingDish = dishMapper.selectById(item.getDishId());
            if (existingDish != null && !merchantId.equals(existingDish.getMerchantId())) {
                throw new BizException("购物车已有其他商家商品，请先清空购物车");
            }
        }
    }

    private List<Map<String, Object>> marketingActivities(Long merchantId) {
        LambdaQueryWrapper<MarketingActivityEntity> query = Wrappers.<MarketingActivityEntity>lambdaQuery()
                .orderByDesc(MarketingActivityEntity::getStartTime);
        if (merchantId == null) {
            query.and(wrapper -> wrapper.isNull(MarketingActivityEntity::getMerchantId)
                    .or()
                    .eq(MarketingActivityEntity::getMerchantId, 0L));
        } else {
            query.eq(MarketingActivityEntity::getMerchantId, merchantId);
        }
        return marketingActivityMapper.selectList(query).stream().map(this::marketingActivityMap).toList();
    }

    private MarketingActivityEntity toMarketingActivity(Map<String, Object> body) {
        String name = String.valueOf(body.getOrDefault("name", "")).trim();
        if (name.isBlank()) {
            throw new BizException("活动名称不能为空");
        }
        MarketingActivityEntity activity = new MarketingActivityEntity();
        activity.setName(name);
        activity.setType(String.valueOf(body.getOrDefault("type", "coupon")));
        activity.setStatus(String.valueOf(body.getOrDefault("status", "enabled")));
        activity.setStartTime(parseTime(body.get("startTime")));
        activity.setEndTime(parseTime(body.get("endTime")));
        return activity;
    }

    private Long parseLongValue(Object value, Long defaultValue) {
        if (value == null || String.valueOf(value).isBlank()) {
            return defaultValue;
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException ex) {
            throw new BizException("商家编号不合法");
        }
    }

    private LocalDateTime parseTime(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        String text = String.valueOf(value).replace(' ', 'T');
        if (text.length() == 10) {
            text = text + "T00:00:00";
        }
        return LocalDateTime.parse(text);
    }

    private Map<String, Object> marketingActivityMap(MarketingActivityEntity activity) {
        return Map.of(
                "id", activity.getId(),
                "merchantId", activity.getMerchantId() == null ? 0L : activity.getMerchantId(),
                "name", activity.getName(),
                "type", activity.getType(),
                "status", activity.getStatus(),
                "startTime", activity.getStartTime() == null ? "" : activity.getStartTime(),
                "endTime", activity.getEndTime() == null ? "" : activity.getEndTime()
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

    private LocalDateTime todayStart() {
        return LocalDateTime.now().toLocalDate().atStartOfDay();
    }

    private LocalDateTime tomorrowStart() {
        return todayStart().plusDays(1);
    }

    private BigDecimal sumPaid(List<DeliveryOrderEntity> orders) {
        return orders.stream()
                .filter(order -> !WAIT_PAY.equals(order.getStatus()))
                .filter(order -> !CANCELED.equals(order.getStatus()))
                .map(DeliveryOrderEntity::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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

    private void restoreStock(String orderId) {
        List<OrderItemEntity> items = orderItemMapper.selectList(Wrappers.<OrderItemEntity>lambdaQuery()
                .eq(OrderItemEntity::getOrderId, orderId));
        for (OrderItemEntity item : items) {
            if (item.getDishId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }
            dishMapper.update(null, Wrappers.<DishEntity>lambdaUpdate()
                    .setSql("stock = stock + " + item.getQuantity())
                    .eq(DishEntity::getId, item.getDishId()));
        }
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

    private void incrementCartItem(Long userId, DishEntity dish, int quantity) {
        cartItemMapper.update(null, Wrappers.<CartItemEntity>lambdaUpdate()
                .setSql("quantity = quantity + " + quantity)
                .set(CartItemEntity::getDishName, dish.getName())
                .set(CartItemEntity::getPrice, dish.getPrice())
                .eq(CartItemEntity::getUserId, userId)
                .eq(CartItemEntity::getDishId, dish.getId()));
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
        return new Order(entity.getId(), entity.getMerchantId(), merchantName, entity.getStatus(), entity.getTotalAmount(), entity.getAddress(), entity.getRemark(), entity.getPayMethod(), entity.getCouponId(), entity.getDiscountAmount(), entity.getCreateTime());
    }

    private Merchant toMerchant(MerchantEntity entity) {
        return new Merchant(entity.getId(), entity.getName(), entity.getCategory(), entity.getRating(), "800m", "25分钟");
    }

    private Dish toDish(DishEntity entity) {
        return new Dish(entity.getId(), entity.getMerchantId(), entity.getName(), entity.getDescription(), entity.getPrice(), entity.getStock(), entity.getCategoryName(), entity.getStatus());
    }

    private CartItem toCartItem(CartItemEntity entity) {
        DishEntity dish = entity.getDishId() == null ? null : dishMapper.selectById(entity.getDishId());
        MerchantEntity merchant = dish == null || dish.getMerchantId() == null ? null : merchantMapper.selectById(dish.getMerchantId());
        return new CartItem(entity.getDishId(), entity.getDishName(), entity.getQuantity(), entity.getPrice(), dish == null ? null : dish.getMerchantId(), merchant == null ? null : merchant.getName());
    }

    private Category toCategory(CategoryEntity entity) {
        return new Category(entity.getId(), entity.getMerchantId(), entity.getName(), entity.getSort());
    }

    private Address toAddress(UserAddressEntity entity) {
        return new Address(entity.getId(), entity.getReceiver(), entity.getPhone(), entity.getDetail(), Boolean.TRUE.equals(entity.getIsDefault()));
    }

    private Coupon toCoupon(CouponEntity entity) {
        String status = "enabled".equals(entity.getStatus()) ? "可使用" : entity.getStatus();
        return new Coupon(entity.getId(), entity.getName(), entity.getThresholdAmount(), entity.getDiscountAmount(), status);
    }

    private Review toReview(ReviewEntity entity) {
        return new Review(entity.getId(), entity.getOrderId(), entity.getRating(), entity.getContent(), entity.getReply());
    }

    private String nextOrderId() {
        int suffix = RANDOM.nextInt(10000);
        return "CY" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")) + String.format("%04d", suffix);
    }
}
