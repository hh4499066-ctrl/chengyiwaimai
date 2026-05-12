package com.chengyiwaimai.task;

import com.chengyiwaimai.service.DemoStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderTimeoutTask {
    private static final Logger log = LoggerFactory.getLogger(OrderTimeoutTask.class);

    private final DemoStore store;

    public OrderTimeoutTask(DemoStore store) {
        this.store = store;
    }

    @Scheduled(fixedDelay = 60000)
    public void scanTimeoutOrders() {
        int canceled = store.cancelTimeoutUnpaidOrders();
        if (canceled > 0) {
            log.info("Canceled {} timeout unpaid orders", canceled);
        }
    }
}
