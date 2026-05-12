package com.chengyiwaimai.task;

import com.chengyiwaimai.service.DemoStore;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderTimeoutTask {
    private final DemoStore store;

    public OrderTimeoutTask(DemoStore store) {
        this.store = store;
    }

    @Scheduled(fixedDelay = 60000)
    public void scanTimeoutOrders() {
        store.cancelTimeoutUnpaidOrders();
    }
}
